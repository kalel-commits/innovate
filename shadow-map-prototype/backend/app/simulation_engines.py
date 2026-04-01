import numpy as np
import random
from datetime import datetime, timedelta
from typing import List, Dict, Tuple
from .advanced_models import InfrastructureNode, SimulationScenario, RescuePriority, PopulationMetrics, MedicalCapacity

class MonteCarloSimulationEngine:
    """Advanced probabilistic disaster propagation using Monte Carlo methods"""
    
    def __init__(self, num_iterations: int = 10000):
        self.num_iterations = num_iterations
        self.results = {}
    
    def simulate_cascade_propagation(
        self,
        initial_failed_node: InfrastructureNode,
        all_nodes: List[InfrastructureNode],
        environmental_stress: float,  # 0-1 scale
        time_steps: int = 10
    ) -> SimulationScenario:
        """
        Run Monte Carlo simulation of cascade failures.
        Returns confidence intervals (5th, 50th, 95th percentiles)
        """
        scenario_id = f"scenario_{datetime.now().timestamp()}"
        
        risk_outcomes = {node.id: [] for node in all_nodes}
        cascade_counts = {node.id: 0 for node in all_nodes}
        
        # Run simulations
        for iteration in range(self.num_iterations):
            failed_nodes = self._simulate_single_cascade(
                initial_failed_node, 
                all_nodes.copy(),
                environmental_stress,
                time_steps
            )
            
            for failed_node_id in failed_nodes:
                cascade_counts[failed_node_id] += 1
            
            # Calculate risk for each node
            for node_id in risk_outcomes:
                node = next((n for n in all_nodes if n.id == node_id), None)
                if node and node_id in failed_nodes:
                    risk = self._calculate_node_risk_score(node, environmental_stress)
                    risk_outcomes[node_id].append(risk)
                else:
                    risk_outcomes[node_id].append(0)
        
        # Calculate percentiles
        risk_percentiles = {}
        for node_id, risks in risk_outcomes.items():
            if risks:
                risk_percentiles[node_id] = {
                    'p5': float(np.percentile(risks, 5)),
                    'p50': float(np.percentile(risks, 50)),
                    'p95': float(np.percentile(risks, 95)),
                    'mean': float(np.mean(risks)),
                    'std': float(np.std(risks))
                }
        
        # Calculate cascade probabilities
        cascade_probs = {
            node_id: count / self.num_iterations
            for node_id, count in cascade_counts.items()
        }
        
        # Check convergence (simplified)
        convergence = len(risk_outcomes) > 0
        model_uncertainty = float(np.mean([
            v['std'] for v in risk_percentiles.values() if 'std' in v
        ]))
        
        return SimulationScenario(
            scenario_id=scenario_id,
            timestamp=datetime.now(),
            num_iterations=self.num_iterations,
            affected_infrastructure=list(cascade_counts.keys()),
            risk_percentiles=risk_percentiles,
            cascade_probability_estimates=cascade_probs,
            confidence_level=0.95,
            model_uncertainty=model_uncertainty,
            convergence_achieved=convergence
        )
    
    def _simulate_single_cascade(
        self,
        initial_node: InfrastructureNode,
        all_nodes: List[InfrastructureNode],
        environmental_stress: float,
        time_steps: int
    ) -> List[str]:
        """Simulate a single cascade failure chain"""
        failed_nodes = {initial_node.id}
        
        for step in range(time_steps):
            newly_failed = set()
            
            for node in all_nodes:
                if node.id not in failed_nodes:
                    # Check if any dependencies failed
                    failed_deps = [d for d in node.dependent_on if d in failed_nodes]
                    
                    if failed_deps:
                        # Probability of failure based on:
                        # - Number of failed dependencies
                        # - Redundancy level
                        # - Environmental stress
                        dep_failure_prob = len(failed_deps) / max(1, len(node.dependent_on))
                        env_factor = environmental_stress * 0.5
                        redundancy_factor = 1.0 / (1.0 + node.redundancy_level * 0.5)
                        
                        failure_prob = min(1.0, dep_failure_prob * env_factor * redundancy_factor)
                        
                        if random.random() < failure_prob:
                            newly_failed.add(node.id)
            
            failed_nodes.update(newly_failed)
            
            if not newly_failed:  # Cascade stopped
                break
        
        return list(failed_nodes)
    
    def _calculate_node_risk_score(self, node: InfrastructureNode, env_stress: float) -> float:
        """Calculate risk score for a node (0-100)"""
        base_risk = 0.0
        
        # Load-based risk
        load_util = node.current_load / node.capacity if node.capacity > 0 else 0
        base_risk += load_util * 40
        
        # Environmental stress
        base_risk += env_stress * 30
        
        # Redundancy discount
        base_risk = max(0, base_risk - node.redundancy_level * 5)
        
        # Population impact
        if node.population_metrics:
            pop_risk = (node.population_metrics.total_population / 50000) * 20
            base_risk += pop_risk
        
        return min(100, base_risk)

