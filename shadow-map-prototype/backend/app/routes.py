from fastapi import APIRouter, WebSocket
from .data_simulator import DataSimulator, RiskAssessmentEngine
from .models import Infrastructure, DashboardSummary, RiskLevel
from .ai_service import ai_service
from .prediction_engine import compute_predictions
from typing import List
from datetime import datetime
import asyncio
import json

router = APIRouter()
simulator = DataSimulator()

# Cache infrastructure data
infrastructure_data = simulator.generate_infrastructure_data()

@router.get("/api/infrastructure")
async def get_infrastructure():
    """Get current infrastructure status"""
    return {
        "timestamp": __import__('datetime').datetime.now().isoformat(),
        "infrastructure": [
            {
                "id": i.id,
                "name": i.name,
                "type": i.type,
                "location": i.location,
                "capacity": i.capacity,
                "current_load": i.current_load,
                "load_percentage": (i.current_load / i.capacity) * 100,
                "redundancy_level": i.redundancy_level,
                "status": i.status,
            }
            for i in infrastructure_data
        ]
    }

@router.get("/api/risks")
async def get_current_risks(intensity: float = 25.0, hazard_type: str = "general"):
    """Get current risk assessment for all infrastructure scaled by intensity"""
    from .models.pydantic_models import HazardType as HT
    hazard = next((h for h in HT if h.value == hazard_type), HT.GENERAL)
    
    env_data = simulator.simulate_environmental_conditions(intensity, hazard)
    
    risks = [
        RiskAssessmentEngine.assess_infrastructure_risk(inf, env_data, infrastructure_data)
        for inf in infrastructure_data
    ]
    
    return {
        "timestamp": env_data.timestamp.isoformat(),
        "environmental_conditions": env_data.dict(),
        "risks": [
            {
                "infrastructure_id": r.infrastructure_id,
                "risk_level": r.risk_level,
                "casualty_risk_score": r.casualty_risk_score,
                "cascading_failure_probability": r.cascading_failure_probability,
                "affected_population": r.affected_population,
                "human_vulnerability_index": r.human_vulnerability_index,
                "lives_saved_forecast": r.lives_saved_forecast,
                "golden_window_remaining": r.golden_window_remaining,
                "ambulance_response_delay_probability": r.ambulance_response_delay_probability,
                "medical_overload_risk": r.medical_overload_risk,
                "recovery_time_estimate": r.recovery_time_estimate,
            }
            for r in risks
        ],
        "critical_count": len([r for r in risks if r.risk_level == "critical"]),
        "high_count": len([r for r in risks if r.risk_level == "high"]),
    }

@router.get("/api/resources")
async def get_emergency_resources():
    """Get current emergency resource status"""
    resources = simulator.generate_emergency_resources()
    
    return {
        "timestamp": __import__('datetime').datetime.now().isoformat(),
        "resources": [
            {
                "id": r.id,
                "resource_type": r.resource_type,
                "location": r.location,
                "availability": r.availability,
                "allocated": r.allocated,
                "capacity": r.capacity,
                "utilization": (r.allocated / r.capacity * 100) if r.capacity > 0 else 0,
                "status": r.status,
            }
            for r in resources
        ]
    }

