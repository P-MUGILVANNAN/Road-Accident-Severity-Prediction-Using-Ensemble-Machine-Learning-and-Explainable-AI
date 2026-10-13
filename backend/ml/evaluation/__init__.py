"""
Model Diagnostic Evaluation subpackage.
"""
from backend.ml.evaluation.metrics import (
    evaluate_multiclass_model,
    CLASS_NAMES,
)

__all__ = [
    "evaluate_multiclass_model",
    "CLASS_NAMES",
]
