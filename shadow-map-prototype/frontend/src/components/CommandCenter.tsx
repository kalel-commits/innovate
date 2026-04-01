import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { useDisaster } from '../context/DisasterContext';
import InfrastructureMap from './InfrastructureMap';

interface LifeImpactRanking {
  rank: number;
  infrastructure_id: string;
  infrastructure_name: string;
  casualty_count: number;
  vulnerable_population: number;
  medical_urgency_score: number;
  infrastructure_criticality: number;
  response_time_window_minutes: number;
  evacuation_priority: number;
  lives_at_risk: number;
  recommended_resources: {
    ambulances: number;
    rescue_teams: number;
    shelter_capacity: number;
  };
}

interface CommandCenterData {
  timestamp: string;
  alert_level: string;
  total_lives_at_risk: number;
  high_risk_infrastructure: number;
  affected_zones: number;
  critical_hospitals: number;
  top_three_priorities: Array<{
    rank: number;
    infrastructure: string;
    lives_at_risk: number;
    response_window_minutes: number;
    urgency: string;
  }>;
  simulation_confidence: string;
  model_uncertainty_std: string;
  recommended_actions: string[];
}

const CommandCenterView: React.FC = () => {
  const [briefing, setBriefing] = useState<CommandCenterData | null>(null);
  const { intensity, hazardType } = useDisaster();
  const [lifeImpactData, setLifeImpactData] = useState<any>(null);
  const [cascadeData, setCascadeData] = useState<any>(null);
  const [aiBriefing, setAiBriefing] = useState<string>('Initializing strategic link...');
  const [loading, setLoading] = useState(true);
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isInitialLoadRef.current) {
          setLoading(true);
        }

        const [briefingRes, impactRes, cascadeRes, aiRes] = await Promise.all([
          api.get(`/v2/command-center-briefing?intensity=${intensity}&hazard_type=${hazardType}`),
          api.get(`/v2/life-impact-ranking?intensity=${intensity}&hazard_type=${hazardType}`),
          api.get(`/v2/cascade-forecast?intensity=${intensity}&hazard_type=${hazardType}`),
          api.get(`/ai/briefing?intensity=${intensity}&hazard_type=${hazardType}`)
        ]);

        setBriefing(briefingRes.data);
        setLifeImpactData(impactRes.data);
        setCascadeData(cascadeRes.data);
        setAiBriefing(aiRes.data.briefing);

        if (isInitialLoadRef.current) {
          setLoading(false);
          isInitialLoadRef.current = false;
        }
      } catch (error) {
        console.error('Error fetching command center data:', error);
        if (isInitialLoadRef.current) {
          setLoading(false);
          isInitialLoadRef.current = false;
        }
      }
    };

    fetchData();
    // Refresh data every 5 seconds without showing loading spinner
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [intensity, hazardType]);

  if (loading || !briefing) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center font-mono">
        <div className="text-indigo-500 animate-pulse tracking-widest uppercase text-xs">
          📡 Initializing Command Center...
        </div>
      </div>
    );
  }

  const alertColor = {
    'CRITICAL': '#ff4444',
    'HIGH': '#ff9900',
    'NORMAL': '#44ff44'
  }[briefing.alert_level] || '#00d4ff';

  return (
    <div className="p-8 bg-[#070708] min-h-screen text-white font-sans">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tighter uppercase">🚨 SURVIVAL OPTIMIZATION CENTER</h1>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Hazard: {hazardType} | Strategic Confidence: {briefing.simulation_confidence}</p>
        </div>
        <div className="flex items-center gap-4 px-6 py-3 border rounded-2xl backdrop-blur-md" style={{ borderColor: `${alertColor}40`, backgroundColor: `${alertColor}10` }}>
          <span className="text-xs font-black tracking-widest uppercase" style={{ color: alertColor }}>
            {briefing.alert_level}
          </span>
          <span className="text-xs font-mono text-gray-500">{new Date(briefing.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Live Infrastructure Map */}
      <div className="mb-8 rounded-[32px] overflow-hidden border border-white/10 shadow-2xl">
        <InfrastructureMap />
      </div>

      {/* Critical Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Lives at Risk', value: briefing.total_lives_at_risk.toLocaleString(), color: '#ff4444' },
          { label: 'Survival Optimization', value: `${(briefing.total_lives_at_risk > 0 ? (briefing.total_lives_at_risk * 0.85 / briefing.total_lives_at_risk * 100) : 100).toFixed(1)}%`, color: '#10b981' },
          { label: 'Affected Zones', value: briefing.affected_zones, color: '#ffcc00' },
          { label: 'Golden Window', value: '24:00m', color: '#6366f1' },
        ].map((m, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl relative overflow-hidden">
            <div className="text-3xl font-black mb-2" style={{ color: m.color }}>{m.value}</div>
            <div className="text-[9px] uppercase font-black tracking-widest text-gray-500">{m.label}</div>
            {i === 1 && <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 w-[85%]" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Deployment Orders */}
        <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-3">
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            Active Deployment Orders
          </h2>
          <div className="grid gap-4">
            {lifeImpactData?.rankings?.slice(0, 3).map((rank: LifeImpactRanking, idx: number) => {
              const urgencyColor = rank.medical_urgency_score > 80 ? '#ff4444' : rank.medical_urgency_score > 60 ? '#ff9900' : '#ffcc00';
              const urgencyLabel = rank.medical_urgency_score > 80 ? 'CRITICAL' : rank.medical_urgency_score > 60 ? 'HIGH' : 'MODERATE';
              return (
                <div
                  key={rank.rank}
                  className="p-5 bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden"
                  style={{ borderLeft: `4px solid ${urgencyColor}` }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Dispatch Order #{idx + 1}</div>
                      <div className="text-sm font-black">{rank.infrastructure_name}</div>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border"
                      style={{ color: urgencyColor, borderColor: `${urgencyColor}40`, backgroundColor: `${urgencyColor}10` }}>
                      {urgencyLabel}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/5 text-center">
                    <div className="bg-rose-500/10 rounded-xl p-2">
                      <div className="text-rose-400 font-black text-sm">🚑 {rank.recommended_resources.ambulances}</div>
                      <div className="text-[8px] text-gray-600 font-bold uppercase mt-0.5">Ambulances</div>
                    </div>
                    <div className="bg-amber-500/10 rounded-xl p-2">
                      <div className="text-amber-400 font-black text-sm">👥 {rank.recommended_resources.rescue_teams}</div>
                      <div className="text-[8px] text-gray-600 font-bold uppercase mt-0.5">Rescue Teams</div>
                    </div>
                    <div className="bg-indigo-500/10 rounded-xl p-2">
                      <div className="text-indigo-400 font-black text-sm">🏠 {rank.recommended_resources.shelter_capacity}</div>
                      <div className="text-[8px] text-gray-600 font-bold uppercase mt-0.5">Shelter Cap.</div>
                    </div>
                  </div>
                  <div className="mt-2 text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                    ⏱ Respond within {rank.response_time_window_minutes} min — {rank.lives_at_risk.toLocaleString()} lives at risk
                  </div>
                </div>
              );
            })}
          </div>
        </div>


        {/* Life Impact Rankings */}
        <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-8">Life Impact Ranking</h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {lifeImpactData?.rankings?.slice(0, 8).map((rank: LifeImpactRanking) => (
              <div key={rank.rank} className="p-5 bg-white/5 rounded-2xl flex flex-col gap-3 group hover:bg-white/[0.08] transition-all border border-transparent hover:border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Priority #{rank.rank}</span>
                  <span className="text-sm font-black">{rank.infrastructure_name}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full"
                    animate={{ width: `${rank.medical_urgency_score}%` }}
                    style={{
                      backgroundColor:
                        rank.medical_urgency_score > 80 ? '#ff4444' : rank.medical_urgency_score > 60 ? '#ff9900' : '#ffcc00'
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <span>Medical Urgency: {rank.medical_urgency_score.toFixed(1)}%</span>
                  <span>🚑 {rank.recommended_resources.ambulances} amb · 👥 {rank.recommended_resources.rescue_teams} teams</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Strategic Intelligence */}
      <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-[32px] p-8 mb-8">
        <h2 className="text-sm font-black uppercase tracking-widest text-indigo-400 mb-4 flex items-center gap-3">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          Gemini AI Strategic Intelligence
        </h2>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          key={aiBriefing}
          className="text-lg font-medium text-gray-200 italic leading-relaxed"
        >
          "{aiBriefing}"
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Cascade Forecast */}
        <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-8">Cascade Failure Forecast</h2>
          <div className="grid grid-cols-2 gap-6 mb-8 text-center text-xs font-black uppercase tracking-widest">
            <div className="p-4 bg-white/5 rounded-2xl">
              <div className="text-indigo-400 mb-1">{cascadeData?.num_iterations?.toLocaleString()}</div>
              <div className="text-gray-600 font-bold">Iterations</div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl">
              <div className="text-emerald-500 mb-1">{(cascadeData?.interpretation?.mean_cascade_probability * 100)?.toFixed(1)}%</div>
              <div className="text-gray-600 font-bold">Prob Mean</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {cascadeData?.interpretation?.high_risk_nodes?.map((node: string) => (
              <span key={node} className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[9px] font-black uppercase rounded-full tracking-widest">
                {node}
              </span>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-8">Recommended Actions</h2>
          <div className="space-y-4">
            {briefing.recommended_actions.map((action, idx) => (
              <div key={idx} className="flex gap-4 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl text-sm font-medium text-gray-300">
                <span className="text-indigo-400 font-black">→</span>
                {action}
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="mt-12 pt-8 border-t border-white/5 text-center text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">
        Shadow Map Command Console | Confidence Interval {cascadeData?.confidence_level} // σ = {cascadeData?.model_uncertainty?.toFixed(2)}
      </footer>
    </div>
  );
};

export default CommandCenterView;
