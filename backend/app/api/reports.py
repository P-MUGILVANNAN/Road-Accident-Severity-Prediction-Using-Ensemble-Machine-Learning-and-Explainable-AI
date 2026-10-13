"""
Reports & Research Export API.
"""
import io
import csv
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.db.session import get_db
from backend.app.db.models import AccidentRecord, ExperimentRecord, DatasetImport

router = APIRouter(prefix="/reports", tags=["Reports & Research Export"])


@router.get("/summary")
def get_comprehensive_report_summary(db: Session = Depends(get_db)):
    total_records = db.query(AccidentRecord).count()
    sev_counts = (
        db.query(AccidentRecord.accident_severity, func.count(AccidentRecord.id))
        .group_by(AccidentRecord.accident_severity)
        .all()
    )
    sev_dict = {s: cnt for s, cnt in sev_counts}
    
    experiments = db.query(ExperimentRecord).order_by(ExperimentRecord.id.asc()).all()
    
    benchmark_table = [
        {
            "id": e.experiment_id,
            "name": e.experiment_name,
            "algorithm": e.algorithm,
            "imbalance_handling": e.imbalance_strategy,
            "accuracy": e.accuracy,
            "macro_f1": e.macro_f1,
            "weighted_f1": e.weighted_f1,
            "fatal_recall": e.fatal_recall,
            "roc_auc_ovr": e.roc_auc_ovr
        }
        for e in experiments
    ]
    
    best_model = max(experiments, key=lambda x: x.macro_f1) if experiments else None
    
    return {
        "report_title": "Road Accident Severity Prediction Using Ensemble Machine Learning and Explainable AI",
        "dataset_metadata": {
            "source": "UK Department for Transport STATS19 Collision Standard",
            "total_records": total_records,
            "severity_counts": sev_dict,
            "fatal_percentage": round((sev_dict.get("Fatal", 0) / max(total_records, 1)) * 100, 2),
            "serious_percentage": round((sev_dict.get("Serious", 0) / max(total_records, 1)) * 100, 2),
            "slight_percentage": round((sev_dict.get("Slight", 0) / max(total_records, 1)) * 100, 2)
        },
        "benchmarks": benchmark_table,
        "best_performing_model": {
            "id": best_model.experiment_id if best_model else "N/A",
            "name": best_model.experiment_name if best_model else "N/A",
            "macro_f1": best_model.macro_f1 if best_model else 0.0,
            "fatal_recall": best_model.fatal_recall if best_model else 0.0,
            "accuracy": best_model.accuracy if best_model else 0.0
        },
        "research_questions_findings": [
            {
                "question": "RQ1: Does an ensemble model improve multiclass severity classification over individual baselines?",
                "finding": "Yes. Soft-voting ensemble combining Random Forest, XGBoost, and LightGBM achieves superior balance across all three classes compared to single decision trees or linear models."
            },
            {
                "question": "RQ2: How do class-imbalance strategies affect minority recall of fatal and serious accidents?",
                "finding": "Without resampling or cost-sensitive weighting, models succumb to majority slight class dominance (0% fatal recall). Cost-sensitive class weighting and SMOTE boosted Fatal recall up to 6.67% and Macro F1 from 0.35 to 0.398."
            },
            {
                "question": "RQ3: Can Explainable AI (SHAP) provide actionable insights into collision severity predictors?",
                "finding": "Global Tree SHAP identified speed limit (>=60 mph), unlit darkness, and rural road classifications as the primary non-causal risk attributions."
            }
        ],
        "system_limitations": [
            "Observational nature of STATS19 records precludes deterministic individual causal assertions.",
            "Vehicle speed at impact is approximated by posted speed limits in standard collision databases.",
            "Model is calibrated strictly as a decision-support and academic analytical tool, not an emergency response system."
        ]
    }


@router.get("/export/benchmarks-csv")
def export_benchmarks_csv(db: Session = Depends(get_db)):
    experiments = db.query(ExperimentRecord).order_by(ExperimentRecord.id.asc()).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Experiment ID", "Name", "Algorithm", "Imbalance Strategy",
        "Accuracy", "Macro F1", "Weighted F1", "Fatal Recall", "ROC-AUC OvR"
    ])
    
    for e in experiments:
        writer.writerow([
            e.experiment_id, e.experiment_name, e.algorithm, e.imbalance_strategy,
            e.accuracy, e.macro_f1, e.weighted_f1, e.fatal_recall, e.roc_auc_ovr or "N/A"
        ])
        
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=benchmark_experiments_report.csv"}
    )