@router.get("/api/dashboard")
async def get_dashboard_summary(intensity: float = 25.0, hazard_type: str = "general"):
    """Get comprehensive dashboard summary scaled by intensity"""
    from .models.pydantic_models import HazardType as HT
    hazard = next((h for h in HT if h.value == hazard_type), HT.GENERAL)
    
    env_data = simulator.simulate_environmental_conditions(intensity, hazard)
    resources = simulator.generate_emergency_resources()
    
    risks = [
        RiskAssessmentEngine.assess_infrastructure_risk(inf, env_data, infrastructure_data)
        for inf in infrastructure_data
    ]
    
    priority_scores = RiskAssessmentEngine.calculate_rescue_priority_scores(risks, resources)
    
    critical_risks = [r for r in risks if r.risk_level == RiskLevel.CRITICAL]
    
    total_affected = sum(r.affected_population for r in risks)
    available_beds = sum(
        r.availability - r.allocated
        for r in resources
        if r.resource_type == "hospital_bed"
    )
    available_ambulances = sum(
        r.availability - r.allocated
        for r in resources
        if r.resource_type == "ambulance"
    )
    
    recommendations = []
    if len(critical_risks) > 0:
        recommendations.append("ALERT: Critical infrastructure at risk - initiate protective protocols")
    if available_ambulances < 3:
        recommendations.append("Deploy additional ambulance units from staging areas")
    if total_affected > 1000:
        recommendations.append("Activate emergency shelters - prepare for mass evacuation")
    if any(r.medical_overload_risk > 0.7 for r in risks):
        recommendations.append("Divert incoming patients to secondary hospitals")
    
    # Survival Optimization Metrics
    total_lives_at_risk = sum(r.affected_population for r in risks)
    total_lives_saved = sum(r.lives_saved_forecast for r in risks)
    casualty_reduction_pct = (total_lives_saved / total_lives_at_risk * 100) if total_lives_at_risk > 0 else 100
    
    # Cascade Containment Score (Percentage of nodes that didn't reach CRITICAL status)
    contained_nodes = len([r for r in risks if r.risk_level != RiskLevel.CRITICAL])
    cascade_containment = (contained_nodes / len(risks) * 100) if len(risks) > 0 else 100

    return {
        "timestamp": env_data.timestamp.isoformat(),
        "hazard_type": env_data.hazard_type.value,
        "total_risk_score": float(sum(r.casualty_risk_score for r in risks) / len(risks)) if len(risks) > 0 else 0,
        "casualty_reduction_percentage": casualty_reduction_pct,
        "cascade_containment_score": cascade_containment,
        "critical_infrastructure_count": len(critical_risks),
        "estimated_affected_population": total_lives_at_risk,
        "available_ambulances": available_ambulances,
        "hospital_bed_availability": available_beds,
        "active_critical_incidents": len(priority_scores),
        "recommendations": recommendations,
        "top_risks": [
            {
                "infrastructure_id": r.infrastructure_id,
                "risk_score": r.casualty_risk_score,
                "hvi": r.human_vulnerability_index,
                "lives_saved": r.lives_saved_forecast,
            }
            for r in sorted(risks, key=lambda x: x.casualty_risk_score, reverse=True)[:5]
        ]
    }

_ai_cache: dict = {}
_AI_CACHE_TTL = 60  # seconds

@router.get("/api/ai/briefing")
async def get_ai_briefing(intensity: float = 25.0, hazard_type: str = "general"):
    """
    Generate AI-driven tactical insights with caching to avoid rate limits.
    Results are cached for 60 seconds per (intensity_bucket, hazard_type).
    """
    import time
    # Bucket intensity into steps of 5 to maximize cache hits
    intensity_bucket = round(intensity / 5) * 5
    cache_key = f"{intensity_bucket}_{hazard_type}"
    
    now = time.time()
    if cache_key in _ai_cache:
        cached_text, cached_time = _ai_cache[cache_key]
        if now - cached_time < _AI_CACHE_TTL:
            return {"briefing": cached_text, "cached": True}

    from .models.pydantic_models import HazardType as HT
    hazard = next((h for h in HT if h.value == hazard_type), HT.GENERAL)
    
    env_data = simulator.simulate_environmental_conditions(intensity, hazard)
    risks = [
        RiskAssessmentEngine.assess_infrastructure_risk(inf, env_data, infrastructure_data)
        for inf in infrastructure_data
    ]
    
    metrics = {
        "intensity": intensity_bucket,
        "hazard_type": hazard_type,
        "affected_population": sum(r.affected_population for r in risks),
        "risk_score": float(sum(r.casualty_risk_score for r in risks) / len(risks)) if len(risks) > 0 else 0,
        "casualty_reduction": (sum(r.lives_saved_forecast for r in risks) / sum(r.affected_population for r in risks) * 100) if sum(r.affected_population for r in risks) > 0 else 100
    }
    
    briefing = await ai_service.generate_tactical_briefing(metrics)
    _ai_cache[cache_key] = (briefing, now)
    return {"briefing": briefing, "cached": False}


