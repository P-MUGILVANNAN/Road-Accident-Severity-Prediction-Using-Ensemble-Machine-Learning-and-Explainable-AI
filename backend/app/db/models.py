"""
SQLAlchemy ORM Models for Accident Records, Predictions, Experiments, and Audits.
"""
import datetime
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Text, JSON, Boolean, Index
)
from backend.app.db.session import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), default="researcher")  # admin, researcher, analyst
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class AccidentRecord(Base):
    __tablename__ = "accident_records"
    
    id = Column(Integer, primary_key=True, index=True)
    accident_index = Column(String(64), unique=True, index=True, nullable=False)
    accident_date = Column(String(16), index=True, nullable=False)
    accident_time = Column(String(8), nullable=False)
    day_of_week = Column(String(16), index=True, nullable=False)
    urban_or_rural_area = Column(String(16), index=True, nullable=False)
    road_type = Column(String(32), index=True, nullable=False)
    road_class = Column(String(16), index=True, nullable=False)
    speed_limit = Column(Integer, index=True, nullable=False)
    weather_conditions = Column(String(64), index=True, nullable=False)
    road_surface_conditions = Column(String(32), index=True, nullable=False)
    light_conditions = Column(String(64), index=True, nullable=False)
    junction_detail = Column(String(64), nullable=False)
    number_of_vehicles = Column(Integer, default=2)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    region = Column(String(64), index=True, nullable=True)
    accident_severity = Column(String(16), index=True, nullable=False)  # Slight, Serious, Fatal
    is_synthetic = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    __table_args__ = (
        Index("idx_acc_sev_date", "accident_severity", "accident_date"),
        Index("idx_acc_geo", "latitude", "longitude"),
    )


class DatasetImport(Base):
    __tablename__ = "dataset_imports"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    record_count = Column(Integer, nullable=False)
    quality_score = Column(Float, default=100.0)
    status = Column(String(32), default="SUCCESS")
    summary_json = Column(JSON, nullable=True)
    imported_at = Column(DateTime, default=datetime.datetime.utcnow)


class ExperimentRecord(Base):
    __tablename__ = "experiment_records"
    
    id = Column(Integer, primary_key=True, index=True)
    experiment_id = Column(String(32), unique=True, index=True, nullable=False)
    experiment_name = Column(String(128), nullable=False)
    algorithm = Column(String(64), nullable=False)
    imbalance_strategy = Column(String(32), default="none")
    accuracy = Column(Float, nullable=False)
    macro_f1 = Column(Float, nullable=False)
    weighted_f1 = Column(Float, nullable=False)
    fatal_recall = Column(Float, nullable=False)
    roc_auc_ovr = Column(Float, nullable=True)
    metrics_json = Column(JSON, nullable=False)
    artifact_path = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class PredictionRecord(Base):
    __tablename__ = "prediction_records"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    input_features = Column(JSON, nullable=False)
    predicted_severity = Column(String(16), nullable=False)
    slight_prob = Column(Float, nullable=False)
    serious_prob = Column(Float, nullable=False)
    fatal_prob = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    model_name = Column(String(64), nullable=False)
    user_notes = Column(Text, nullable=True)


class AuditEvent(Base):
    __tablename__ = "audit_events"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    action = Column(String(64), nullable=False)
    details = Column(Text, nullable=True)
