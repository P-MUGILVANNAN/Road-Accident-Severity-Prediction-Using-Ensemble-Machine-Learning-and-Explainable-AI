"""
Schemas for training requests, benchmarks, and model evaluation metrics.
"""
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class ModelTrainRequest(BaseModel):
    algorithm: str = Field(default="Ensemble (Soft Voting)")
    imbalance_strategy: str = Field(default="class_weight")
    random_seed: int = Field(default=42)


class PerClassMetric(BaseModel):
    precision: float
    recall: float
    f1_score: float
    support: int


class ModelMetrics(BaseModel):
    accuracy: float
    macro_precision: float
    macro_recall: float
    macro_f1: float
    weighted_precision: float
    weighted_recall: float
    weighted_f1: float
    per_class: Dict[str, PerClassMetric]
    confusion_matrix: List[List[int]]
    roc_auc_ovr: Optional[float] = None
    log_loss: Optional[float] = None


class ExperimentOut(BaseModel):
    id: int
    experiment_id: str
    experiment_name: str
    algorithm: str
    imbalance_strategy: str
    accuracy: float
    macro_f1: float
    weighted_f1: float
    fatal_recall: float
    roc_auc_ovr: Optional[float] = None
    metrics_json: Dict[str, Any]

    class Config:
        from_attributes = True
