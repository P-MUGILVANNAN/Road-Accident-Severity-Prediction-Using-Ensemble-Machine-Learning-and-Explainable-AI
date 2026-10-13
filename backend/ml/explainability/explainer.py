"""
Explainable AI (XAI) Engine using SHAP for Global and Local Interpretability.
"""
import os
import logging
from typing import Dict, Any, List, Optional
import joblib
import numpy as np
import pandas as pd
import shap

from backend.ml.preprocessing import TARGET_INV_MAPPING, TARGET_MAPPING

logger = logging.getLogger(__name__)


class AccidentExplainer:
    """
    Manages SHAP tree explainers and local/global interpretability diagnostics.
    """
    def __init__(self, model_bundle_path: str):
        if not os.path.exists(model_bundle_path):
            raise FileNotFoundError(f"Model bundle not found at {model_bundle_path}")
            
        self.bundle = joblib.load(model_bundle_path)
        self.clf = self.bundle["classifier"]
        self.fe = self.bundle["feature_engineer"]
        self.preprocessor = self.bundle["preprocessor"]
        self.feature_names = self.bundle["feature_names"]
        self.algorithm = self.bundle["algorithm"]
        
        # Pick the core tree model if it's a VotingClassifier
        if hasattr(self.clf, "estimators_"):
            # Use XGBoost or Random Forest estimator from the ensemble for fast, exact TreeExplainer
            self.explain_model = self.clf.estimators_[1]  # XGBoost
        else:
            self.explain_model = self.clf
            
        try:
            self.explainer = shap.TreeExplainer(self.explain_model)
        except Exception as e:
            logger.warning(f"TreeExplainer fallback: {e}")
            self.explainer = shap.Explainer(self.explain_model)

    def explain_instance(self, raw_input_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates local feature impact explanation for a single prediction instance.
        """
        df_single = pd.DataFrame([raw_input_dict])
        df_eng = self.fe.transform(df_single)
        X_trans = self.preprocessor.transform(df_eng)
        
        # Prediction & Probabilities
        probs = self.clf.predict_proba(X_trans)[0]
        pred_idx = int(np.argmax(probs))
        pred_class = TARGET_INV_MAPPING[pred_idx]
        
        # SHAP calculation
        shap_values = self.explainer.shap_values(X_trans)
        
        # Format SHAP values based on multiclass output structure
        # TreeExplainer on XGBoost returns array of shape (n_samples, n_features, n_classes) or list of arrays
        if isinstance(shap_values, list):
            class_shap = shap_values[pred_idx][0]
        elif len(shap_values.shape) == 3:
            class_shap = shap_values[0, :, pred_idx]
        else:
            class_shap = shap_values[0]
            
        # Top positive and negative contributors
        contributions = []
        for feat_name, val, impact in zip(self.feature_names, X_trans[0], class_shap):
            contributions.append({
                "feature": feat_name,
                "feature_value": round(float(val), 3),
                "shap_value": round(float(impact), 4),
                "direction": "increases_risk" if impact > 0 else "decreases_risk",
                "abs_impact": abs(float(impact))
            })
            
        contributions.sort(key=lambda x: x["abs_impact"], reverse=True)
        top_factors = contributions[:10]
        
        return {
            "predicted_severity": pred_class,
            "probabilities": {
                "Slight": round(float(probs[0]), 4),
                "Serious": round(float(probs[1]), 4),
                "Fatal": round(float(probs[2]), 4)
            },
            "top_factors": top_factors,
            "base_value": float(self.explainer.expected_value[pred_idx]) if hasattr(self.explainer.expected_value, "__len__") else float(self.explainer.expected_value)
        }

    def compute_global_importance(self, df_sample: pd.DataFrame, n_samples: int = 300) -> Dict[str, Any]:
        """
        Computes global mean absolute SHAP importances across classes.
        """
        sample_df = df_sample.head(n_samples)
        df_eng = self.fe.transform(sample_df)
        X_trans = self.preprocessor.transform(df_eng)
        
        shap_vals = self.explainer.shap_values(X_trans)
        
        # Compute mean |SHAP| per feature
        if isinstance(shap_vals, list):
            # List of (n_samples, n_features) per class
            per_class_imp = {}
            for c_idx, c_name in enumerate(["Slight", "Serious", "Fatal"]):
                per_class_imp[c_name] = np.mean(np.abs(shap_vals[c_idx]), axis=0)
            overall_imp = np.mean([per_class_imp[c] for c in per_class_imp], axis=0)
        elif len(shap_vals.shape) == 3:
            # (n_samples, n_features, n_classes)
            per_class_imp = {
                "Slight": np.mean(np.abs(shap_vals[:, :, 0]), axis=0),
                "Serious": np.mean(np.abs(shap_vals[:, :, 1]), axis=0),
                "Fatal": np.mean(np.abs(shap_vals[:, :, 2]), axis=0)
            }
            overall_imp = np.mean(np.abs(shap_vals), axis=(0, 2))
        else:
            overall_imp = np.mean(np.abs(shap_vals), axis=0)
            per_class_imp = {"General": overall_imp}
            
        global_rankings = []
        for idx, f_name in enumerate(self.feature_names):
            global_rankings.append({
                "feature": f_name,
                "importance": round(float(overall_imp[idx]), 4),
                "fatal_importance": round(float(per_class_imp.get("Fatal", overall_imp)[idx]), 4),
                "serious_importance": round(float(per_class_imp.get("Serious", overall_imp)[idx]), 4),
                "slight_importance": round(float(per_class_imp.get("Slight", overall_imp)[idx]), 4)
            })
            
        global_rankings.sort(key=lambda x: x["importance"], reverse=True)
        
        return {
            "algorithm": self.algorithm,
            "sample_size": len(sample_df),
            "rankings": global_rankings[:20]
        }
