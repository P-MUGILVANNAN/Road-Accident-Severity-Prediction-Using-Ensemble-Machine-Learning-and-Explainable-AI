"""
Database engine, session management, and MySQL connection configuration.
"""
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.app.core.config import DATABASE_URL

logger = logging.getLogger(__name__)

engine_kwargs = {
    "pool_pre_ping": True,
}

if DATABASE_URL.startswith("mysql"):
    engine_kwargs.update({
        "pool_recycle": 3600,
        "pool_size": 10,
        "max_overflow": 20,
    })
elif DATABASE_URL.startswith("sqlite"):
    engine_kwargs.update({
        "connect_args": {"check_same_thread": False}
    })

try:
    engine = create_engine(DATABASE_URL, **engine_kwargs)
    logger.info(f"Initialized SQLAlchemy engine with database: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else DATABASE_URL}")
except Exception as e:
    logger.error(f"Failed to initialize engine with {DATABASE_URL}: {e}")
    # Fallback to local SQLite if MySQL host is temporarily unreachable
    fallback_url = "sqlite:///./accident_severity.db"
    engine = create_engine(fallback_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI database session dependency"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
