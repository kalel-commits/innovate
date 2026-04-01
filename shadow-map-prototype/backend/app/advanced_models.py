from dataclasses import dataclass
from typing import List, Dict, Optional
from enum import Enum
from datetime import datetime
import numpy as np

class PopulationRiskCategory(str, Enum):
    ELDERLY = "elderly"
    CHILDREN = "children"  
    DISABLED = "disabled"
    GENERAL = "general"

@dataclass
class PopulationMetrics:
    """Population exposure and vulnerability data"""
    total_population: int
    population_density: float  # people per sq km
    elderly_percentage: float  # % age 65+
    children_percentage: float  # % age 0-17
    disabled_percentage: float  # % with disabilities
    low_income_percentage: float  # % below poverty line
    language_barrier_percentage: float  # % non-English speakers
    
    def vulnerability_score(self) -> float:
        """Calculate composite vulnerability (0-1)"""
        weights = {
            'elderly': 0.25,
            'children': 0.20,
            'disabled': 0.20,
            'low_income': 0.20,
            'language': 0.15
        }
        score = (
            (self.elderly_percentage / 100) * weights['elderly'] +
            (self.children_percentage / 100) * weights['children'] +
            (self.disabled_percentage / 100) * weights['disabled'] +
            (self.low_income_percentage / 100) * weights['low_income'] +
            (self.language_barrier_percentage / 100) * weights['language']
        )
        return min(1.0, score)

@dataclass
class MedicalCapacity:
    """Hospital and medical resource capacity"""
    icu_beds: int
    icu_available: int
    oxygen_units: int
    oxygen_available: int
    ventilators: int
    ventilators_available: int
    surgical_capacity: int  # % available
    telemedicine_capable: bool
    surge_capacity_hours: int  # hours of backup power/supplies
    trauma_center: bool
    specialist_types: List[str]  # ['cardiology', 'neurology', etc]
    
    def capacity_stress_level(self) -> float:
        """0-1 stress level based on capacity utilization"""
        icu_util = (self.icu_beds - self.icu_available) / self.icu_beds if self.icu_beds > 0 else 0
        oxy_util = (self.oxygen_units - self.oxygen_available) / self.oxygen_units if self.oxygen_units > 0 else 0
        vent_util = (self.ventilators - self.ventilators_available) / self.ventilators if self.ventilators > 0 else 0
        
        stress = (icu_util * 0.5 + oxy_util * 0.3 + vent_util * 0.2)
        return min(1.0, stress)

@dataclass
class InfrastructureNode:
    """Enhanced infrastructure with population and medical data"""
    id: str
    name: str
    type: str
    location: Dict
    capacity: int
    current_load: float
    redundancy_level: int
    dependent_on: List[str]  # IDs of dependencies
    population_metrics: Optional[PopulationMetrics] = None
    medical_capacity: Optional[MedicalCapacity] = None
    backup_duration_hours: int = 0
    economic_value_per_hour: float = 0.0
    recovery_resource_needs: Dict[str, int] = None  # crew, equipment, supplies
    status: str = "operational"
    failure_cascade_probability: float = 0.0
    estimated_time_to_repair_hours: float = 0.0
    last_updated: datetime = None
    
    def human_impact_score(self) -> float:
        """0-100 score prioritizing human life impact"""
        if not self.population_metrics:
            return 0.0
        
        pop_impact = (self.population_metrics.total_population / 100000) * 10
        vuln_impact = self.population_metrics.vulnerability_score() * 30
        
        medical_impact = 0.0
        if self.medical_capacity:
            medical_impact = self.medical_capacity.capacity_stress_level() * 40
        
        return min(100, pop_impact + vuln_impact + medical_impact)
    
    def time_to_critical_hours(self) -> float:
        """Hours until this infrastructure becomes critical"""
        if self.backup_duration_hours <= 0:
            return float('inf')
        return self.backup_duration_hours - (self.current_load / self.capacity * self.backup_duration_hours)

@dataclass  
class RescuePriority:
    """Enhanced rescue prioritization"""
    infrastructure_id: str
    casualty_count: int
    vulnerable_population_count: int
    medical_urgency_score: float  # 0-100
    infrastructure_criticality: float  # 0-1
    response_time_window_minutes: int
    recommended_ambulances: int
    recommended_rescue_teams: int
    evacuation_priority: int  # 1-5
    shelter_capacity_needed: int
    estimated_lives_at_risk: int

@dataclass
class SimulationScenario:
    """Monte Carlo simulation scenario with confidence intervals"""
    scenario_id: str
    timestamp: datetime
    num_iterations: int  # typically 10000
    affected_infrastructure: List[str]
    risk_percentiles: Dict[str, Dict[str, float]]  # {infra_id: {5th, 50th, 95th}}
    cascade_probability_estimates: Dict[str, float]
    confidence_level: float  # 0-1
    model_uncertainty: float  # expressed as std deviation
    convergence_achieved: bool
