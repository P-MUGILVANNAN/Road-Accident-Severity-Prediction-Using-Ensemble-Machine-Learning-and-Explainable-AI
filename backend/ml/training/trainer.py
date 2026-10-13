"""
Model Training, Cross-Validation, Class Imbalance Handling, and Model Serialization.
"""
import os
import json
import logging
from typing import Dict, Any, List, Optional, Tuple
import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import (
    RandomForestClassifier,
    ExtraTreesClassifier,
    GradientBoostingClassifier,
    VotingClassifier
)
import xgboost as xgb
import lightgbm as lgb
from imblearn.over_sampling import SMOTE

from backend.ml.preprocessing import (
    prepare_dataset_splits,
    TARGET_MAPPING,
    TARGET_INV_MAPPING,
    AccidentFeatureEngineer
)
from backend.ml.evaluation import evaluate_multiclass_model

logger = logging.getLogger(__name__)


def build_classifier(
    algorithm: str,
    random_seed: int = 42,
    class_weight: Optional[str] = None
):
    """
    Instantiates the requested classifier with calibrated hyperparameters.
    """
    cw = "balanced" if class_weight == "balanced" else None
    
    if algorithm == "Logistic Regression":
        return LogisticRegression(
            max_iter=1000,
            class_weight=cw,
            random_state=random_seed
        )
    elif algorithm == "Decision Tree":
        return DecisionTreeClassifier(
            max_depth=8,
            min_samples_split=10,
            class_weight=cw,
            random_state=random_seed
        )
    elif algorithm == "Random Forest":
        return RandomForestClassifier(
            n_estimators=150,
            max_depth=12,
            min_samples_split=6,
            class_weight=cw,
            n_jobs=-1,
            random_state=random_seed
        )
    elif algorithm == "Extra Trees":
        return ExtraTreesClassifier(
            n_estimators=150,
            max_depth=12,
            min_samples_split=6,
            class_weight=cw,
            n_jobs=-1,
            random_state=random_seed
        )
    elif algorithm == "Gradient Boosting":
        return GradientBoostingClassifier(
            n_estimators=120,
            learning_rate=0.08,
            max_depth=5,
            random_state=random_seed
        )
    elif algorithm == "XGBoost":
        return xgb.XGBClassifier(
            n_estimators=150,
            learning_rate=0.08,
            max_depth=5,
            eval_metric="mlogloss",
            random_state=random_seed,
            n_jobs=-1
        )
    elif algorithm == "LightGBM":
        return lgb.LGBMClassifier(
            n_estimators=150,
            learning_rate=0.08,
            max_depth=5,
            class_weight=cw,
            random_state=random_seed,
            n_jobs=-1,
            verbose=-1
        )
    elif algorithm == "Ensemble (Soft Voting)":
        rf = RandomForestClassifier(n_estimators=120, max_depth=10, class_weight=cw, random_state=random_seed, n_jobs=-1)
        xgb_m = xgb.XGBClassifier(n_estimators=120, learning_rate=0.08, max_depth=5, eval_metric="mlogloss", random_state=random_seed, n_jobs=-1)
        lgb_m = lgb.LGBMClassifier(n_estimators=120, learning_rate=0.08, max_depth=5, class_weight=cw, random_state=random_seed, n_jobs=-1, verbose=-1)
        return VotingClassifier(
            estimators=[("rf", rf), ("xgb", xgb_m), ("lgb", lgb_m)],
            voting="soft",
            weights=[1.0, 1.2, 1.2]
        )
    else:
        raise ValueError(f"Unsupported algorithm: {algorithm}")


