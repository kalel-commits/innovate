from fastapi import APIRouter
from datetime import datetime
from typing import List
from .enhanced_simulator import EnhancedDataSimulator
from .response_optimization import RecoveryModelingEngine

router = APIRouter()
simulator = EnhancedDataSimulator()
infrastructure_data = simulator.generate_enhanced_infrastructure()

@router.get("/api/v2/cascade-forecast")
async def get_cascade_forecast(intensity: float = 25.0, hazard_type: str = "general", node_id: str = None):
    """
    Run Monte Carlo simulation for cascade failure prediction.
    """
    if not node_id:
        trigger_node = next((n for n in infrastructure_data if n.type == "hospital"), infrastructure_data[0])
    else:
        trigger_node = next((n for n in infrastructure_data if n.id == node_id), infrastructure_data[0])
    
    env_stress = intensity / 100.0
    scenario = simulator.simulation_engine.simulate_cascade_propagation(
        trigger_node,
        infrastructure_data,
        env_stress,
        time_steps=10
    )
    
    return {
        "scenario_id": scenario.scenario_id,
        "timestamp": scenario.timestamp.isoformat(),
        "num_iterations": scenario.num_iterations,
        "triggered_by": trigger_node.id,
        "risk_forecasts": scenario.risk_percentiles,
        "cascade_probabilities": scenario.cascade_probability_estimates,
        "model_uncertainty": scenario.model_uncertainty,
        "confidence_level": scenario.confidence_level,
        "interpretation": {
            "high_risk_nodes": [
                node_id for node_id, probs in scenario.cascade_probability_estimates.items()
                if probs > 0.5
            ],
            "mean_cascade_probability": sum(scenario.cascade_probability_estimates.values()) / len(scenario.cascade_probability_estimates) if scenario.cascade_probability_estimates else 0
        }
    }

@router.get("/api/v2/life-impact-ranking")
async def get_life_impact_ranking(intensity: float = 25.0, hazard_type: str = "general"):
    """
    Rank infrastructure by human life impact rather than structural risk.
    """
    env_stress = intensity / 100.0
    scenario = simulator.simulation_engine.simulate_cascade_propagation(
        infrastructure_data[0],
        infrastructure_data,
        env_stress,
        time_steps=5
    )
    
    # Calculate rescue priorities
    rescue_priorities = simulator.impact_engine.rank_rescue_priorities(
        infrastructure_data,
        scenario.cascade_probability_estimates
    )
    
    rankings = []
    for idx, priority in enumerate(rescue_priorities[:10], 1):
        node = next((n for n in infrastructure_data if n.id == priority.infrastructure_id), None)
        rankings.append({
            "rank": idx,
            "infrastructure_id": priority.infrastructure_id,
            "infrastructure_name": node.name if node else "Unknown",
            "casualty_count": priority.casualty_count,
            "vulnerable_population": priority.vulnerable_population_count,
            "medical_urgency_score": priority.medical_urgency_score,
            "infrastructure_criticality": priority.infrastructure_criticality,
            "response_time_window_minutes": priority.response_time_window_minutes,
            "evacuation_priority": priority.evacuation_priority,
            "lives_at_risk": priority.estimated_lives_at_risk,
            "recommended_resources": {
                "ambulances": priority.recommended_ambulances,
                "rescue_teams": priority.recommended_rescue_teams,
                "shelter_capacity": priority.shelter_capacity_needed
            }
        })
    
    return {
        "timestamp": datetime.now().isoformat(),
        "total_lives_at_risk": sum(p.estimated_lives_at_risk for p in rescue_priorities),
        "critical_urgencies": len([p for p in rescue_priorities if p.medical_urgency_score > 70]),
        "rankings": rankings
    }

@router.get("/api/v2/ambulance-routing")
async def get_optimized_ambulance_routing(traffic_congestion: float = 50):
    """
    Optimize ambulance dispatch considering live traffic and hospital capacity.
    """
    # Simulate distress locations
    distress_locations = [
        {"id": "incident_001", "location": {"lat": 40.715, "lng": -74.005}, "severity": 8},
        {"id": "incident_002", "location": {"lat": 40.728, "lng": -74.002}, "severity": 7},
        {"id": "incident_003", "location": {"lat": 40.710, "lng": -74.010}, "severity": 6},
    ]
    
    # Hospital locations
    hospitals = [
        {
            "id": "hosp_001",
            "location": {"lat": 40.7128, "lng": -74.0060},
            "current_patients": 420,
            "capacity": 500
        },
        {
            "id": "hosp_002",
            "location": {"lat": 40.7280, "lng": -73.9865},
            "current_patients": 250,
            "capacity": 300
        }
    ]
    
    # Available ambulances
    ambulances = [
        {"id": f"amb_{i:03d}", "location": {"lat": 40.7 + i*0.01, "lng": -74.0}}
        for i in range(1, 8)
    ]
    
    traffic_data = {"congestion": traffic_congestion}
    
    dispatch_plan = simulator.ambulance_optimizer.optimize_ambulance_dispatch(
        distress_locations,
        hospitals,
        ambulances,
        traffic_data
    )
    
    return {
        "timestamp": datetime.now().isoformat(),
        "optimization_metric_avg_response_minutes": dispatch_plan['wait_times']['mean'],
        "total_incidents": len(distress_locations),
        "incidents_assigned": len(dispatch_plan['assignments']),
        "assignments": dispatch_plan['assignments'],
        "response_times": dispatch_plan['wait_times'],
        "hospital_utilization": {
            hosp_id: f"{util}%" if (util := (load/cap)*100) <= 100 else "FULL"
            for hosp_id, load in dispatch_plan['hospital_loads'].items()
            for cap in [500 if 'hosp_001' == hosp_id else 300]
        }
    }

