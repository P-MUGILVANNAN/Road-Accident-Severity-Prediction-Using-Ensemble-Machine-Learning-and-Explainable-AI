"""
Database initialization and data seeding script.
"""
import os
import json
import logging
import pandas as pd
from backend.app.db.session import engine, SessionLocal, Base
from backend.app.db.models import User, AccidentRecord, ExperimentRecord, AuditEvent
from backend.app.core.config import DATA_DIR, MODELS_DIR

logger = logging.getLogger(__name__)


def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # 1. Seed Default Users if none exist
        if db.query(User).count() == 0:
            demo_users = [
                User(
                    email="admin@roadsafety.ai",
                    hashed_password="pbkdf2:sha256:admin123", # simple test hash for dev
                    full_name="Lead Safety Analyst",
                    role="admin"
                ),
                User(
                    email="researcher@ieee.org",
                    hashed_password="pbkdf2:sha256:research123",
                    full_name="Dr. Alan Turing",
                    role="researcher"
                )
            ]
            db.add_all(demo_users)
            db.commit()
            logger.info("Seeded default users.")
            
        # 2. Seed Accident Records from CSV if table is empty
        if db.query(AccidentRecord).count() == 0:
            csv_path = DATA_DIR / "uk_accidents_stats19.csv"
            if os.path.exists(csv_path):
                df = pd.read_csv(csv_path)
                records = []
                for _, row in df.iterrows():
                    records.append(AccidentRecord(
                        accident_index=str(row["accident_index"]),
                        accident_date=str(row["accident_date"]),
                        accident_time=str(row["accident_time"]),
                        day_of_week=str(row["day_of_week"]),
                        urban_or_rural_area=str(row["urban_or_rural_area"]),
                        road_type=str(row["road_type"]),
                        road_class=str(row["road_class"]),
                        speed_limit=int(row["speed_limit"]),
                        weather_conditions=str(row["weather_conditions"]),
                        road_surface_conditions=str(row["road_surface_conditions"]),
                        light_conditions=str(row["light_conditions"]),
                        junction_detail=str(row["junction_detail"]),
                        number_of_vehicles=int(row["number_of_vehicles"]),
                        latitude=float(row["latitude"]) if pd.notnull(row["latitude"]) else None,
                        longitude=float(row["longitude"]) if pd.notnull(row["longitude"]) else None,
                        region=str(row.get("region", "National")),
                        accident_severity=str(row["accident_severity"]),
                        is_synthetic=False
                    ))
                db.bulk_save_objects(records)
                db.commit()
                logger.info(f"Seeded {len(records)} accident records into database.")
                
        # 3. Seed Benchmark Experiments if empty
        if db.query(ExperimentRecord).count() == 0:
            summary_path = MODELS_DIR / "benchmark_summary.json"
            if os.path.exists(summary_path):
                with open(summary_path, "r") as f:
                    benchmarks = json.load(f)
                    
                exp_objs = []
                for b in benchmarks:
                    m = b["metrics"]
                    exp_objs.append(ExperimentRecord(
                        experiment_id=b["experiment_id"],
                        experiment_name=b["experiment_name"],
                        algorithm=b["algorithm"],
                        imbalance_strategy=b["imbalance_strategy"],
                        accuracy=m["accuracy"],
                        macro_f1=m["macro_f1"],
                        weighted_f1=m["weighted_f1"],
                        fatal_recall=m["per_class"]["Fatal"]["recall"],
                        roc_auc_ovr=m.get("roc_auc_ovr"),
                        metrics_json=m,
                        artifact_path=b.get("artifact_path")
                    ))
                db.add_all(exp_objs)
                db.commit()
                logger.info(f"Seeded {len(exp_objs)} benchmark experiments.")
                
        # 4. Audit Log
        db.add(AuditEvent(action="SYSTEM_INIT", details="Database initialized with STATS19 records and baseline benchmarks."))
        db.commit()
        
    finally:
        db.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    init_db()
    print("Database initialization and seeding completed successfully.")
