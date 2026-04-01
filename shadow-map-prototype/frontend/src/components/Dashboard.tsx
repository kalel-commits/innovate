import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import InfrastructureMap from './InfrastructureMap';
import DisasterControlPanel from './DisasterControlPanel';
import ImpactPredictionPanel from './ImpactPredictionPanel';
import { motion } from 'framer-motion';
import { Shield, Activity, Users, Truck, Bed, AlertCircle, RefreshCcw, Cpu } from 'lucide-react';
import { useDisaster } from '../context/DisasterContext';

interface DashboardData {
  timestamp: string;
  hazard_type: string;
  total_risk_score: number;
  casualty_reduction_percentage: number;
  cascade_containment_score: number;
  critical_infrastructure_count: number;
  estimated_affected_population: number;
  available_ambulances: number;
  hospital_bed_availability: number;
  active_critical_incidents: number;
  recommendations: string[];
  top_risks: Array<{
    infrastructure_id: string;
    risk_score: number;
    hvi: number;
    lives_saved: number;
  }>;
}

const Dashboard: React.FC<{ isDemo?: boolean }> = ({ isDemo = false }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const { intensity, hazardType } = useDisaster();
  const [loading, setLoading] = useState(true);
  const [aiBriefing, setAiBriefing] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [displayedText, setDisplayedText] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`[Dashboard] Syncing v3.0 Intelligence. Intensity: ${intensity}% | Mode: ${hazardType}`);
        const response = await api.get(`/dashboard?intensity=${intensity}&hazard_type=${hazardType}`);
        setDashboardData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [intensity, hazardType]);

  // Fetch AI Briefing with 2s debounce (only fires after slider stops)
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      setAiLoading(true);
      try {
        const res = await api.get(`/ai/briefing?intensity=${Math.round(intensity)}&hazard_type=${hazardType}`);
        setAiBriefing(res.data.briefing || '');
      } catch {
        setAiBriefing('Strategic link temporarily unavailable. Continuing mission...');
      } finally {
        setAiLoading(false);
      }
    }, 2000);
    return () => clearTimeout(debounceTimer);
  }, [intensity, hazardType]);

  // Typewriter animation for the AI text
  useEffect(() => {
    if (!aiBriefing) return;
    setDisplayedText('');
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText(aiBriefing.slice(0, i + 1));
      i++;
      if (i >= aiBriefing.length) clearInterval(timer);
    }, 18);
    return () => clearInterval(timer);
  }, [aiBriefing]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-14 h-14 border-[3px] border-indigo-500/10 border-t-indigo-500 rounded-full shadow-lg shadow-indigo-500/10"
          />
          <span className="text-gray-500 font-black tracking-[0.3em] uppercase text-[10px] animate-pulse">Initializing Terminal</span>
        </div>
      </div>
    );
  }

  const getRiskColor = (score: number) => {
    if (score >= 75) return 'text-rose-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-emerald-500';
  };

  const INFRA_NAMES: Record<string, string> = {
    hosp_001: 'Central Hospital',
    hosp_002: 'East Side Medical Center',
    water_001: 'Water Treatment Plant',
    sub_001: 'Power Substation Alpha',
    sub_002: 'Power Substation Beta',
    bridge_001: 'Main Street Bridge',
    bridge_002: 'Harbor Crossing Bridge',
    res_zone_001: 'Downtown Residential Zone',
    res_zone_002: 'North Residential Zone',
    comm_001: 'Communications Tower',
  };

  const getInfraName = (id: string) =>
    INFRA_NAMES[id.toLowerCase()] || id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="min-h-screen bg-[#070708] text-white p-8 font-sans">
      {/* Top Header */}
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-indigo-500 rounded-[22px] flex items-center justify-center shadow-2xl shadow-indigo-500/30">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight font-display uppercase">SURVIVAL CONSOLE <span className="text-indigo-400 text-xs ml-3 font-black uppercase bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg tracking-widest">v3.0</span></h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.15em] mt-1">Hazard Mode: {dashboardData?.hazard_type} // Optimization Engine: ON</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Link
            to="/command"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase rounded-xl tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-lg shadow-indigo-500/10"
          >
            <Activity className="w-4 h-4" />
            Go to Command Center
          </Link>
          {isDemo && <span className="px-4 py-1.5 bg-amber-500/5 border border-amber-500/20 text-amber-500 text-[9px] font-black uppercase rounded-full tracking-widest backdrop-blur-md">Public Demo Mode</span>}
          <div className="px-6 py-4 bg-white/[0.03] border border-white/10 rounded-3xl text-xs font-mono text-gray-400/80 shadow-inner">
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </header>

      {/* AI COMMANDER — FULL-WIDTH BANNER */}
      <div className="mb-8 relative overflow-hidden rounded-[28px] border border-indigo-500/30 bg-gradient-to-r from-indigo-950/80 via-[#070708] to-purple-950/60 backdrop-blur-xl shadow-2xl shadow-indigo-500/10">
        {/* Animated background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.04)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />
        <div className="relative p-6 flex items-start gap-6">
          {/* Gemini Icon + Badge */}
          <div className="flex-shrink-0 flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Cpu className="w-7 h-7 text-white" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full whitespace-nowrap">Gemini AI</span>
          </div>
          {/* Briefing Text */}
          <div className="flex-1 min-h-[80px]">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-2 h-2 rounded-full ${aiLoading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}`} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">AI Commander — Strategic Intelligence Feed</span>
              <span className="text-[9px] font-bold text-gray-600 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">{aiLoading ? 'Processing...' : 'Live'}</span>
            </div>
            <p className="text-base font-medium text-gray-100 leading-relaxed min-h-[48px]">
              {aiLoading ? (
                <span className="text-gray-500 italic">Analyzing tactical situation...</span>
              ) : (
                <>
                  <span className="text-indigo-400 font-black text-lg mr-2">"</span>
                  {displayedText}
                  <span className="inline-block w-0.5 h-5 bg-indigo-400 ml-0.5 animate-pulse" />
                  <span className="text-indigo-400 font-black text-lg ml-1">"</span>
                </>
              )}
            </p>
          </div>
          {/* Live stats row */}
          <div className="flex-shrink-0 flex flex-col gap-2 text-right">
            <div className="text-[9px] font-black uppercase tracking-widest text-gray-600">Intensity</div>
            <div className="text-2xl font-black text-indigo-400">{intensity}%</div>
            <div className="text-[9px] font-black uppercase tracking-widest text-gray-600 mt-1">Hazard</div>
            <div className="text-xs font-black uppercase text-purple-400">{hazardType}</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-8">
          <DisasterControlPanel />

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Casualty Reduction', value: `${(dashboardData?.casualty_reduction_percentage ?? 0).toFixed(1)}%`, icon: <Shield />, color: 'text-emerald-400' },
              { label: 'Containment Score', value: `${(dashboardData?.cascade_containment_score ?? 0).toFixed(0)}%`, icon: <Activity />, color: 'text-indigo-400' },
              { label: 'Lives at Risk', value: `${((dashboardData?.estimated_affected_population || 0) / 1000).toFixed(1)}K`, icon: <Users />, color: 'text-rose-500' },
              { label: 'Active Alerts', value: dashboardData?.active_critical_incidents ?? 0, icon: <RefreshCcw />, color: 'text-amber-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl group hover:bg-white/[0.05] transition-all relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-gray-500 group-hover:text-indigo-400 transition-colors">{stat.icon}</div>
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{stat.label}</span>
                </div>
                <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
                {i === 0 && <div className="absolute bottom-0 left-0 h-1 bg-emerald-500" style={{ width: `${dashboardData?.casualty_reduction_percentage ?? 0}%` }} />}
              </div>
            ))}
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-6 flex items-center justify-between">
              Resource Status
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-indigo-400" />
                  <span className="text-sm font-bold">Ambulance Units</span>
                </div>
                <span className="text-xl font-black text-white">{dashboardData?.available_ambulances}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bed className="w-5 h-5 text-indigo-400" />
                  <span className="text-sm font-bold">Bed Availability</span>
                </div>
                <span className="text-xl font-black text-white">{dashboardData?.hospital_bed_availability}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="relative group">
            <InfrastructureMap />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8">
              <h3 className="text-sm font-black uppercase tracking-tighter text-gray-500 mb-6 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Priority Directives
              </h3>
              <ul className="space-y-4">
                {dashboardData?.recommendations.map((rec: string, i: number) => (
                  <motion.li
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i}
                    className="p-4 bg-white/5 border border-white/5 rounded-2xl text-sm leading-relaxed text-gray-300"
                  >
                    {rec}
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8">
              <h3 className="text-sm font-black uppercase tracking-tighter text-gray-500 mb-6">Human Vulnerability Index (HVI)</h3>
              <div className="space-y-6">
                {dashboardData?.top_risks.map((risk: any, i: number) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-200 uppercase tracking-widest">{getInfraName(risk.infrastructure_id)}</span>
                        <span className="text-[9px] text-emerald-400 font-bold uppercase transition-all">Lives Saved: {risk.lives_saved}</span>
                      </div>
                      <span className={`text-xs font-black ${getRiskColor(risk.hvi)}`}>HVI: {risk.hvi.toFixed(1)}</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${risk.hvi}%` }}
                        className={`h-full ${risk.hvi > 70 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Impact Prediction Engine ── */}
      <div className="mt-8 bg-white/[0.02] border border-white/10 rounded-[32px] p-8">
        <ImpactPredictionPanel />
      </div>
    </div>
  );
};

export default Dashboard;