@router.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket):
    """Real-time data streaming via WebSocket"""
    await websocket.accept()
    try:
        while True:
            env_data = simulator.simulate_environmental_conditions()
            data = {
                "type": "environmental",
                "timestamp": env_data.timestamp.isoformat(),
                "rainfall": env_data.rainfall_intensity,
                "river_level": env_data.river_level,
                "wind_velocity": env_data.wind_velocity,
                "grid_voltage": env_data.grid_voltage_fluctuation,
                "traffic_congestion": env_data.traffic_congestion,
                "panic_index": env_data.social_media_panic_index,
            }
            await websocket.send_json(data)
            await asyncio.sleep(2)
    except Exception as e:
        print(f"WebSocket error: {e}")


@router.get("/api/predict")
async def get_impact_prediction(intensity: float = 50, hazard_type: str = "flood"):
    """Full impact prediction engine — structured hazard inputs + per-node predictive outputs."""
    return compute_predictions(intensity, hazard_type)


@router.get("/api/ai/predict")
async def get_ai_prediction_timeline(intensity: float = 50, hazard_type: str = "flood"):
    """Gemini AI-powered T+15 / T+30 / T+60 disaster trajectory prediction."""
    prediction = compute_predictions(intensity, hazard_type)
    traj = prediction["trajectory"]
    sys = prediction["system"]
    hazard_inputs = prediction["hazard_inputs"]

    prompt = (
        f"You are an emergency AI system analyzing a real-time {hazard_type} disaster. "
        f"Sensor data: {hazard_inputs}. "
        f"Current impact: {sys['total_affected_population']:,} people at risk, "
        f"cascade radius {sys['cascade_spread_radius_km']} km, "
        f"ICU overload risk {sys['icu_overload_probability_pct']}%, "
        f"ambulance delay risk {sys['ambulance_delay_probability_pct']}%. "
        f"Disaster intensity is projected to escalate: "
        f"now={traj['current_intensity_pct']}%, "
        f"T+15min={traj['t_plus_15_min_pct']}%, "
        f"T+30min={traj['t_plus_30_min_pct']}%, "
        f"T+60min={traj['t_plus_60_min_pct']}%. "
        f"Write exactly 3 concise prediction statements, one per line, prefixed with T+15:, T+30:, T+60:. "
        f"Each must predict specific infrastructure failures, casualties, or system overloads. "
        f"Be specific with numbers. Maximum 25 words each. No bullet points."
    )

    try:
        briefing = await ai_service.generate_briefing_text(prompt)
    except Exception:
        briefing = (
            f"T+15: {hazard_type.title()} intensity reaches {traj['t_plus_15_min_pct']}% — "
            f"Power Substation Alpha at critical failure threshold.\n"
            f"T+30: Cascade spreads to {sys['cascade_spread_radius_km']+1.5:.1f} km radius — "
            f"Central Hospital ICU at {sys['icu_overload_probability_pct']+12:.0f}% overload.\n"
            f"T+60: Full grid failure probable — "
            f"{sys['total_affected_population']:,} residents require emergency evacuation."
        )

    lines = [l.strip() for l in briefing.strip().split("\n") if l.strip()]
    stages = []
    for label, default_min in [("T+15", 15), ("T+30", 30), ("T+60", 60)]:
        matched = next((l for l in lines if l.startswith(f"{label}:")), None)
        text = matched[len(f"{label}:"):].strip() if matched else f"Escalation in progress at intensity {traj[f't_plus_{default_min}_min_pct']}%."
        stages.append({"label": label, "intensity_pct": traj[f"t_plus_{default_min}_min_pct"], "prediction": text})

    return {
        "timestamp": datetime.now().isoformat(),
        "hazard_type": hazard_type,
        "trajectory": traj,
        "stages": stages,
        "system_snapshot": sys,
    }
