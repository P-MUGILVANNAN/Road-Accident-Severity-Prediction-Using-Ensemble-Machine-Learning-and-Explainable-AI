"""
Analytics API covering Exploratory Data Analysis, Geographic Mapping, and Risk Factors.
"""
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
import pandas as pd
import numpy as np

from backend.app.db.session import get_db
from backend.app.db.models import AccidentRecord

router = APIRouter(prefix="/analytics", tags=["Analytics & EDA"])


@router.get("/eda")
def get_exploratory_data_analysis(db: Session = Depends(get_db)):
    """
    Computes empirical cross-tabulations and distributions across all risk dimensions.
    """
    records = db.query(
        AccidentRecord.accident_severity,
        AccidentRecord.weather_conditions,
        AccidentRecord.road_surface_conditions,
        AccidentRecord.light_conditions,
        AccidentRecord.road_type,
        AccidentRecord.speed_limit,
        AccidentRecord.junction_detail,
        AccidentRecord.urban_or_rural_area,
        AccidentRecord.day_of_week,
        AccidentRecord.number_of_vehicles,
        AccidentRecord.accident_time
    ).all()
    
    if not records:
        return {"error": "No records found"}
        
    df = pd.DataFrame(records, columns=[
        "severity", "weather", "surface", "lighting", "road_type",
        "speed_limit", "junction", "area", "day_of_week", "vehicles", "time"
    ])
    
    def cross_tab_data(col_name: str):
        ct = pd.crosstab(df[col_name], df["severity"], normalize=False)
        for s in ["Slight", "Serious", "Fatal"]:
            if s not in ct.columns:
                ct[s] = 0
        ct["Total"] = ct["Slight"] + ct["Serious"] + ct["Fatal"]
        ct["Fatal_Rate_Pct"] = ((ct["Fatal"] / ct["Total"]) * 100).round(2)
        ct["Serious_Rate_Pct"] = ((ct["Serious"] / ct["Total"]) * 100).round(2)
        
        result = []
        for cat, row in ct.iterrows():
            result.append({
                "category": str(cat),
                "Slight": int(row["Slight"]),
                "Serious": int(row["Serious"]),
                "Fatal": int(row["Fatal"]),
                "Total": int(row["Total"]),
                "fatal_rate": float(row["Fatal_Rate_Pct"]),
                "serious_rate": float(row["Serious_Rate_Pct"])
            })
        result.sort(key=lambda x: x["Total"], reverse=True)
        return result

    # Hourly distribution
    hours = pd.to_datetime(df["time"], format="%H:%M", errors="coerce").dt.hour.fillna(12).astype(int)
    df["hour"] = hours
    hourly_ct = pd.crosstab(df["hour"], df["severity"])
    hourly_res = []
    for h in range(24):
        sl = int(hourly_ct.loc[h, "Slight"]) if (h in hourly_ct.index and "Slight" in hourly_ct.columns) else 0
        sr = int(hourly_ct.loc[h, "Serious"]) if (h in hourly_ct.index and "Serious" in hourly_ct.columns) else 0
        ft = int(hourly_ct.loc[h, "Fatal"]) if (h in hourly_ct.index and "Fatal" in hourly_ct.columns) else 0
        hourly_res.append({
            "hour": f"{h:02d}:00",
            "Slight": sl,
            "Serious": sr,
            "Fatal": ft,
            "total": sl + sr + ft
        })

    return {
        "severity_by_weather": cross_tab_data("weather"),
        "severity_by_surface": cross_tab_data("surface"),
        "severity_by_lighting": cross_tab_data("lighting"),
        "severity_by_road_type": cross_tab_data("road_type"),
        "severity_by_speed_limit": cross_tab_data("speed_limit"),
        "severity_by_junction": cross_tab_data("junction"),
        "severity_by_area": cross_tab_data("area"),
        "hourly_distribution": hourly_res,
        "causation_disclaimer": (
            "Epidemiological & Observational Disclaimer: Correlations displayed reflect observational associations "
            "within historical records and do not establish unconfounded direct causation."
        )
    }