def train_single_experiment(
    df: pd.DataFrame,
    algorithm: str = "Ensemble (Soft Voting)",
    imbalance_strategy: str = "none",  # 'none', 'smote', 'class_weight'
    random_seed: int = 42,
    model_save_dir: Optional[str] = None
) -> Dict[str, Any]:
    """
    Executes a clean, reproducible training experiment:
    1. Stratified train/test holdout split
    2. Optional SMOTE oversampling applied ONLY to train set
    3. Model training & prediction
    4. Diagnostic metrics generation
    5. Serialization of model pipeline
    """
    X_train_raw, X_test_raw, y_train, y_test, fe, preprocessor, feature_names = prepare_dataset_splits(
        df, test_size=0.20, random_seed=random_seed
    )
    
    # Preprocess feature matrices
    X_train = preprocessor.transform(X_train_raw)
    X_test = preprocessor.transform(X_test_raw)
    
    # Imbalance strategy
    actual_cw = "balanced" if imbalance_strategy == "class_weight" else None
    if imbalance_strategy == "smote":
        smote = SMOTE(random_state=random_seed)
        X_train_fit, y_train_fit = smote.fit_resample(X_train, y_train)
    else:
        X_train_fit, y_train_fit = X_train, y_train
        
    clf = build_classifier(algorithm, random_seed=random_seed, class_weight=actual_cw)
    clf.fit(X_train_fit, y_train_fit)
    
    # Holdout Test set evaluation
    y_pred = clf.predict(X_test)
    y_prob = clf.predict_proba(X_test) if hasattr(clf, "predict_proba") else None
    
    metrics = evaluate_multiclass_model(y_test, y_pred, y_prob)
    
    # Save artifacts if requested
    artifact_path = None
    if model_save_dir:
        os.makedirs(model_save_dir, exist_ok=True)
        slug = algorithm.lower().replace(" ", "_").replace("(", "").replace(")", "")
        artifact_path = os.path.join(model_save_dir, f"{slug}_{imbalance_strategy}.joblib")
        
        bundle = {
            "algorithm": algorithm,
            "imbalance_strategy": imbalance_strategy,
            "feature_engineer": fe,
            "preprocessor": preprocessor,
            "feature_names": feature_names,
            "classifier": clf,
            "metrics": metrics,
            "random_seed": random_seed
        }
        joblib.dump(bundle, artifact_path)
        logger.info(f"Model saved to: {artifact_path}")
        
    return {
        "algorithm": algorithm,
        "imbalance_strategy": imbalance_strategy,
        "random_seed": random_seed,
        "metrics": metrics,
        "artifact_path": artifact_path,
        "train_samples": len(X_train_fit),
        "test_samples": len(X_test)
    }


def run_benchmark_suite(
    df: pd.DataFrame,
    models_dir: str
) -> List[Dict[str, Any]]:
    """
    Runs the full suite of comparison experiments:
    Baselines, individual trees/boosters, imbalance strategies, and the proposed Ensemble.
    """
    algorithms = [
        ("Logistic Regression Baseline", "Logistic Regression", "none"),
        ("Decision Tree", "Decision Tree", "none"),
        ("Random Forest", "Random Forest", "none"),
        ("Extra Trees", "Extra Trees", "none"),
        ("Gradient Boosting", "Gradient Boosting", "none"),
        ("XGBoost Classifier", "XGBoost", "none"),
        ("LightGBM Classifier", "LightGBM", "none"),
        ("Proposed Ensemble (No Imbalance)", "Ensemble (Soft Voting)", "none"),
        ("Proposed Ensemble (Class Weights)", "Ensemble (Soft Voting)", "class_weight"),
        ("Proposed Ensemble + SMOTE", "Ensemble (Soft Voting)", "smote")
    ]
    
    results = []
    for exp_id, (label, algo, imb) in enumerate(algorithms, 1):
        logger.info(f"Running Experiment {exp_id}: {label}")
        res = train_single_experiment(
            df=df,
            algorithm=algo,
            imbalance_strategy=imb,
            random_seed=42,
            model_save_dir=models_dir
        )
        res["experiment_id"] = f"EXP-{exp_id:02d}"
        res["experiment_name"] = label
        results.append(res)
        
    # Write summary table
    summary_path = os.path.join(models_dir, "benchmark_summary.json")
    with open(summary_path, "w") as f:
        json.dump(results, f, indent=2)
    logger.info(f"Benchmark summary written to {summary_path}")
    
    return results


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    data_path = os.path.join(base_dir, "data", "uk_accidents_stats19.csv")
    models_dir = os.path.join(base_dir, "models")
    
    df = pd.read_csv(data_path)
    print(f"Loaded {len(df)} records. Running benchmark suite...")
    benchmarks = run_benchmark_suite(df, models_dir)
    print("\nBenchmark Suite Completed Successfully.")
    for b in benchmarks:
        m = b["metrics"]
        print(f"[{b['experiment_id']}] {b['experiment_name']:<35} | Acc: {m['accuracy']:.4f} | Macro F1: {m['macro_f1']:.4f} | Fatal Recall: {m['per_class']['Fatal']['recall']:.4f}")
