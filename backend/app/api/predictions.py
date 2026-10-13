"""
Accident Severity Prediction Endpoints for Single and Batch Inference.
"""
import io
import datetime
from typing import List, Dict, Any, Optional
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.db.models import PredictionRecord
from backend.app.schemas.prediction import (
    SinglePredictionRequest,
    SinglePredictionResponse,
    Probabilities,
    BatchPredictionResponse,
    BatchPredictionRecord
)
from backend.app.core.config import MODELS_DIR
from backend.ml.prediction import AccidentPredictionService

router = APIRouter(prefix="/predictions", tags=["Severity Predictions"])

# Initialize prediction service
pred_service = AccidentPredictionService(str(MODELS_DIR))


@router.post("/severity", response_model=SinglePredictionResponse)
def predict_single_severity(
    payload: SinglePredictionRequest,
    db: Session = Depends(get_db)
):
    try:
        input_data = payload.model_dump()
        result = pred_service.predict_single(input_data)
        
        # Persist prediction in database audit trail
        rec = PredictionRecord(
            input_features=input_data,
            predicted_severity=result["predicted_severity"],
            slight_prob=result["probabilities"]["Slight"],
            serious_prob=result["probabilities"]["Serious"],
            fatal_prob=result["probabilities"]["Fatal"],
            confidence=result["confidence"],
            model_name=result.get("model_algorithm", "Ensemble"),
            timestamp=datetime.datetime.utcnow()
        )
        db.add(rec)
        db.commit()
        
        return SinglePredictionResponse(
            predicted_severity=result["predicted_severity"],
            confidence=result["confidence"],
            probabilities=Probabilities(**result["probabilities"]),
            model_algorithm=result.get("model_algorithm"),
            model_strategy=result.get("model_strategy")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")


@router.post("/batch", response_model=BatchPredictionResponse)
async def predict_batch_severity(
    file: UploadFile = File(...)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted for batch inference.")
        
    contents = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse CSV: {str(e)}")
        
    if len(df) == 0:
        raise HTTPException(status_code=400, detail="Uploaded CSV file is empty.")
        
    # Cap batch at 2000 for responsive web API
    df_proc = df.head(2000)
    batch_results = pred_service.predict_batch(df_proc)
    
    formatted_recs = [
        BatchPredictionRecord(
            accident_index=r["accident_index"],
            predicted_severity=r["predicted_severity"],
            confidence=r["confidence"],
            probabilities=Probabilities(**r["probabilities"])
        )
        for r in batch_results
    ]
    
    return BatchPredictionResponse(
        total_processed=len(formatted_recs),
        predictions=formatted_recs
    )


@router.get("/history")
def get_prediction_history(
    limit: int = 50,
    db: Session = Depends(get_db)
):
    recs = (
        db.query(PredictionRecord)
        .order_by(PredictionRecord.timestamp.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": r.id,
            "timestamp": r.timestamp.isoformat() if r.timestamp else None,
            "predicted_severity": r.predicted_severity,
            "confidence": r.confidence,
            "probabilities": {
                "Slight": r.slight_prob,
                "Serious": r.serious_prob,
                "Fatal": r.fatal_prob
            },
            "model_name": r.model_name,
            "input_summary": {
                "speed_limit": r.input_features.get("speed_limit"),
                "road_type": r.input_features.get("road_type"),
                "weather": r.input_features.get("weather_conditions"),
                "lighting": r.input_features.get("light_conditions")
            }
        }
        for r in recs
    ]
