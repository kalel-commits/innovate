import math
from typing import List, Dict, Tuple, Optional
from datetime import datetime, timedelta
from .advanced_models import RescuePriority, InfrastructureNode, MedicalCapacity

class AmbulanceRoutingOptimizer:
    """Optimizes ambulance routing considering live road blockages and hospital capacity"""
    
    def __init__(self):
        self.routing_cache = {}
    
    def calculate_route_cost(
        self,
        from_location: Dict,
        to_location: Dict,
        traffic_congestion: float,
        blocked_routes: List[str] = None
    ) -> Tuple[float, float]:
        """
        Calculate travel time and distance.
        Returns (time_minutes, distance_km)
        """
        # Haversine distance
        lat1, lon1 = from_location['lat'], from_location['lng']
        lat2, lon2 = to_location['lat'], to_location['lng']
        
        R = 6371  # Earth radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        
        a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        distance = R * c
        
        # Base speed: 40 km/h
        base_speed = 40
        congestion_factor = 1 + (traffic_congestion / 100)
        actual_speed = base_speed / congestion_factor
        
        time = (distance / actual_speed) * 60  # Convert to minutes
        
        # Add penalty for blocked routes
        if blocked_routes:
            time *= 1.2
        
        return (time, distance)
    
    def optimize_ambulance_dispatch(
        self,
        distress_locations: List[Dict],
        hospital_locations: List[Dict],
        available_ambulances: List[Dict],
        traffic_data: Dict
    ) -> Dict:
        """
        Optimize ambulance dispatch to minimize response time.
        Uses nearest hospital with available capacity.
        """
        dispatch_plan = {
            'assignments': [],
            'wait_times': [],
            'hospital_loads': {},
            'optimization_metric': 0.0
        }
        
        # Initialize hospital loads
        hospital_loads = {
            h['id']: h.get('current_patients', 0)
            for h in hospital_locations
        }
        
        total_wait = 0
        assignments = 0
        
        for distress in distress_locations:
            if not available_ambulances:
                break
            
            # Find nearest available ambulance
            nearest_ambulance = None
            min_response_time = float('inf')
            
            for ambulance in available_ambulances:
                response_time, _ = self.calculate_route_cost(
                    ambulance['location'],
                    distress['location'],
                    traffic_data.get('congestion', 50)
                )
                
                if response_time < min_response_time:
                    min_response_time = response_time
                    nearest_ambulance = ambulance
            
            if not nearest_ambulance:
                continue
            
            # Find best hospital
            best_hospital = min(
                hospital_locations,
                key=lambda h: (
                    hospital_loads[h['id']] / h.get('capacity', 500),
                    self.calculate_route_cost(
                        distress['location'],
                        h['location'],
                        traffic_data.get('congestion', 50)
                    )[0]
                )
            )
            
            transport_time, _ = self.calculate_route_cost(
                distress['location'],
                best_hospital['location'],
                traffic_data.get('congestion', 50)
            )
            
            total_time = min_response_time + transport_time
            
            dispatch_plan['assignments'].append({
                'ambulance_id': nearest_ambulance['id'],
                'distress_location': distress['id'],
                'destination_hospital': best_hospital['id'],
                'response_time_minutes': min_response_time,
                'transport_time_minutes': transport_time,
                'total_time_minutes': total_time
            })
            
            dispatch_plan['wait_times'].append(min_response_time)
            available_ambulances.remove(nearest_ambulance)
            hospital_loads[best_hospital['id']] += 1
            total_wait += min_response_time
            assignments += 1
        
        # Calculate optimization metric
        avg_response = (total_wait / assignments) if assignments > 0 else 0
        dispatch_plan['wait_times'] = {
            'mean': avg_response,
            'max': max(dispatch_plan['wait_times']) if dispatch_plan['wait_times'] else 0,
            'min': min(dispatch_plan['wait_times']) if dispatch_plan['wait_times'] else 0
        }
        dispatch_plan['hospital_loads'] = hospital_loads
        dispatch_plan['optimization_metric'] = avg_response
        
        return dispatch_plan

