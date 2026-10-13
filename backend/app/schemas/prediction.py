"""
Pydantic schemas for severity prediction and probability distribution outputs.
"""
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class SinglePredictionRequest(BaseModel):
    speed_limit: int = Field(default=30, ge=10, le=80, description="Speed limit in mph")
    road_type: str = Field(default="Single carriageway")
    road_class: str = Field(default="A")
    urban_or_rural_area: str = Field(default="Urban")
    weather_conditions: str = Field(default="Fine no high winds")
    road_surface_conditions: str = Field(default="Dry")
    light_conditions: str = Field(default="Daylight")
    junction_detail: str = Field(default="Not at junction")
    number_of_vehicles: int = Field(default=2, ge=1, le=10)
    accident_time: str = Field(default="14:30")
    day_of_week: str = Field(default="Wednesday")
    accident_date: Optional[str] = Field(default="2023-06-15")


class Probabilities(BaseModel):
    Slight: float
    Serious: float
    Fatal: float


class SinglePredictionResponse(BaseModel):
    predicted_severity: str
    confidence: float
    probabilities: Probabilities
    model_algorithm: Optional[str] = None
    model_strategy: Optional[str] = None
    disclaimer: str = (
        "Decision-Support & Research Notice: Model predictions represent statistical estimations "
        "calibrated on historical accident patterns and must not be used as an emergency response system."
    )


class BatchPredictionRecord(BaseModel):
    accident_index: str
    predicted_severity: str
    confidence: float
    probabilities: Probabilities


class BatchPredictionResponse(BaseModel):
    total_processed: int
    predictions: List[BatchPredictionRecord]
