"""
Model Evaluation Metrics and Multiclass Diagnostic Module.
"""
import logging
from typing import Dict, Any, List, Optional
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    confusion_matrix,
    roc_auc_score,
    log_loss
)

logger = logging.getLogger(__name__)

CLASS_NAMES = ["Slight", "Serious", "Fatal"]


def evaluate_multiclass_model(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_prob: Optional[np.ndarray] = None
) -> Dict[str, Any]:
    """
    Computes comprehensive multiclass diagnostic metrics for accident severity.
    Includes macro/weighted scores, per-class sensitivity/recall, and ROC-AUC.
    """
    acc = float(accuracy_score(y_true, y_pred))
    
    # Macro metrics
    p_macro, r_macro, f1_macro, _ = precision_recall_fscore_support(
        y_true, y_pred, average="macro", zero_division=0
    )
    
    # Weighted metrics
    p_weighted, r_weighted, f1_weighted, _ = precision_recall_fscore_support(
        y_true, y_pred, average="weighted", zero_division=0
    )
    
    # Per-class metrics
    p_per, r_per, f1_per, sup_per = precision_recall_fscore_support(
        y_true, y_pred, average=None, zero_division=0
    )
    
    per_class = {}
    for idx, cname in enumerate(CLASS_NAMES):
        per_class[cname] = {
            "precision": round(float(p_per[idx]), 4),
            "recall": round(float(r_per[idx]), 4),
            "f1_score": round(float(f1_per[idx]), 4),
            "support": int(sup_per[idx])
        }
        
    cm = confusion_matrix(y_true, y_pred, labels=[0, 1, 2]).tolist()
    
    metrics: Dict[str, Any] = {
        "accuracy": round(acc, 4),
        "macro_precision": round(float(p_macro), 4),
        "macro_recall": round(float(r_macro), 4),
        "macro_f1": round(float(f1_macro), 4),
        "weighted_precision": round(float(p_weighted), 4),
        "weighted_recall": round(float(r_weighted), 4),
        "weighted_f1": round(float(f1_weighted), 4),
        "per_class": per_class,
        "confusion_matrix": cm,
        "classes": CLASS_NAMES
    }
    
    if y_prob is not None:
        try:
            # One-vs-Rest multiclass ROC-AUC
            roc_auc = float(roc_auc_score(y_true, y_prob, multi_class="ovr", average="macro"))
            metrics["roc_auc_ovr"] = round(roc_auc, 4)
        except Exception as e:
            logger.warning(f"Could not compute ROC-AUC: {e}")
            metrics["roc_auc_ovr"] = None
            
        try:
            loss = float(log_loss(y_true, y_prob))
            metrics["log_loss"] = round(loss, 4)
        except Exception as e:
            metrics["log_loss"] = None
            
    return metrics
