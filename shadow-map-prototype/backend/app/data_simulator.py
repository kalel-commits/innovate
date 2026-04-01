import random
import math
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from .models.pydantic_models import (
    EnvironmentalData, Infrastructure, RiskMetric, RiskLevel,
    EmergencyResource, RescuePriorityScore, HazardType
)

class HazardEngine:
    """Specialized simulation logic for different hazard types"""
    
    @staticmethod
    def simulate_flood(intensity: float) -> Dict:
        scale = intensity / 100.0
        return {
            "rainfall_intensity": max(0, random.uniform(20, 100) * scale),
            "river_level": 2.5 + (random.uniform(2, 8) * scale),
            "seismic_activity": 0.0,
            "wind_velocity": random.uniform(10, 40) * (1 + scale * 0.5)
        }

    @staticmethod
    def simulate_earthquake(intensity: float) -> Dict:
        scale = intensity / 100.0
        return {
            "rainfall_intensity": random.uniform(0, 10),
            "river_level": 2.5 + random.uniform(-0.2, 0.2),
            "seismic_activity": scale * 9.0, # Richter scale max ~9
            "wind_velocity": random.uniform(0, 20)
        }

    @staticmethod
    def simulate_storm(intensity: float) -> Dict:
        scale = intensity / 100.0
        return {
            "rainfall_intensity": max(0, random.uniform(10, 80) * scale),
            "river_level": 2.5 + (random.uniform(1, 4) * scale),
            "seismic_activity": 0.0,
            "wind_velocity": random.uniform(40, 150) * scale
        }

class SurvivalOptimizationEngine:
    """Compares baseline vs intervention scenarios to calculate life-saving efficiency"""
    
    @staticmethod
    def calculate_lives_saved(total_at_risk: int, response_delay: int, efficiency_score: float) -> int:
        # Golden Window Decay: Casualty risk increases if intervention is delayed
        # Baseline casualties = total_at_risk * (1 - decay)
        # Optimized casualties = total_at_risk * (1 - decay * factor)
        decay_factor = max(0, 1 - (response_delay / 30)) # 30 min golden window
        potential_saved = int(total_at_risk * efficiency_score * decay_factor)
        return potential_saved

class DataSimulator:
    def __init__(self):
        self.start_time = datetime.now()
        
    def simulate_environmental_conditions(self, intensity: float = 25.0, hazard_type: HazardType = HazardType.GENERAL) -> EnvironmentalData:
        if hazard_type == HazardType.FLOOD:
            env = HazardEngine.simulate_flood(intensity)
        elif hazard_type == HazardType.EARTHQUAKE:
            env = HazardEngine.simulate_earthquake(intensity)
        elif hazard_type == HazardType.STORM:
            env = HazardEngine.simulate_storm(intensity)
        else:
            scale = intensity / 100.0
            env = {
                "rainfall_intensity": max(0, random.uniform(0, 20) * scale),
                "river_level": 2.5 + random.uniform(-0.1, 0.3) * scale,
                "seismic_activity": max(0, random.uniform(-0.1, 0.2) * scale),
                "wind_velocity": random.uniform(0, 40) + (scale * 80)
            }
            
        return EnvironmentalData(
            timestamp=datetime.now(),
            hazard_type=hazard_type,
            intensity=intensity,
            rainfall_intensity=env["rainfall_intensity"],
            river_level=env["river_level"],
            seismic_activity=env["seismic_activity"],
            wind_velocity=env["wind_velocity"],
            temperature=20 + random.uniform(-5, 10),
            grid_voltage_fluctuation=random.uniform(-1, 1),
            traffic_congestion=random.uniform(10, 40) + (intensity * 0.6),
            social_media_panic_index=random.uniform(5, 20) + (intensity * 0.8),
            telecom_outages=int(intensity / 10)
        )

    def generate_infrastructure_data(self) -> List[Infrastructure]:
        # Using the same base data but adding pop density metadata mockingly
        now = datetime.now()
        infra = [
            Infrastructure(id="hosp_001", name="Central Hospital", type="hospital", location={"lat": 40.7128, "lng": -74.0060}, capacity=500, current_load=300, redundancy_level=2, status="operational", last_updated=now),
            Infrastructure(id="sub_001", name="Financial Dist Substation", type="substation", location={"lat": 40.7050, "lng": -74.0090}, capacity=1000, current_load=750, redundancy_level=1, status="operational", last_updated=now),
            Infrastructure(id="bridge_001", name="Manhattan Bridge", type="bridge", location={"lat": 40.7120, "lng": -73.9900}, capacity=5000, current_load=4500, redundancy_level=0, status="operational", last_updated=now),
            Infrastructure(id="res_zone_001", name="Lower East Side", type="residential_zone", location={"lat": 40.7150, "lng": -73.9840}, capacity=80000, current_load=75000, redundancy_level=0, status="operational", last_updated=now),
        ]
        return infra

    def generate_emergency_resources(self) -> List[EmergencyResource]:
        now = datetime.now()
        return [
            EmergencyResource(id="amb_001", resource_type="ambulance", location={"lat": 40.7100, "lng": -74.0050}, availability=1, allocated=0, capacity=1, status="available", last_updated=now),
            EmergencyResource(id="amb_002", resource_type="ambulance", location={"lat": 40.7180, "lng": -73.9950}, availability=1, allocated=1, capacity=1, status="busy", last_updated=now),
            EmergencyResource(id="amb_003", resource_type="ambulance", location={"lat": 40.7050, "lng": -74.0090}, availability=1, allocated=0, capacity=1, status="available", last_updated=now),
            EmergencyResource(id="hosp_bed_001", resource_type="hospital_bed", location={"lat": 40.7128, "lng": -74.0060}, availability=100, allocated=85, capacity=100, status="available", last_updated=now),
            EmergencyResource(id="hosp_bed_002", resource_type="hospital_bed", location={"lat": 40.7280, "lng": -73.9865}, availability=200, allocated=150, capacity=200, status="available", last_updated=now),
        ]

