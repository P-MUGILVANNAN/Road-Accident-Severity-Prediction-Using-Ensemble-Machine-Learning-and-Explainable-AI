"""
Accident Records Management, CSV Ingestion, and Schema Validation.
"""
import io
import csv
from typing import Optional, List, Dict, Any
import pandas as pd
from fastapi import APIRouter, Depends, Query, UploadFile, File, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc

from backend.app.db.session import get_db
from backend.app.db.models import AccidentRecord, DatasetImport, AuditEvent
from backend.app.schemas.accident import PaginatedAccidentsResponse, AccidentRecordOut
from backend.ml.data import validate_dataset_schema

router = APIRouter(prefix="/accidents", tags=["Accident Records"])


@router.get("", response_model=PaginatedAccidentsResponse)
def list_accidents(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=5, le=100),
    search: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    road_type: Optional[str] = Query(None),
    weather: Optional[str] = Query(None),
    urban_rural: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("accident_date"),
    order: Optional[str] = Query("desc"),
    db: Session = Depends(get_db)
):
    query = db.query(AccidentRecord)
    
    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                AccidentRecord.accident_index.ilike(term),
                AccidentRecord.region.ilike(term),
                AccidentRecord.road_type.ilike(term),
                AccidentRecord.weather_conditions.ilike(term)
            )
        )
    if severity:
        query = query.filter(AccidentRecord.accident_severity == severity)
    if road_type:
        query = query.filter(AccidentRecord.road_type == road_type)
    if weather:
        query = query.filter(AccidentRecord.weather_conditions == weather)
    if urban_rural:
        query = query.filter(AccidentRecord.urban_or_rural_area == urban_rural)
    if region:
        query = query.filter(AccidentRecord.region == region)
        
    total = query.count()
    
    # Sort
    col_attr = getattr(AccidentRecord, sort_by, AccidentRecord.accident_date)
    query = query.order_by(desc(col_attr) if order == "desc" else asc(col_attr))
    
    # Paginate
    offset = (page - 1) * page_size
    records = query.offset(offset).limit(page_size).all()
    total_pages = (total + page_size - 1) // page_size
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "records": records
    }


@router.get("/{accident_id}", response_model=AccidentRecordOut)
def get_accident_detail(accident_id: int, db: Session = Depends(get_db)):
    rec = db.query(AccidentRecord).filter(AccidentRecord.id == accident_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Accident record not found.")
    return rec


@router.get("/export/csv")
def export_accidents_csv(
    severity: Optional[str] = Query(None),
    limit: int = Query(5000, le=10000),
    db: Session = Depends(get_db)
):
    query = db.query(AccidentRecord)
    if severity:
        query = query.filter(AccidentRecord.accident_severity == severity)
    records = query.limit(limit).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "accident_index", "accident_date", "accident_time", "day_of_week",
        "urban_or_rural_area", "road_type", "road_class", "speed_limit",
        "weather_conditions", "road_surface_conditions", "light_conditions",
        "junction_detail", "number_of_vehicles", "latitude", "longitude",
        "region", "accident_severity"
    ])
    
    for r in records:
        writer.writerow([
            r.accident_index, r.accident_date, r.accident_time, r.day_of_week,
            r.urban_or_rural_area, r.road_type, r.road_class, r.speed_limit,
            r.weather_conditions, r.road_surface_conditions, r.light_conditions,
            r.junction_detail, r.number_of_vehicles, r.latitude, r.longitude,
            r.region, r.accident_severity
        ])
        
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=stats19_accidents_export.csv"}
    )


@router.post("/upload/csv")
async def upload_accidents_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported format. Only valid CSV files are accepted."
        )
        
    contents = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {str(e)}")
        
    report = validate_dataset_schema(df)
    
    if not report["valid"]:
        return {
            "success": False,
            "filename": file.filename,
            "report": report,
            "message": "Dataset schema validation failed. Required columns missing."
        }
        
    # Ingest validated records safely
    is_demo = "SYN" in str(df["accident_index"].iloc[0]) if len(df) > 0 else False
    new_records = []
    
    existing_indices = set(
        x[0] for x in db.query(AccidentRecord.accident_index).all()
    )
    
    for _, row in df.iterrows():
        idx = str(row["accident_index"])
        if idx in existing_indices:
            continue
        new_records.append(AccidentRecord(
            accident_index=idx,
            accident_date=str(row["accident_date"]),
            accident_time=str(row["accident_time"]),
            day_of_week=str(row["day_of_week"]),
            urban_or_rural_area=str(row["urban_or_rural_area"]),
            road_type=str(row["road_type"]),
            road_class=str(row["road_class"]),
            speed_limit=int(row["speed_limit"]),
            weather_conditions=str(row["weather_conditions"]),
            road_surface_conditions=str(row["road_surface_conditions"]),
            light_conditions=str(row["light_conditions"]),
            junction_detail=str(row["junction_detail"]),
            number_of_vehicles=int(row["number_of_vehicles"]),
            latitude=float(row["latitude"]) if pd.notnull(row.get("latitude")) else None,
            longitude=float(row["longitude"]) if pd.notnull(row.get("longitude")) else None,
            region=str(row.get("region", "Imported")),
            accident_severity=str(row["accident_severity"]),
            is_synthetic=is_demo
        ))
        
    if new_records:
        db.bulk_save_objects(new_records)
        db.commit()
        
    # Log import record
    import_audit = DatasetImport(
        filename=file.filename,
        record_count=len(new_records),
        quality_score=report["quality_score"],
        status="SUCCESS",
        summary_json=report
    )
    db.add(import_audit)
    db.add(AuditEvent(
        action="DATASET_UPLOAD",
        details=f"Uploaded '{file.filename}', inserted {len(new_records)} records. Quality score: {report['quality_score']}%"
    ))
    db.commit()
    
    return {
        "success": True,
        "filename": file.filename,
        "records_imported": len(new_records),
        "quality_score": report["quality_score"],
        "report": report
    }
