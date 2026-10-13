"""
Model Management, Training Trigger, and Benchmark Metrics API.
"""
import os
import json
import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
import pandas as pd

from backend.app.db.session import get_db
from backend.app.db.models import ExperimentRecord, AuditEvent
from backend.app.schemas.model import ModelTrainRequest, ExperimentOut
from backend.app.core.config import MODELS_DIR, DATA_DIR
from backend.ml.training import train_single_experiment

router = APIRouter(prefix="/models", tags=["Models & Training"])
logger = logging.getLogger(__name__)


def run_training_task(algorithm: str, imbalance_strategy: str, random_seed: int):
    """Background task function to train and record experiment without blocking API"""
    try:
        csv_path = DATA_DIR / "uk_accidents_stats19.csv"
        df = pd.read_csv(csv_path)
        
        from backend.app.db.session import SessionLocal
        db = SessionLocal()
        
        result = train_single_experiment(
            df=df,
            algorithm=algorithm,
            imbalance_strategy=imbalance_strategy,
            random_seed=random_seed,
            model_save_dir=str(MODELS_DIR)
        )
        
        exp_count = db.query(ExperimentRecord).count() + 1
        exp_id = f"EXP-{exp_count:02d}"
        
        exp_rec = ExperimentRecord(
            experiment_id=exp_id,
            experiment_name=f"{algorithm} ({imbalance_strategy}) - Custom Run",
            algorithm=algorithm,
            imbalance_strategy=imbalance_strategy,
            accuracy=result["metrics"]["accuracy"],
            macro_f1=result["metrics"]["macro_f1"],
            weighted_f1=result["metrics"]["weighted_f1"],
            fatal_recall=result["metrics"]["per_class"]["Fatal"]["recall"],
            roc_auc_ovr=result["metrics"].get("roc_auc_ovr"),
            metrics_json=result["metrics"],
            artifact_path=result.get("artifact_path")
        )
        db.add(exp_rec)
        db.add(AuditEvent(
            action="MODEL_TRAIN",
            details=f"Completed training {algorithm} with {imbalance_strategy}. Accuracy: {result['metrics']['accuracy']}, Macro F1: {result['metrics']['macro_f1']}"
        ))
        db.commit()
        db.close()
        logger.info(f"Custom model training completed for {algorithm}")
    except Exception as e:
        logger.error(f"Error in background training: {e}")


@router.get("/experiments", response_model=List[ExperimentOut])
def get_experiments(db: Session = Depends(get_db)):
    return db.query(ExperimentRecord).order_by(ExperimentRecord.id.asc()).all()


@router.get("/benchmarks")
def get_benchmark_summary():
    summary_path = MODELS_DIR / "benchmark_summary.json"
    if not os.path.exists(summary_path):
        return []
    with open(summary_path, "r") as f:
        return json.load(f)


@router.post("/train")
def train_model(
    req: ModelTrainRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    valid_algos = [
        "Logistic Regression", "Decision Tree", "Random Forest",
        "Extra Trees", "Gradient Boosting", "XGBoost", "LightGBM",
        "Ensemble (Soft Voting)"
    ]
    if req.algorithm not in valid_algos:
        raise HTTPException(status_code=400, detail=f"Invalid algorithm. Allowed: {valid_algos}")
        
    background_tasks.add_task(
        run_training_task,
        algorithm=req.algorithm,
        imbalance_strategy=req.imbalance_strategy,
        random_seed=req.random_seed
    )
    
    return {
        "status": "QUEUED",
        "message": f"Training job for '{req.algorithm}' ({req.imbalance_strategy}) has been scheduled in the background.",
        "parameters": req.model_dump()
    }
