"""
Impact Prediction Engine
Computes structured predictive outputs per hazard type
based on simulated sensor inputs.
"""
import math
import random
from datetime import datetime


INFRASTRUCTURE_NODES = [
    {"id": "hosp_001",     "name": "Central Hospital",           "type": "hospital",         "population": 12000, "criticality": 0.95},
    {"id": "hosp_002",     "name": "East Side Medical Center",   "type": "hospital",         "population": 7500,  "criticality": 0.90},
    {"id": "water_001",    "name": "Water Treatment Plant",      "type": "water",            "population": 50000, "criticality": 0.85},
    {"id": "sub_001",      "name": "Power Substation Alpha",     "type": "power",            "population": 25000, "criticality": 0.88},
    {"id": "sub_002",      "name": "Power Substation Beta",      "type": "power",            "population": 18000, "criticality": 0.80},
    {"id": "bridge_001",   "name": "Main Street Bridge",         "type": "transport",        "population": 8000,  "criticality": 0.70},
    {"id": "res_zone_001", "name": "Downtown Residential Zone",  "type": "residential",      "population": 35000, "criticality": 0.60},
]


def _compute_flood_inputs(intensity: float) -> dict:
    """Generate structured flood sensor inputs from intensity."""
    return {
        "rainfall_mm_per_hour": round(intensity * 2.5, 1),
        "river_level_m": round(3.0 + (intensity / 100) * 7.0, 2),
        "soil_saturation": round(min(0.98, (intensity / 100) * 1.25), 2),
        "forecast_duration_hours": round(max(2, 36 - (intensity / 100) * 28), 1),
    }


def _compute_earthquake_inputs(intensity: float) -> dict:
    """Generate structured earthquake sensor inputs from intensity."""
    return {
        "magnitude": round(3.0 + (intensity / 100) * 5.5, 1),
        "depth_km": round(max(2, 35 - (intensity / 100) * 30), 1),
        "epicenter_lat": 40.7128,
        "epicenter_lon": -74.0060,
    }


def _compute_storm_inputs(intensity: float) -> dict:
    """Generate structured storm sensor inputs from intensity."""
    return {
        "wind_speed_kmh": round(intensity * 2.2, 1),
        "direction": "NNW",
        "projected_path_vector": {"dx": -0.3, "dy": 0.7},
        "storm_surge_m": round((intensity / 100) * 3.5, 2),
    }


def _hazard_factor(hazard_type: str, node: dict, inputs: dict) -> float:
    """Compute hazard-specific impact multiplier per node type."""
    t = node["type"]
    if hazard_type == "flood":
        river = inputs.get("river_level_m", 5)
        sat = inputs.get("soil_saturation", 0.5)
        base = (river / 10) * 0.6 + sat * 0.4
        multipliers = {"hospital": 1.3, "water": 1.5, "power": 1.2, "transport": 1.4, "residential": 1.1}
    elif hazard_type == "earthquake":
        mag = inputs.get("magnitude", 5)
        depth = inputs.get("depth_km", 15)
        base = (mag / 9) * 0.7 + max(0, (10 - depth) / 10) * 0.3
        multipliers = {"hospital": 1.2, "water": 1.3, "power": 1.4, "transport": 1.5, "residential": 1.2}
    elif hazard_type == "storm":
        wind = inputs.get("wind_speed_kmh", 100)
        surge = inputs.get("storm_surge_m", 1)
        base = (wind / 220) * 0.6 + (surge / 3.5) * 0.4
        multipliers = {"hospital": 1.1, "water": 1.2, "power": 1.5, "transport": 1.3, "residential": 1.0}
    else:
        base = 0.5
        multipliers = {}
    return base * multipliers.get(t, 1.0)


def compute_predictions(intensity: float, hazard_type: str) -> dict:
    """
    Main prediction engine — returns full structured prediction payload.
    """
    intensity = max(1, min(100, intensity))
    norm = intensity / 100.0

    # --- Hazard Inputs ---
    if hazard_type == "flood":
        hazard_inputs = _compute_flood_inputs(intensity)
    elif hazard_type == "earthquake":
        hazard_inputs = _compute_earthquake_inputs(intensity)
    elif hazard_type == "storm":
        hazard_inputs = _compute_storm_inputs(intensity)
    else:
        hazard_inputs = _compute_flood_inputs(intensity)
        hazard_type = "flood"

    # --- Per-node Predictions ---
    node_predictions = []
    total_affected = 0
    total_icu_risk = 0.0
    total_ambul_risk = 0.0

    for node in INFRASTRUCTURE_NODES:
        hf = _hazard_factor(hazard_type, node, hazard_inputs)
        failure_prob = round(min(0.99, norm * hf * node["criticality"] * 1.1), 3)
        # Time to failure: inversely proportional to failure probability
        base_ttf = max(3, int(90 * (1 - failure_prob)))
        time_to_failure_min = max(3, base_ttf + random.randint(-3, 3))

        pop_affected = int(node["population"] * failure_prob)
        total_affected += pop_affected

        icu_prob = round(min(0.99, failure_prob * 1.35 if node["type"] == "hospital" else failure_prob * 0.6), 3)
        ambul_prob = round(min(0.99, failure_prob * 0.8 + norm * 0.2), 3)
        total_icu_risk += icu_prob
        total_ambul_risk += ambul_prob

        node_predictions.append({
            "node_id": node["id"],
            "node_name": node["name"],
            "node_type": node["type"],
            "failure_probability": failure_prob,
            "failure_probability_pct": round(failure_prob * 100, 1),
            "time_to_failure_minutes": time_to_failure_min,
            "affected_population": pop_affected,
            "icu_overload_probability_pct": round(icu_prob * 100, 1),
            "ambulance_delay_probability_pct": round(ambul_prob * 100, 1),
        })

    # Sort by failure probability descending
    node_predictions.sort(key=lambda x: x["failure_probability"], reverse=True)

    # --- System-Level Predictions ---
    cascade_spread_km = round(norm * 6.5, 2)
    recovery_hours = round(max(2, 12 + norm * 108), 1)  # 2–120h
    n = len(INFRASTRUCTURE_NODES)
    avg_icu = round((total_icu_risk / n) * 100, 1)
    avg_ambul = round((total_ambul_risk / n) * 100, 1)

    # Confidence: higher iterations + model stability = higher confidence
    monte_carlo_iterations = 1000
    confidence_base = 72 + norm * 18  # 72–90%
    confidence_score = round(min(97, confidence_base + (monte_carlo_iterations / 10000) * 7), 1)

    # T+15 / T+30 / T+60 acceleration factor
    def future_norm(delta_norm: float) -> float:
        return min(1.0, norm + delta_norm * (1 - norm) * 0.6)

    t15 = round(future_norm(0.15) * 100, 1)
    t30 = round(future_norm(0.30) * 100, 1)
    t60 = round(future_norm(0.55) * 100, 1)

    return {
        "timestamp": datetime.now().isoformat(),
        "hazard_type": hazard_type,
        "current_intensity": intensity,
        "hazard_inputs": hazard_inputs,
        "node_predictions": node_predictions,
        "system": {
            "total_affected_population": total_affected,
            "cascade_spread_radius_km": cascade_spread_km,
            "recovery_time_hours": recovery_hours,
            "icu_overload_probability_pct": avg_icu,
            "ambulance_delay_probability_pct": avg_ambul,
            "impact_confidence_score_pct": confidence_score,
        },
        "trajectory": {
            "current_intensity_pct": intensity,
            "t_plus_15_min_pct": t15,
            "t_plus_30_min_pct": t30,
            "t_plus_60_min_pct": t60,
        }
    }
