from pydantic import BaseModel
from typing import List, Dict, Optional
from enum import Enum
from datetime import datetime

class InfrastructureType(str, Enum):
    HOSPITAL = "hospital"
    SUBSTATION = "substation"
    WATER_PLANT = "water_plant"
    BRIDGE = "bridge"
    TELECOM_TOWER = "telecom_tower"
    SCHOOL = "school"
    SHELTER = "shelter"
    RESIDENTIAL_ZONE = "residential_zone"

class HazardType(str, Enum):
    FLOOD = "flood"
    EARTHQUAKE = "earthquake"
    STORM = "storm"
    GENERAL = "general"

class RiskLevel(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    NORMAL = "normal"

class Infrastructure(BaseModel):
    id: str
    name: str
    type: InfrastructureType
    location: Dict[str, float]  # lat, lng
    capacity: int
    current_load: float
    redundancy_level: int
    dependent_infrastructure: List[str] = []
    status: str = "operational"
    last_updated: datetime

class EnvironmentalData(BaseModel):
    timestamp: datetime
    hazard_type: HazardType = HazardType.GENERAL
    intensity: float # 0-100
    rainfall_intensity: float  # mm/hr
    river_level: float  # meters
    seismic_activity: float  # magnitude
    wind_velocity: float  # km/h
    temperature: float  # celsius
    grid_voltage_fluctuation: float  # percentage deviation
    traffic_congestion: float  # 0-100 percentage
    social_media_panic_index: float  # 0-100
    telecom_outages: int  # count

class RiskMetric(BaseModel):
    infrastructure_id: str
    risk_level: RiskLevel
    casualty_risk_score: float  # 0-100
    cascading_failure_probability: float  # 0-1
    affected_population: int
    human_vulnerability_index: float  # 0-100 (New v3.0)
    lives_saved_forecast: int  # (New v3.0)
    golden_window_remaining: int  # minutes (New v3.0)
    vulnerable_demographic_exposure: float  # percentage
    ambulance_response_delay_probability: float  # 0-1
    medical_overload_risk: float  # 0-1
    recovery_time_estimate: int  # hours
    timestamp: datetime

class EmergencyResource(BaseModel):
    id: str
    resource_type: str  # ambulance, hospital_bed, oxygen_unit, etc
    location: Dict[str, float]
    availability: int
    allocated: int
    capacity: int
    status: str = "available"
    last_updated: datetime

class RescuePriorityScore(BaseModel):
    incident_id: str
    priority_level: int  # 1-5, 1 being highest
    casualty_count: int
    infrastructure_criticality: float  # 0-1
    response_time_window: int  # minutes
    recommended_resources: List[str]
    timestamp: datetime

class DashboardSummary(BaseModel):
    timestamp: datetime
    total_risk_score: float
    casualty_reduction_percentage: float  # (New v3.0)
    cascade_containment_score: float  # (New v3.0)
    critical_infrastructure_at_risk: int
    estimated_affected_population: int
    active_incidents: int
    available_ambulances: int
    hospital_bed_availability: int
    response_recommendations: List[str]
    top_risks: List[Dict]