@router.get("/api/v2/resource-deployment-plan")
async def get_resource_deployment_plan(deployment_window_minutes: int = 60):
    """
    Generate optimal emergency resource deployment plan.
    Considers response time windows and resource constraints.
    """
    # Get rescue priorities
    env_stress = 0.5
    scenario = simulator.simulation_engine.simulate_cascade_propagation(
        infrastructure_data[0],
        infrastructure_data,
        env_stress,
        time_steps=5
    )
    
    rescue_priorities = simulator.impact_engine.rank_rescue_priorities(
        infrastructure_data,
        scenario.cascade_probability_estimates
    )
    
    # Available resources
    available_resources = {
        'ambulances': 20,
        'rescue_teams': 15,
        'generators': 8,
        'water_trucks': 10,
        'medical_supplies': 100
    }
    
    deployment_plan = simulator.resource_optimizer.optimize_resource_deployment(
        rescue_priorities[:10],
        available_resources,
        deployment_window_minutes
    )
    
    return {
        "timestamp": datetime.now().isoformat(),
        "deployment_window_minutes": deployment_window_minutes,
        "total_locations": len(rescue_priorities),
        "locations_covered": len(deployment_plan['allocations']),
        "coverage_percentage": deployment_plan['total_coverage_percentage'],
        "allocations": deployment_plan['allocations'],
        "unmet_resource_needs": {
            k: max(0, v) for k, v in deployment_plan['unmet_needs'].items()
        },
        "timeline": deployment_plan['timeline']
    }

@router.get("/api/v2/recovery-timeline")
async def get_recovery_timeline(node_id: str, available_crews: int = 10, available_equipment: int = 5):
    """
    Predict infrastructure recovery timeline with cascading effects.
    """
    node = next((n for n in infrastructure_data if n.id == node_id), None)
    if not node:
        return {"error": f"Node {node_id} not found"}
    
    recovery_timeline = simulator.recovery_engine.estimate_recovery_timeline(
        node,
        available_crews,
        available_equipment,
        supply_chain_delay_hours=2
    )
    
    cascade_recovery = simulator.recovery_engine.model_cascading_recovery(
        node,
        infrastructure_data,
        recovery_timeline['total_hours_with_supply']
    )
    
    return {
        "primary_infrastructure": node.id,
        "primary_recovery": recovery_timeline,
        "cascading_recovery": cascade_recovery,
        "critical_dependencies": [
            n.id for n in infrastructure_data 
            if node.id in n.dependent_on
        ]
    }

@router.get("/api/v2/command-center-briefing")
async def get_command_center_briefing(intensity: float = 25.0, hazard_type: str = "general"):
    """
    Comprehensive briefing for emergency command center.
    """
    env_stress = intensity / 100.0
    scenario = simulator.simulation_engine.simulate_cascade_propagation(
        infrastructure_data[0],
        infrastructure_data,
        env_stress,
        time_steps=5
    )
    
    rescue_priorities = simulator.impact_engine.rank_rescue_priorities(
        infrastructure_data,
        scenario.cascade_probability_estimates
    )
    
    high_risk_nodes = [
        node_id for node_id, probs in scenario.cascade_probability_estimates.items()
        if probs > 0.6
    ]
    
    total_affected = sum(p.estimated_lives_at_risk for p in rescue_priorities)
    
    critical_hospitals = [
        h for h in infrastructure_data 
        if h.type == "hospital" and (h.medical_capacity.capacity_stress_level() if h.medical_capacity else 0) > 0.7
    ]
    
    briefing = {
        "timestamp": datetime.now().isoformat(),
        "alert_level": "CRITICAL" if intensity > 80 else "HIGH" if intensity > 40 else "NORMAL",
        "total_lives_at_risk": total_affected,
        "high_risk_infrastructure": len(high_risk_nodes),
        "affected_zones": len(rescue_priorities),
        "critical_hospitals": len(critical_hospitals),
        "top_three_priorities": [
            {
                "rank": idx,
                "infrastructure": p.infrastructure_id,
                "lives_at_risk": p.estimated_lives_at_risk,
                "response_window_minutes": p.response_time_window_minutes,
                "urgency": "CRITICAL" if p.medical_urgency_score > 80 else "HIGH" if p.medical_urgency_score > 60 else "MEDIUM"
            }
            for idx, p in enumerate(rescue_priorities[:3], 1)
        ],
        "simulation_confidence": f"{scenario.confidence_level * 100:.1f}%",
        "model_uncertainty_std": f"{scenario.model_uncertainty:.2f}",
        "recommended_actions": [
            f"Dispatch {rescue_priorities[0].recommended_ambulances} ambulances to {rescue_priorities[0].infrastructure_id}" if rescue_priorities else "Monitor situation",
            f"Activate shelters: capacity needed {sum(p.shelter_capacity_needed for p in rescue_priorities[:3])} people",
            "Deploy backup generators to hospitals" if critical_hospitals else "Hospitals within normal capacity",
            "Establish evacuation routes from high-risk zones"
        ]
    }
    
    return briefing