@router.get("/geographic")
def get_geographic_analytics(
    severity: Optional[str] = Query(None),
    limit: int = Query(500, le=2000),
    db: Session = Depends(get_db)
):
    """
    Returns verified coordinates, regional clusters, and density hotspots.
    """
    query = db.query(
        AccidentRecord.id,
        AccidentRecord.accident_index,
        AccidentRecord.latitude,
        AccidentRecord.longitude,
        AccidentRecord.accident_severity,
        AccidentRecord.speed_limit,
        AccidentRecord.road_type,
        AccidentRecord.region
    ).filter(
        AccidentRecord.latitude.isnot(None),
        AccidentRecord.longitude.isnot(None)
    )
    
    if severity:
        query = query.filter(AccidentRecord.accident_severity == severity)
        
    points = query.limit(limit).all()
    
    # Regional breakdown
    regions_agg = (
        db.query(
            AccidentRecord.region,
            AccidentRecord.accident_severity,
            func.count(AccidentRecord.id)
        )
        .group_by(AccidentRecord.region, AccidentRecord.accident_severity)
        .all()
    )
    
    regional_summary = {}
    for reg, sev, cnt in regions_agg:
        reg_name = reg or "Unknown"
        if reg_name not in regional_summary:
            regional_summary[reg_name] = {"region": reg_name, "Slight": 0, "Serious": 0, "Fatal": 0, "total": 0}
        regional_summary[reg_name][sev] = cnt
        regional_summary[reg_name]["total"] += cnt
        
    # Hotspot clusters (regions with highest serious/fatal density)
    hotspots = []
    for r_name, data in regional_summary.items():
        severe_cnt = data["Serious"] + data["Fatal"]
        pct = round((severe_cnt / max(data["total"], 1)) * 100, 1)
        hotspots.append({
            "region": r_name,
            "total_collisions": data["total"],
            "severe_collisions": severe_cnt,
            "severe_percentage": pct
        })
    hotspots.sort(key=lambda x: x["severe_percentage"], reverse=True)
    
    return {
        "points": [
            {
                "id": p.id,
                "index": p.accident_index,
                "lat": round(p.latitude, 5),
                "lng": round(p.longitude, 5),
                "severity": p.accident_severity,
                "speed_limit": p.speed_limit,
                "road_type": p.road_type,
                "region": p.region
            }
            for p in points
        ],
        "regional_breakdown": list(regional_summary.values()),
        "hotspot_rankings": hotspots
    }


@router.get("/risk-factors")
def get_road_safety_risk_analytics(db: Session = Depends(get_db)):
    """
    Identifies multi-variable risk patterns and calculated relative risk ratios.
    """
    records = db.query(
        AccidentRecord.accident_severity,
        AccidentRecord.speed_limit,
        AccidentRecord.light_conditions,
        AccidentRecord.urban_or_rural_area,
        AccidentRecord.road_surface_conditions
    ).all()
    
    df = pd.DataFrame(records, columns=["severity", "speed", "light", "area", "surface"])
    df["is_severe"] = df["severity"].isin(["Serious", "Fatal"]).astype(int)
    
    baseline_severe_rate = df["is_severe"].mean()
    
    factors = []
    
    # High speed (60-70 mph)
    high_speed = df[df["speed"] >= 60]
    rate_hs = high_speed["is_severe"].mean() if len(high_speed) > 0 else 0
    factors.append({
        "factor_name": "High Speed Limit (>=60 mph)",
        "condition": "Speed limit 60 or 70 mph",
        "sample_size": len(high_speed),
        "severe_accident_rate": round(rate_hs * 100, 2),
        "baseline_rate": round(baseline_severe_rate * 100, 2),
        "relative_risk": round(rate_hs / max(baseline_severe_rate, 0.001), 2),
        "recommendation": "Deploy average speed cameras and enhance road shoulder barriers on high-speed single carriageways."
    })
    
    # Darkness without lights
    dark_no_light = df[df["light"] == "Darkness - no lighting"]
    rate_dnl = dark_no_light["is_severe"].mean() if len(dark_no_light) > 0 else 0
    factors.append({
        "factor_name": "Unlit Darkness",
        "condition": "Darkness with no street lighting",
        "sample_size": len(dark_no_light),
        "severe_accident_rate": round(rate_dnl * 100, 2),
        "baseline_rate": round(baseline_severe_rate * 100, 2),
        "relative_risk": round(rate_dnl / max(baseline_severe_rate, 0.001), 2),
        "recommendation": "Install solar LED reflective road studs and luminescent delineation markers along unlit stretches."
    })
    
    # Rural areas
    rural = df[df["area"] == "Rural"]
    rate_rur = rural["is_severe"].mean() if len(rural) > 0 else 0
    factors.append({
        "factor_name": "Rural Road Geometry",
        "condition": "Rural classified highways",
        "sample_size": len(rural),
        "severe_accident_rate": round(rate_rur * 100, 2),
        "baseline_rate": round(baseline_severe_rate * 100, 2),
        "relative_risk": round(rate_rur / max(baseline_severe_rate, 0.001), 2),
        "recommendation": "Target rural bend advisory signage and junction sightline clearance."
    })
    
    # Adverse road surface
    adverse_surf = df[df["surface"].isin(["Wet or damp", "Snow", "Frost or ice", "Flood 3cm+"])]
    rate_surf = adverse_surf["is_severe"].mean() if len(adverse_surf) > 0 else 0
    factors.append({
        "factor_name": "Adverse Pavement Conditions",
        "condition": "Wet, icy, or snow-covered surfaces",
        "sample_size": len(adverse_surf),
        "severe_accident_rate": round(rate_surf * 100, 2),
        "baseline_rate": round(baseline_severe_rate * 100, 2),
        "relative_risk": round(rate_surf / max(baseline_severe_rate, 0.001), 2),
        "recommendation": "Deploy dynamic variable speed messaging during precipitation events and anti-skid surfacing."
    })
    
    return {
        "baseline_severe_percentage": round(baseline_severe_rate * 100, 2),
        "total_analyzed": len(df),
        "risk_factors": factors
    }