class LifeImpactScoringEngine:
    """Scores infrastructure by human impact rather than just structural risk"""
    
    def __init__(self):
        self.weights = {
            'casualty_risk': 0.40,
            'vulnerable_population': 0.25,
            'medical_capacity': 0.20,
            'cascade_impact': 0.10,
            'economic': 0.05
        }
    
    def calculate_impact_score(
        self,
        node: InfrastructureNode,
        cascade_probability: float,
        affected_cascades: int
    ) -> float:
        """Calculate life-impact score (0-100)"""
        
        scores = {}
        
        # Casualty risk
        if node.population_metrics:
            potential_casualties = int(
                node.population_metrics.total_population * 
                node.population_metrics.vulnerability_score()
            )
            scores['casualty_risk'] = min(100, (potential_casualties / 100) * 10)
        else:
            scores['casualty_risk'] = 0
        
        # Vulnerable population exposure
        if node.population_metrics:
            vulnerable = (
                node.population_metrics.elderly_percentage +
                node.population_metrics.children_percentage +
                node.population_metrics.disabled_percentage
            ) / 3
            scores['vulnerable_population'] = vulnerable
        else:
            scores['vulnerable_population'] = 0
        
        # Medical capacity stress
        if node.medical_capacity:
            scores['medical_capacity'] = node.medical_capacity.capacity_stress_level() * 100
        else:
            scores['medical_capacity'] = 0
        
        # Cascade impact
        scores['cascade_impact'] = min(100, cascade_probability * affected_cascades * 10)
        
        # Economic impact per hour
        economic_score = min(100, (node.economic_value_per_hour / 10000) * 50)
        scores['economic'] = economic_score
        
        # Weighted sum
        total_score = sum(
            scores.get(key, 0) * weight
            for key, weight in self.weights.items()
        )
        
        return min(100, total_score)
    
    def rank_rescue_priorities(
        self,
        nodes: List[InfrastructureNode],
        cascade_probs: Dict[str, float]
    ) -> List[RescuePriority]:
        """Generate ranked rescue priorities based on life impact"""
        
        rescue_priorities = []
        
        for node in nodes:
            if not node.population_metrics:
                continue
            
            cascade_prob = cascade_probs.get(node.id, 0.0)
            affected_cascades = len([n for n in nodes if node.id in n.dependent_on])
            
            impact_score = self.calculate_impact_score(node, cascade_prob, affected_cascades)
            
            # Calculate metrics
            vulnerable_count = int(
                node.population_metrics.total_population *
                node.population_metrics.vulnerability_score()
            )
            
            casualty_count = int(
                node.population_metrics.total_population * 0.1 * cascade_prob
            )
            
            response_window = int(60 - impact_score)  # Minutes before critical
            
            ambulances_needed = int(casualty_count / 4)  # 4 patients per ambulance
            
            rescue_teams_needed = int(casualty_count / 20)  # 20 people per team
            
            evac_priority = max(1, min(5, int(impact_score / 20)))
            
            shelter_capacity = int(node.population_metrics.total_population * 0.1)
            
            priority = RescuePriority(
                infrastructure_id=node.id,
                casualty_count=casualty_count,
                vulnerable_population_count=vulnerable_count,
                medical_urgency_score=impact_score,
                infrastructure_criticality=cascade_prob,
                response_time_window_minutes=response_window,
                recommended_ambulances=ambulances_needed,
                recommended_rescue_teams=rescue_teams_needed,
                evacuation_priority=evac_priority,
                shelter_capacity_needed=shelter_capacity,
                estimated_lives_at_risk=casualty_count
            )
            
            rescue_priorities.append(priority)
        
        # Sort by impact score
        rescue_priorities.sort(
            key=lambda x: x.medical_urgency_score + x.infrastructure_criticality * 30,
            reverse=True
        )
        
        return rescue_priorities
