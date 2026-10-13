"""
Explainable AI (SHAP) Endpoints for Model Interpretability.
"""
import os
import logging
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException
import pandas as pd

from backend.app.schemas.prediction import SinglePredictionRequest
from backend.app.core.config import MODELS_DIR, DATA_DIR
from backend.ml.explainability import AccidentExplainer

router = APIRouter(prefix="/explanations", tags=["Explainable AI"])
logger = logging.getLogger(__name__)

# Cache active explainer
_explainer_cache = None


def get_explainer():
    global _explainer_cache
    if _explainer_cache is None:
        model_path = os.path.join(MODELS_DIR, "ensemble_soft_voting_class_weight.joblib")
        if not os.path.exists(model_path):
            # Fallback to any joblib in models
            import glob
            files = glob.glob(os.path.join(MODELS_DIR, "*.joblib"))
            if not files:
                raise RuntimeError("No model artifact found for explainer initialization.")
            model_path = files[0]
        _explainer_cache = AccidentExplainer(model_path)
    return _explainer_cache


@router.post("/instance")
def explain_single_prediction(payload: SinglePredictionRequest):
    try:
        explainer = get_explainer()
        input_dict = payload.model_dump()
        result = explainer.explain_instance(input_dict)
        return {
            "predicted_severity": result["predicted_severity"],
            "probabilities": result["probabilities"],
            "base_value": result["base_value"],
            "top_contributions": result["top_factors"],
            "interpretability_notice": (
                "SHAP local attribution explains the marginal contribution of each variable "
                "to this model output relative to the expected dataset baseline. It does not establish causal proof."
            )
        }
    except Exception as e:
        logger.error(f"Error computing local SHAP: {e}")
        raise HTTPException(status_code=500, detail=f"Explanation generation failed: {str(e)}")


@router.get("/global")
def get_global_explanations():
    try:
        explainer = get_explainer()
        csv_path = DATA_DIR / "uk_accidents_stats19.csv"
        df = pd.read_csv(csv_path)
        global_data = explainer.compute_global_importance(df, n_samples=250)
        return {
            "algorithm": global_data["algorithm"],
            "samples_analyzed": global_data["sample_size"],
            "feature_rankings": global_data["rankings"],
            "methodology": "Kernel / Tree SHAP (SHapley Additive exPlanations) across multiclass severity dimensions."
        }
    except Exception as e:
        logger.error(f"Error computing global SHAP: {e}")
        raise HTTPException(status_code=500, detail=f"Global explanation failed: {str(e)}")
