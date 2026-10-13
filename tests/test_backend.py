"""
Automated Pytest Suite for Accident Severity Machine Learning & Backend APIs.
"""
import pytest
import numpy as np
import pandas as pd
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.ml.data import validate_dataset_schema
from backend.ml.preprocessing import AccidentFeatureEngineer, prepare_dataset_splits
from backend.ml.prediction import AccidentPredictionService
from backend.app.core.config import MODELS_DIR, DATA_DIR

client = TestClient(app)


def test_api_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"


def test_dashboard_summary():
    res = client.get("/api/dashboard/summary")
    assert res.status_code == 200
    data = res.json()
    assert "total_records" in data
    assert "severity_distribution" in data
    assert data["total_records"] > 0
    assert "Slight" in data["severity_distribution"]


def test_schema_validation_on_real_csv():
    csv_path = DATA_DIR / "uk_accidents_stats19.csv"
    assert csv_path.exists(), "Primary STATS19 CSV must exist"
    df = pd.read_csv(csv_path)
    report = validate_dataset_schema(df)
    assert report["valid"] is True
    assert report["quality_score"] > 95.0
    assert len(report["missing_columns"]) == 0


def test_feature_engineering_no_leakage():
    fe = AccidentFeatureEngineer()
    df_dummy = pd.DataFrame([{
        "accident_time": "17:30",
        "accident_date": "2023-05-10",
        "day_of_week": "Wednesday",
        "speed_limit": 60,
        "number_of_vehicles": 2,
        "weather_conditions": "Raining no high winds",
        "road_surface_conditions": "Wet or damp"
    }])
    df_transformed = fe.transform(df_dummy)
    assert "hour_of_day" in df_transformed.columns
    assert df_transformed["hour_of_day"].iloc[0] == 17
    assert df_transformed["is_rush_hour"].iloc[0] == 1
    assert df_transformed["is_weekend"].iloc[0] == 0
    assert "weather_surface_combo" in df_transformed.columns
    # Ensure post-collision leakage variables are absent
    assert "number_of_casualties" not in df_transformed.columns
    assert "casualty_severity" not in df_transformed.columns


def test_severity_prediction_probabilities():
    pred_service = AccidentPredictionService(str(MODELS_DIR))
    sample_input = {
        "speed_limit": 60,
        "road_type": "Single carriageway",
        "road_class": "A",
        "urban_or_rural_area": "Rural",
        "weather_conditions": "Fine no high winds",
        "road_surface_conditions": "Dry",
        "light_conditions": "Darkness - no lighting",
        "junction_detail": "Not at junction",
        "number_of_vehicles": 1,
        "accident_time": "23:45",
        "day_of_week": "Friday"
    }
    result = pred_service.predict_single(sample_input)
    assert result["predicted_severity"] in ["Slight", "Serious", "Fatal"]
    probs = result["probabilities"]
    prob_sum = probs["Slight"] + probs["Serious"] + probs["Fatal"]
    assert pytest.approx(prob_sum, abs=0.02) == 1.0


def test_prediction_api_endpoint():
    payload = {
        "speed_limit": 30,
        "road_type": "Single carriageway",
        "road_class": "A",
        "urban_or_rural_area": "Urban",
        "weather_conditions": "Fine no high winds",
        "road_surface_conditions": "Dry",
        "light_conditions": "Daylight",
        "junction_detail": "Crossroads",
        "number_of_vehicles": 2,
        "accident_time": "14:15",
        "day_of_week": "Monday"
    }
    res = client.post("/api/predictions/severity", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "predicted_severity" in data
    assert "probabilities" in data
    assert "confidence" in data
    assert data["predicted_severity"] in ["Slight", "Serious", "Fatal"]


def test_global_explanations_endpoint():
    res = client.get("/api/explanations/global")
    assert res.status_code == 200
    data = res.json()
    assert "feature_rankings" in data
    assert len(data["feature_rankings"]) > 0


def test_reports_summary_endpoint():
    res = client.get("/api/reports/summary")
    assert res.status_code == 200
    data = res.json()
    assert "benchmarks" in data
    assert len(data["benchmarks"]) >= 5
    assert "best_performing_model" in data
