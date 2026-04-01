import random
from datetime import datetime
from typing import List
from .advanced_models import (
    InfrastructureNode, PopulationMetrics, MedicalCapacity,
    RescuePriority, SimulationScenario
)
from .simulation_engines import MonteCarloSimulationEngine, LifeImpactScoringEngine
from .response_optimization import (
    AmbulanceRoutingOptimizer, ResourceAllocationOptimizer, RecoveryModelingEngine
)

class EnhancedDataSimulator:
    """Advanced simulator with population metrics and medical capacity"""
    
    def __init__(self):
        self.base_rainfall = 0.0
        self.base_river_level = 2.5
        self.seismic_baseline = 0.0
        self.simulation_engine = MonteCarloSimulationEngine(num_iterations=5000)
        self.impact_engine = LifeImpactScoringEngine()
        self.ambulance_optimizer = AmbulanceRoutingOptimizer()
        self.resource_optimizer = ResourceAllocationOptimizer()
        self.recovery_engine = RecoveryModelingEngine()
    
    def generate_enhanced_infrastructure(self) -> List[InfrastructureNode]:
        """Generate infrastructure with population and medical capacity data"""
        now = datetime.now()
        
        infrastructure = [
            # Central Hospital - major medical hub
            InfrastructureNode(
                id="hosp_001",
                name="Central Hospital",
                type="hospital",
                location={"lat": 40.7128, "lng": -74.0060},
                capacity=500,
                current_load=random.uniform(200, 450),
                redundancy_level=2,
                dependent_on=["sub_001", "water_001"],
                population_metrics=PopulationMetrics(
                    total_population=100000,
                    population_density=150,
                    elderly_percentage=18,
                    children_percentage=15,
                    disabled_percentage=8,
                    low_income_percentage=22,
                    language_barrier_percentage=15
                ),
                medical_capacity=MedicalCapacity(
                    icu_beds=45,
                    icu_available=random.randint(5, 20),
                    oxygen_units=200,
                    oxygen_available=random.randint(50, 150),
                    ventilators=30,
                    ventilators_available=random.randint(5, 15),
                    surgical_capacity=random.randint(60, 95),
                    telemedicine_capable=True,
                    surge_capacity_hours=48,
                    trauma_center=True,
                    specialist_types=['cardiology', 'neurology', 'surgery', 'pediatrics']
                ),
                backup_duration_hours=48,
                economic_value_per_hour=50000,
                recovery_resource_needs={'crews': 25, 'equipment': 15, 'supplies': 200},
                status="operational",
                last_updated=now
            ),
            # East Side Medical Center
            InfrastructureNode(
                id="hosp_002",
                name="East Side Medical Center",
                type="hospital",
                location={"lat": 40.7280, "lng": -73.9865},
                capacity=300,
                current_load=random.uniform(100, 280),
                redundancy_level=1,
                dependent_on=["sub_002"],
                population_metrics=PopulationMetrics(
                    total_population=60000,
                    population_density=120,
                    elderly_percentage=20,
                    children_percentage=12,
                    disabled_percentage=6,
                    low_income_percentage=18,
                    language_barrier_percentage=10
                ),
                medical_capacity=MedicalCapacity(
                    icu_beds=25,
                    icu_available=random.randint(3, 12),
                    oxygen_units=120,
                    oxygen_available=random.randint(30, 100),
                    ventilators=15,
                    ventilators_available=random.randint(2, 8),
                    surgical_capacity=random.randint(50, 85),
                    telemedicine_capable=True,
                    surge_capacity_hours=36,
                    trauma_center=False,
                    specialist_types=['cardiology', 'surgery']
                ),
                backup_duration_hours=36,
                economic_value_per_hour=35000,
                recovery_resource_needs={'crews': 15, 'equipment': 10, 'supplies': 150},
                status="operational",
                last_updated=now
            ),
            # Downtown Substation
            InfrastructureNode(
                id="sub_001",
                name="Downtown Substation",
                type="substation",
                location={"lat": 40.7150, "lng": -74.0050},
                capacity=1000,
                current_load=random.uniform(600, 950),
                redundancy_level=1,
                dependent_on=["hosp_001", "hosp_002", "school_001"],
                population_metrics=None,
                medical_capacity=None,
                backup_duration_hours=4,
                economic_value_per_hour=75000,
                recovery_resource_needs={'crews': 20, 'equipment': 30, 'supplies': 100},
                status="operational",
                estimated_time_to_repair_hours=24,
                last_updated=now
            ),
            # East Substation
            InfrastructureNode(
                id="sub_002",
                name="East Substation",
                type="substation",
                location={"lat": 40.7300, "lng": -73.9850},
                capacity=800,
                current_load=random.uniform(400, 750),
                redundancy_level=0,
                dependent_on=["hosp_002"],
                population_metrics=None,
                medical_capacity=None,
                backup_duration_hours=2,
                economic_value_per_hour=60000,
                recovery_resource_needs={'crews': 15, 'equipment': 25, 'supplies': 80},
                status="operational",
                estimated_time_to_repair_hours=20,
                last_updated=now
            ),
            # Water Treatment Plant
            InfrastructureNode(
                id="water_001",
                name="Water Treatment Plant",
                type="water_plant",
                location={"lat": 40.7200, "lng": -74.0100},
                capacity=1000,
                current_load=random.uniform(300, 900),
                redundancy_level=1,
                dependent_on=["hosp_001"],
                population_metrics=PopulationMetrics(
                    total_population=150000,
                    population_density=200,
                    elderly_percentage=17,
                    children_percentage=16,
                    disabled_percentage=7,
                    low_income_percentage=20,
                    language_barrier_percentage=12
                ),
                medical_capacity=None,
                backup_duration_hours=8,
                economic_value_per_hour=45000,
                recovery_resource_needs={'crews': 30, 'equipment': 20, 'supplies': 150},
                status="operational",
                estimated_time_to_repair_hours=48,
                last_updated=now
            ),
            # Central Bridge
            InfrastructureNode(
                id="bridge_001",
                name="Central Bridge",
                type="bridge",
                location={"lat": 40.7175, "lng": -74.0050},
                capacity=5000,
                current_load=random.uniform(2000, 4500),
                redundancy_level=0,
                dependent_on=[],
                population_metrics=PopulationMetrics(
                    total_population=80000,
                    population_density=100,
                    elderly_percentage=16,
                    children_percentage=18,
                    disabled_percentage=5,
                    low_income_percentage=19,
                    language_barrier_percentage=8
                ),
                medical_capacity=None,
                backup_duration_hours=0,
                economic_value_per_hour=40000,
                recovery_resource_needs={'crews': 40, 'equipment': 35, 'supplies': 200},
                status="operational",
                estimated_time_to_repair_hours=72,
                last_updated=now
            ),
            # Downtown Residential Zone
            InfrastructureNode(
                id="res_zone_001",
                name="Downtown Residential Zone",
                type="residential_zone",
                location={"lat": 40.7150, "lng": -74.0100},
                capacity=50000,
                current_load=45000,
                redundancy_level=0,
                dependent_on=["sub_001", "water_001"],
                population_metrics=PopulationMetrics(
                    total_population=200000,
                    population_density=500,
                    elderly_percentage=19,
                    children_percentage=14,
                    disabled_percentage=9,
                    low_income_percentage=25,
                    language_barrier_percentage=18
                ),
                medical_capacity=None,
                backup_duration_hours=12,
                economic_value_per_hour=120000,
                recovery_resource_needs={'crews': 50, 'equipment': 40, 'supplies': 300},
                status="operational",
                last_updated=now
            ),
            # Communication Tower
            InfrastructureNode(
                id="tower_001",
                name="Communication Tower Downtown",
                type="telecom_tower",
                location={"lat": 40.7140, "lng": -74.0060},
                capacity=100,
                current_load=random.uniform(60, 95),
                redundancy_level=1,
                dependent_on=[],
                population_metrics=None,
                medical_capacity=None,
                backup_duration_hours=6,
                economic_value_per_hour=55000,
                recovery_resource_needs={'crews': 10, 'equipment': 15, 'supplies': 50},
                status="operational",
                estimated_time_to_repair_hours=12,
                last_updated=now
            ),
            # Emergency Shelter
            InfrastructureNode(
                id="shelter_001",
                name="Emergency Shelter A",
                type="shelter",
                location={"lat": 40.7100, "lng": -74.0000},
                capacity=500,
                current_load=random.uniform(0, 100),
                redundancy_level=1,
                dependent_on=["sub_001"],
                population_metrics=PopulationMetrics(
                    total_population=500,
                    population_density=50,
                    elderly_percentage=25,
                    children_percentage=20,
                    disabled_percentage=15,
                    low_income_percentage=40,
                    language_barrier_percentage=25
                ),
                medical_capacity=None,
                backup_duration_hours=24,
                economic_value_per_hour=10000,
                recovery_resource_needs={'crews': 5, 'equipment': 3, 'supplies': 100},
                status="operational",
                last_updated=now
            ),
        ]
        
        return infrastructure
