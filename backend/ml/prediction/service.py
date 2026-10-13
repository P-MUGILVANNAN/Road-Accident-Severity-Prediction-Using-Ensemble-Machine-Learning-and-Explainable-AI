"""
Prediction Service for Single and Batch Inference.
"""
import os
import glob
import logging
from typing import Dict, Any, List, Optional
import joblib
import numpy as np
import pandas as pd

from backend.ml.preprocessing import TARGET_INV_MAPPING

logger = logging.getLogger(__name__)


class AccidentPredictionService:
    """
    Executes inference using the highest-performing serialized model artifact.
    """
    def __init__(self, models_dir: str):
        self.models_dir = models_dir
        self.active_model_path: Optional[str] = None
        self.bundle: Optional[Dict[str, Any]] = None
        self._load_best_or_default_model()

    def _load_best_or_default_model(self):
        # Look for ensemble first, then any joblib
        preferred_order = [
            "ensemble_soft_voting_class_weight.joblib",
            "ensemble_soft_voting_none.joblib",
            "ensemble_soft_voting_smote.joblib",
            "xgboost_classifier_none.joblib",
            "random_forest_none.joblib"
        ]
        
        for pref in preferred_order:
            cand = os.path.join(self.models_dir, pref)
            if os.path.exists(cand):
                self.load_model(cand)
                return
                
        all_models = glob.glob(os.path.join(self.models_dir, "*.joblib"))
        if all_models:
            self.load_model(all_models[0])

    def load_model(self, model_path: str):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model artifact not found at {model_path}")
        self.bundle = joblib.load(model_path)
        self.active_model_path = model_path
        logger.info(f"Loaded active model: {self.bundle.get('algorithm')} ({model_path})")

    def predict_single(self, input_dict: Dict[str, Any]) -> Dict[str, Any]:
        if not self.bundle:
            self._load_best_or_default_model()
        if not self.bundle:
            raise RuntimeError("No trained model available for inference.")
            
        fe = self.bundle["feature_engineer"]
        preprocessor = self.bundle["preprocessor"]
        clf = self.bundle["classifier"]
        
        df_in = pd.DataFrame([input_dict])
        df_eng = fe.transform(df_in)
        X_trans = preprocessor.transform(df_eng)
        
        probs = clf.predict_proba(X_trans)[0] if hasattr(clf, "predict_proba") else [0.33, 0.33, 0.34]
        pred_idx = int(np.argmax(probs))
        pred_label = TARGET_INV_MAPPING[pred_idx]
        
        # Risk confidence level
        confidence = float(np.max(probs))
        
        return {
            "predicted_severity": pred_label,
            "predicted_index": pred_idx,
            "confidence": round(confidence, 4),
            "probabilities": {
                "Slight": round(float(probs[0]), 4),
                "Serious": round(float(probs[1]), 4),
                "Fatal": round(float(probs[2]), 4)
            },
            "model_algorithm": self.bundle.get("algorithm"),
            "model_strategy": self.bundle.get("imbalance_strategy"),
            "features_used": input_dict
        }

    def predict_batch(self, df_records: pd.DataFrame) -> List[Dict[str, Any]]:
        if not self.bundle:
            self._load_best_or_default_model()
        if not self.bundle:
            raise RuntimeError("No trained model available for inference.")
            
        fe = self.bundle["feature_engineer"]
        preprocessor = self.bundle["preprocessor"]
        clf = self.bundle["classifier"]
        
        df_eng = fe.transform(df_records)
        X_trans = preprocessor.transform(df_eng)
        
        if hasattr(clf, "predict_proba"):
            all_probs = clf.predict_proba(X_trans)
        else:
            preds = clf.predict(X_trans)
            all_probs = np.zeros((len(preds), 3))
            for i, p in enumerate(preds):
                all_probs[i, p] = 1.0
                
        results = []
        for i, row in df_records.iterrows():
            probs = all_probs[i]
            p_idx = int(np.argmax(probs))
            results.append({
                "accident_index": row.get("accident_index", f"BATCH_{i+1:05d}"),
                "predicted_severity": TARGET_INV_MAPPING[p_idx],
                "confidence": round(float(np.max(probs)), 4),
                "probabilities": {
                    "Slight": round(float(probs[0]), 4),
                    "Serious": round(float(probs[1]), 4),
                    "Fatal": round(float(probs[2]), 4)
                }
            })
        return results
