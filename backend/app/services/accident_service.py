"""
Accident Domain Services for filtering, querying, and exporting accident records.
"""
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from backend.app.db.models import AccidentRecord


class AccidentService:
    @staticmethod
    def query_accidents(
        db: Session,
        page: int = 1,
        page_size: int = 25,
        search: Optional[str] = None,
        severity: Optional[str] = None,
        road_type: Optional[str] = None,
        weather: Optional[str] = None,
        urban_rural: Optional[str] = None,
        region: Optional[str] = None,
        sort_by: Optional[str] = "accident_date",
        order: Optional[str] = "desc"
    ) -> Dict[str, Any]:
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
        col_attr = getattr(AccidentRecord, sort_by, AccidentRecord.accident_date)
        query = query.order_by(desc(col_attr) if order == "desc" else asc(col_attr))

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
