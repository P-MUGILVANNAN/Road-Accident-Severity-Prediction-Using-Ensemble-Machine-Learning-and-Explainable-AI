"""
Feature Engineering, Preprocessing, and Data Leakage Prevention Pipeline.
"""
import logging
from typing import Tuple, List, Optional
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler

logger = logging.getLogger(__name__)

TARGET_COL = "accident_severity"
TARGET_MAPPING = {"Slight": 0, "Serious": 1, "Fatal": 2}
TARGET_INV_MAPPING = {0: "Slight", 1: "Serious", 2: "Fatal"}

CATEGORICAL_FEATURES = [
    "urban_or_rural_area",
    "road_type",
    "road_class",
    "weather_conditions",
    "road_surface_conditions",
    "light_conditions",
    "junction_detail",
    "day_of_week",
    "weather_surface_combo"
]

NUMERICAL_FEATURES = [
    "speed_limit",
    "number_of_vehicles",
    "hour_of_day",
    "month",
    "is_weekend",
    "is_rush_hour",
    "is_night"
]


class AccidentFeatureEngineer(BaseEstimator, TransformerMixin):
    """
    Derives temporal, environmental, and geometric interaction features
    strictly prior to or at time of collision to prevent data leakage.
    """
    def __init__(self):
        pass

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        df = X.copy()
        
        # Extract Hour of Day
        if "accident_time" in df.columns:
            hours = pd.to_datetime(df["accident_time"], format="%H:%M", errors="coerce").dt.hour
            df["hour_of_day"] = hours.fillna(12).astype(int)
        elif "hour_of_day" not in df.columns:
            df["hour_of_day"] = 12
            
        # Extract Month
        if "accident_date" in df.columns:
            dates = pd.to_datetime(df["accident_date"], errors="coerce")
            df["month"] = dates.dt.month.fillna(6).astype(int)
        elif "month" not in df.columns:
            df["month"] = 6
            
        # Is Weekend
        if "day_of_week" in df.columns:
            df["is_weekend"] = df["day_of_week"].isin(["Saturday", "Sunday"]).astype(int)
        else:
            df["is_weekend"] = 0
            
        # Is Rush Hour (07-09 or 16-18 on weekdays)
        hour = df["hour_of_day"]
        is_rush = ((hour.between(7, 9)) | (hour.between(16, 18))) & (df["is_weekend"] == 0)
        df["is_rush_hour"] = is_rush.astype(int)
        
        # Is Night (21-05)
        df["is_night"] = ((hour >= 21) | (hour <= 5)).astype(int)
        
        # Compound Environmental Risk Feature
        weather = df.get("weather_conditions", pd.Series(["Fine no high winds"] * len(df))).astype(str)
        surface = df.get("road_surface_conditions", pd.Series(["Dry"] * len(df))).astype(str)
        df["weather_surface_combo"] = weather + " + " + surface
        
        # Fill missing numeric values with median/default
        df["speed_limit"] = pd.to_numeric(df.get("speed_limit", 30), errors="coerce").fillna(30).astype(int)
        df["number_of_vehicles"] = pd.to_numeric(df.get("number_of_vehicles", 2), errors="coerce").fillna(2).astype(int)
        
        return df


def create_preprocessor() -> ColumnTransformer:
    """
    Creates an unfitted ColumnTransformer with OneHotEncoder and StandardScaler.
    """
    categorical_transformer = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
    numerical_transformer = StandardScaler()
    
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numerical_transformer, NUMERICAL_FEATURES),
            ("cat", categorical_transformer, CATEGORICAL_FEATURES)
        ],
        remainder="drop"
    )
    return preprocessor


def prepare_dataset_splits(
    df: pd.DataFrame,
    test_size: float = 0.20,
    random_seed: int = 42
) -> Tuple[pd.DataFrame, pd.DataFrame, np.ndarray, np.ndarray, AccidentFeatureEngineer, ColumnTransformer, List[str]]:
    """
    Applies feature engineering, splits into train and holdout test sets,
    and fits the preprocessing pipeline without data leakage.
    """
    fe = AccidentFeatureEngineer()
    df_engineered = fe.transform(df)
    
    # Stratified split based on accident_severity
    from sklearn.model_selection import train_test_split
    
    y = df_engineered[TARGET_COL].map(TARGET_MAPPING).values
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        df_engineered,
        y,
        test_size=test_size,
        stratify=y,
        random_state=random_seed
    )
    
    preprocessor = create_preprocessor()
    preprocessor.fit(X_train_raw)
    
    # Retrieve feature names after transformation
    cat_encoder = preprocessor.named_transformers_["cat"]
    cat_feature_names = cat_encoder.get_feature_names_out(CATEGORICAL_FEATURES).tolist()
    feature_names = NUMERICAL_FEATURES + cat_feature_names
    
    return X_train_raw, X_test_raw, y_train, y_test, fe, preprocessor, feature_names