class RiskAssessmentEngine:
    @staticmethod
    def calculate_hvi(infrastructure: Infrastructure, environmental: EnvironmentalData) -> float:
        """Human Vulnerability Index calculation"""
        # Base factor from population density (capacity)
        pop_factor = min(1.0, infrastructure.capacity / 50000)
        
        # Hazard proximity factor (Mocking proximity to epicenter/river for now)
        hazard_stress = 0.0
        if environmental.hazard_type == HazardType.FLOOD:
            hazard_stress = (environmental.river_level - 2.5) / 10
        elif environmental.hazard_type == HazardType.EARTHQUAKE:
            hazard_stress = environmental.seismic_activity / 9.0
        else:
            hazard_stress = environmental.intensity / 100.0
            
        hvi = (pop_factor * 0.4 + hazard_stress * 0.6) * 100
        return float(min(100, max(0, hvi)))

    @staticmethod
    def assess_infrastructure_risk(
        infrastructure: Infrastructure,
        environmental: EnvironmentalData,
        all_infrastructure: List[Infrastructure]
    ) -> RiskMetric:
        # Intensity-based baseline (Scaled to ensure 0 intensity = 0 risk)
        intensity_scale = environmental.intensity / 100.0
        hvi = RiskAssessmentEngine.calculate_hvi(infrastructure, environmental)
        
        # Risk score heavily influenced by HVI, but scaled by intensity
        risk_score = ((environmental.intensity * 0.4) + (hvi * 0.6)) * intensity_scale
        
        # Hazard-specific modifiers (also scaled by intensity)
        if environmental.hazard_type == HazardType.FLOOD and infrastructure.type == "substation":
            risk_score += 20 * intensity_scale # Water + Electricity = High Risk
            
        if environmental.hazard_type == HazardType.EARTHQUAKE and infrastructure.type == "bridge":
            risk_score += 30 * intensity_scale # Structural vulnerability
            
        risk_score = min(100, risk_score)
        
        # Determine Risk Level
        if risk_score >= 80: risk_level = RiskLevel.CRITICAL
        elif risk_score >= 60: risk_level = RiskLevel.HIGH
        elif risk_score >= 40: risk_level = RiskLevel.MEDIUM
        else: risk_level = RiskLevel.NORMAL
        
        # Golden Window Calculation (30 minutes from simulation start)
        # Mocking window as 30 - (intensity % 30) for demo variance
        golden_window = max(0, 30 - int(environmental.intensity / 3.3))
        
        # Lives at risk based on HVI and population
        affected_pop = int(infrastructure.capacity * (risk_score / 100))
        
        # Lives Saved Forecast (Survival Optimization Engine)
        # Based on an arbitrary 'Intervention Efficiency' of 0.8
        lives_saved = SurvivalOptimizationEngine.calculate_lives_saved(affected_pop, 30 - golden_window, 0.85)

        return RiskMetric(
            infrastructure_id=infrastructure.id,
            risk_level=risk_level,
            casualty_risk_score=float(risk_score),
            cascading_failure_probability=min(1.0, risk_score / 120),
            affected_population=affected_pop,
            human_vulnerability_index=hvi,
            lives_saved_forecast=lives_saved,
            golden_window_remaining=golden_window,
            vulnerable_demographic_exposure=hvi / 100,
            ambulance_response_delay_probability=min(1.0, environmental.traffic_congestion / 100),
            medical_overload_risk=min(1.0, risk_score / 90),
            recovery_time_estimate=int(risk_score / 5),
            timestamp=datetime.now()
        )
    @staticmethod
    def calculate_rescue_priority_scores(risks: List[RiskMetric], resources: List[EmergencyResource]) -> List[RescuePriorityScore]:
        """Calculates tactical priority scores based on risk level and resource availability"""
        priorities = []
        for risk in risks:
            if risk.risk_level == RiskLevel.CRITICAL or risk.risk_level == RiskLevel.HIGH:
                # Priority Level: 1 (Highest) to 5
                p_level = 1 if risk.risk_level == RiskLevel.CRITICAL else 2
                
                priorities.append(RescuePriorityScore(
                    incident_id=f"inc_{risk.infrastructure_id}",
                    priority_level=p_level,
                    casualty_count=risk.affected_population,
                    infrastructure_criticality=risk.casualty_risk_score / 100.0,
                    response_time_window=risk.golden_window_remaining,
                    recommended_resources=["ambulance", "rescue_team"],
                    timestamp=datetime.now()
                ))
        
        return sorted(priorities, key=lambda x: x.priority_level)
