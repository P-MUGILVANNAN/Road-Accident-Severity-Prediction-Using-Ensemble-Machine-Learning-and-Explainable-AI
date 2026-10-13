"""
Main FastAPI Application Entrypoint.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import PROJECT_NAME, API_V1_STR, CORS_ORIGINS
from backend.app.db.init_db import init_db

# Import routers
from backend.app.api.auth import router as auth_router
from backend.app.api.dashboard import router as dashboard_router
from backend.app.api.accidents import router as accidents_router
from backend.app.api.analytics import router as analytics_router
from backend.app.api.models_api import router as models_router
from backend.app.api.predictions import router as predictions_router
from backend.app.api.explanations import router as explanations_router
from backend.app.api.reports import router as reports_router

app = FastAPI(
    title=PROJECT_NAME,
    description="End-to-end Data Science application for Road Accident Severity Prediction using Ensemble ML and Explainable AI (SHAP).",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    # Ensure database tables and initial seeds exist
    init_db()


@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": PROJECT_NAME,
        "database": "connected",
        "mode": "Research & Decision-Support"
    }


# Include API Routers
app.include_router(auth_router, prefix=API_V1_STR)
app.include_router(dashboard_router, prefix=API_V1_STR)
app.include_router(accidents_router, prefix=API_V1_STR)
app.include_router(analytics_router, prefix=API_V1_STR)
app.include_router(models_router, prefix=API_V1_STR)
app.include_router(predictions_router, prefix=API_V1_STR)
app.include_router(explanations_router, prefix=API_V1_STR)
app.include_router(reports_router, prefix=API_V1_STR)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
