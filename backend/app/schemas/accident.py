"""
Pydantic schemas for accident records, filters, and paginated responses.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class AccidentRecordBase(BaseModel):
    accident_index: str
    accident_date: str
    accident_time: str
    day_of_week: str
    urban_or_rural_area: str
    road_type: str
    road_class: str
    speed_limit: int
    weather_conditions: str
    road_surface_conditions: str
    light_conditions: str
    junction_detail: str
    number_of_vehicles: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    region: Optional[str] = None
    accident_severity: str
    is_synthetic: bool = False


class AccidentRecordCreate(AccidentRecordBase):
    pass


class AccidentRecordOut(AccidentRecordBase):
    id: int

    class Config:
        from_attributes = True


class PaginatedAccidentsResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    records: List[AccidentRecordOut]
