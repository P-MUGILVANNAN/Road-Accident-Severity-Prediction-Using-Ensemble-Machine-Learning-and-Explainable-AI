"""
Core Configuration and Environment Settings with MySQL as Default Database.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file if available
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
REPORTS_DIR = BASE_DIR / "reports"
RESEARCH_DIR = BASE_DIR / "research"

# MySQL Database connection URL
DEFAULT_MYSQL_URL = "mysql+pymysql://root:password@127.0.0.1:3306/accident_severity_db?charset=utf8mb4"
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_MYSQL_URL)

PROJECT_NAME = "Road Accident Severity Prediction Platform"
API_V1_STR = "/api"
SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-research-key-change-in-prod-2026")
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day

CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]