class ResourceAllocationOptimizer:
    """Optimizes emergency resource deployment and sequencing"""
    
    def optimize_resource_deployment(
        self,
        rescue_priorities: List[RescuePriority],
        available_resources: Dict[str, int],
        deployment_time_minutes: int
    ) -> Dict:
        """
        Optimize deployment of rescue teams, generators, supplies.
        Respects time windows and resource constraints.
        """
        deployment_plan = {
            'allocations': [],
            'total_coverage_percentage': 0.0,
            'unmet_needs': {},
            'timeline': []
        }
        
        remaining_resources = available_resources.copy()
        current_time = 0
        
        # Sort by priority
        for priority in rescue_priorities:
            if current_time > deployment_time_minutes:
                break
            
            allocation = {
                'infrastructure_id': priority.infrastructure_id,
                'time_deployment_minutes': current_time,
                'resources': {
                    'ambulances': 0,
                    'rescue_teams': 0,
                    'generators': 0,
                    'supplies': {}
                }
            }
            
            # Allocate ambulances
            ambulances_needed = min(
                priority.recommended_ambulances,
                remaining_resources.get('ambulances', 0)
            )
            allocation['resources']['ambulances'] = ambulances_needed
            remaining_resources['ambulances'] = remaining_resources.get('ambulances', 0) - ambulances_needed
            
            # Allocate rescue teams
            teams_needed = min(
                priority.recommended_rescue_teams,
                remaining_resources.get('rescue_teams', 0)
            )
            allocation['resources']['rescue_teams'] = teams_needed
            remaining_resources['rescue_teams'] = remaining_resources.get('rescue_teams', 0) - teams_needed
            
            # Allocate generators if critical medical facility
            if priority.medical_urgency_score > 70:
                generators = min(1, remaining_resources.get('generators', 0))
                allocation['resources']['generators'] = generators
                remaining_resources['generators'] = remaining_resources.get('generators', 0) - generators
            
            deployment_plan['allocations'].append(allocation)
            
            # Assume 15 min per location
            current_time += 15
        
        # Calculate coverage
        if rescue_priorities:
            covered = len(deployment_plan['allocations'])
            deployment_plan['total_coverage_percentage'] = (covered / len(rescue_priorities)) * 100
        
        deployment_plan['unmet_needs'] = remaining_resources
        
        return deployment_plan

class RecoveryModelingEngine:
    """Models infrastructure recovery and system restoration timelines"""
    
    def estimate_recovery_timeline(
        self,
        failed_node: InfrastructureNode,
        available_crews: int,
        available_equipment: int,
        supply_chain_delay_hours: float = 0
    ) -> Dict:
        """Estimate time to repair based on resource constraints"""
        
        base_repair_hours = failed_node.estimated_time_to_repair_hours or 24
        
        # Adjust for resource constraints
        crew_factor = max(0.5, min(2.0, available_crews / 5.0))
        equipment_factor = max(0.5, min(2.0, available_equipment / 3.0))
        
        adjusted_repair_hours = base_repair_hours / (crew_factor * equipment_factor)
        
        # Add supply chain delays
        total_hours = adjusted_repair_hours + supply_chain_delay_hours
        
        # Phase breakdown
        phases = {
            'assessment': total_hours * 0.1,
            'mobilization': total_hours * 0.15,
            'repair': total_hours * 0.65,
            'testing': total_hours * 0.10
        }
        
        # Calculate cascade healing (dependencies recover faster once fixed)
        dependent_recovery_speedup = 0.75  # 25% faster
        
        timeline = {
            'base_repair_hours': base_repair_hours,
            'adjusted_repair_hours': adjusted_repair_hours,
            'total_hours_with_supply': total_hours,
            'phases': phases,
            'estimated_restoration_time': datetime.now() + timedelta(hours=total_hours),
            'critical_path_items': [
                'assess_damage',
                'order_parts',
                'mobilize_crews',
                'repair_main_components',
                'testing_and_commissioning'
            ]
        }
        
        return timeline
    
    def model_cascading_recovery(
        self,
        failed_node: InfrastructureNode,
        all_nodes: List[InfrastructureNode],
        repair_timeline_hours: float
    ) -> Dict:
        """Model how dependent infrastructure recovers as parent repairs"""
        
        dependent_nodes = [n for n in all_nodes if failed_node.id in n.dependent_on]
        
        recovery_cascade = {
            'primary_node': failed_node.id,
            'primary_recovery_hours': repair_timeline_hours,
            'dependent_nodes': {}
        }
        
        for dep_node in dependent_nodes:
            # Dependent nodes recover based on:
            # 1. When primary is restored (repair_timeline_hours)
            # 2. Their own repair needs (25% of base repair time)
            primary_restored = repair_timeline_hours
            secondary_repair = (dep_node.estimated_time_to_repair_hours or 4) * 0.25
            
            recovery_cascade['dependent_nodes'][dep_node.id] = {
                'recovery_starts_at_hours': primary_restored,
                'secondary_repair_hours': secondary_repair,
                'total_recovery_hours': primary_restored + secondary_repair
            }
        
        return recovery_cascade
