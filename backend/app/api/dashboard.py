"""
Dashboard Overview API endpoints for road safety analytics.
"""
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.db.session import get_db
from backend.app.db.models import AccidentRecord, ExperimentRecord

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary")
def get_dashboard_summary(
    severity: Optional[str] = Query(None),
    road_type: Optional[str] = Query(None),
    weather: Optional[str] = Query(None),
    urban_rural: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(AccidentRecord)
    
    if severity:
        query = query.filter(AccidentRecord.accident_severity == severity)
    if road_type:
        query = query.filter(AccidentRecord.road_type == road_type)
    if weather:
        query = query.filter(AccidentRecord.weather_conditions == weather)
    if urban_rural:
        query = query.filter(AccidentRecord.urban_or_rural_area == urban_rural)
        
    total_records = query.count()
    
    # Severity distribution
    sev_counts = (
        query.with_entities(AccidentRecord.accident_severity, func.count(AccidentRecord.id))
        .group_by(AccidentRecord.accident_severity)
        .all()
    )
    sev_dict = {s: count for s, count in sev_counts}
    slight_count = sev_dict.get("Slight", 0)
    serious_count = sev_dict.get("Serious", 0)
    fatal_count = sev_dict.get("Fatal", 0)
    
    serious_fatal_pct = round(
        ((serious_count + fatal_count) / max(total_records, 1)) * 100, 2
    )
    
    # Accidents by Road Type
    road_type_counts = (
        query.with_entities(AccidentRecord.road_type, func.count(AccidentRecord.id))
        .group_by(AccidentRecord.road_type)
        .order_by(func.count(AccidentRecord.id).desc())
        .all()
    )
    
    # Accidents by Weather
    weather_counts = (
        query.with_entities(AccidentRecord.weather_conditions, func.count(AccidentRecord.id))
        .group_by(AccidentRecord.weather_conditions)
        .order_by(func.count(AccidentRecord.id).desc())
        .all()
    )
    
    # Accidents by Light Conditions
    light_counts = (
        query.with_entities(AccidentRecord.light_conditions, func.count(AccidentRecord.id))
        .group_by(AccidentRecord.light_conditions)
        .order_by(func.count(AccidentRecord.id).desc())
        .all()
    )
    
    # Accidents by Day of Week
    dow_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    dow_raw = (
        query.with_entities(AccidentRecord.day_of_week, func.count(AccidentRecord.id))
        .group_by(AccidentRecord.day_of_week)
        .all()
    )
    dow_dict = {d: count for d, count in dow_raw}
    dow_counts = [{"day": d, "count": dow_dict.get(d, 0)} for d in dow_order]
    
    # Top Performing Model Benchmark
    best_model = (
        db.query(ExperimentRecord)
        .order_by(ExperimentRecord.macro_f1.desc())
        .first()
    )
    
    model_summary = None
    if best_model:
        model_summary = {
            "experiment_id": best_model.experiment_id,
            "experiment_name": best_model.experiment_name,
            "algorithm": best_model.algorithm,
            "accuracy": best_model.accuracy,
            "macro_f1": best_model.macro_f1,
            "fatal_recall": best_model.fatal_recall,
            "roc_auc": best_model.roc_auc_ovr
        }
        
    return {
        "total_records": total_records,
        "severity_distribution": {
            "Slight": slight_count,
            "Serious": serious_count,
            "Fatal": fatal_count
        },
        "proportions": {
            "slight_pct": round((slight_count / max(total_records, 1)) * 100, 1),
            "serious_pct": round((serious_count / max(total_records, 1)) * 100, 1),
            "fatal_pct": round((fatal_count / max(total_records, 1)) * 100, 1),
            "serious_fatal_combined_pct": serious_fatal_pct
        },
        "by_road_type": [{"category": r, "count": c} for r, c in road_type_counts],
        "by_weather": [{"category": w, "count": c} for w, c in weather_counts],
        "by_lighting": [{"category": l, "count": c} for l, c in light_counts],
        "by_day_of_week": dow_counts,
        "best_model_summary": model_summary
    }
