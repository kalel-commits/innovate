import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useDisaster } from '../context/DisasterContext';

interface NodePrediction {
    node_id: string;
    node_name: string;
    node_type: string;
    failure_probability_pct: number;
    time_to_failure_minutes: number;
    affected_population: number;
    icu_overload_probability_pct: number;
    ambulance_delay_probability_pct: number;
}

interface PredictionData {
    hazard_type: string;
    hazard_inputs: Record<string, number | string | object>;
    node_predictions: NodePrediction[];
    system: {
        total_affected_population: number;
        cascade_spread_radius_km: number;
        recovery_time_hours: number;
        icu_overload_probability_pct: number;
        ambulance_delay_probability_pct: number;
        impact_confidence_score_pct: number;
    };
    trajectory: {
        current_intensity_pct: number;
        t_plus_15_min_pct: number;
        t_plus_30_min_pct: number;
        t_plus_60_min_pct: number;
    };
}

interface AiTimeline {
    stages: Array<{ label: string; intensity_pct: number; prediction: string }>;
}

const HAZARD_CONFIG: Record<string, { color: string; glow: string; label: string; icon: string }> = {
    flood: { color: '#3b82f6', glow: 'rgba(59,130,246,0.15)', label: 'FLOOD', icon: '🌊' },
    earthquake: { color: '#f59e0b', glow: 'rgba(245,158,11,0.15)', label: 'EARTHQUAKE', icon: '🌍' },
    storm: { color: '#94a3b8', glow: 'rgba(148,163,184,0.15)', label: 'STORM', icon: '🌪️' },
    general: { color: '#f43f5e', glow: 'rgba(244,63,94,0.15)', label: 'GENERAL', icon: '⚠️' },
};

const NODE_ICONS: Record<string, string> = {
    hospital: '🏥', water: '💧', power: '⚡', transport: '🌉', residential: '🏘️',
};

const HAZARD_INPUT_LABELS: Record<string, string> = {
    rainfall_mm_per_hour: 'Rainfall mm/hr',
    river_level_m: 'River Level (m)',
    soil_saturation: 'Soil Saturation',
    forecast_duration_hours: 'Forecast (hrs)',
    magnitude: 'Magnitude Mw',
    depth_km: 'Depth (km)',
    epicenter_lat: 'Epicenter Lat',
    epicenter_lon: 'Epicenter Lon',
    wind_speed_kmh: 'Wind km/h',
    storm_surge_m: 'Storm Surge (m)',
    direction: 'Direction',
};

const ImpactPredictionPanel: React.FC = () => {
    const { intensity, hazardType } = useDisaster();
    const [predData, setPredData] = useState<PredictionData | null>(null);
    const [aiTimeline, setAiTimeline] = useState<AiTimeline | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const cfg = HAZARD_CONFIG[hazardType] || HAZARD_CONFIG.general;

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get(`/predict?intensity=${intensity}&hazard_type=${hazardType}`);
                setPredData(res.data);
            } catch (e) { /* silent */ }
        };
        fetch();
        const iv = setInterval(fetch, 8000);
        return () => clearInterval(iv);
    }, [intensity, hazardType]);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        setAiLoading(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await api.get(`/ai/predict?intensity=${intensity}&hazard_type=${hazardType}`);
                setAiTimeline(res.data);
            } catch (e) { /* silent */ }
            finally { setAiLoading(false); }
        }, 2500);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [intensity, hazardType]);

    return (
        <div className="flex flex-col gap-8">

            {/* ══ HERO HEADER ══ */}
            <div
                className="relative rounded-[28px] overflow-hidden p-8 md:p-10"
                style={{ background: `linear-gradient(135deg, ${cfg.glow} 0%, rgba(255,255,255,0.02) 100%)`, border: `1px solid ${cfg.color}30` }}
            >
                {/* Background pulse ring */}
                <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10 blur-3xl"
                    style={{ backgroundColor: cfg.color }} />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl">{cfg.icon}</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.25em]"
                                style={{ color: cfg.color }}>
                                {cfg.label} · Real-time Impact Prediction
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-tight">
                            Impact Prediction<br />
                            <span style={{ color: cfg.color }}>Engine</span>
                        </h2>
                        <p className="text-sm text-gray-400 font-medium mt-3 max-w-lg">
                            AI-driven failure forecasting — computes per-node collapse probability,
                            medical system overload, and cascade spread in real time.
                        </p>
                    </div>

                    {/* Confidence dial */}
                    {predData && (
                        <div className="flex flex-col items-center gap-2 flex-shrink-0">
                            <div className="relative w-28 h-28">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                                    <motion.circle
                                        cx="50" cy="50" r="40" fill="none"
                                        stroke={cfg.color} strokeWidth="10"
                                        strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 40}`}
                                        animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - predData.system.impact_confidence_score_pct / 100) }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-black" style={{ color: cfg.color }}>
                                        {predData.system.impact_confidence_score_pct}%
                                    </span>
                                </div>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Confidence Score</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ══ SENSOR INPUTS ══ */}
            {predData && (
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: cfg.color }} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                            📡 Live Sensor Feed — {cfg.label}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {Object.entries(predData.hazard_inputs)
                            .filter(([, v]) => typeof v !== 'object')
                            .map(([key, value]) => (
                                <motion.div
                                    key={key}
                                    layout
                                    className="relative rounded-2xl p-4 overflow-hidden"
                                    style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${cfg.color}20` }}
                                >
                                    <div className="text-2xl font-black tabular-nums mb-1" style={{ color: cfg.color }}>
                                        {typeof value === 'number' ? value.toLocaleString() : String(value)}
                                    </div>
                                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                                        {HAZARD_INPUT_LABELS[key] || key}
                                    </div>
                                </motion.div>
                            ))}
                    </div>
                </div>
            )}

            {/* ══ BIG SYSTEM METRICS ══ */}
            {predData && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        {
                            icon: '👥', label: 'Population at Risk',
                            value: predData.system.total_affected_population.toLocaleString(),
                            sub: 'projected affected civilians', color: '#ff4444',
                        },
                        {
                            icon: '🌐', label: 'Cascade Spread Radius',
                            value: `${predData.system.cascade_spread_radius_km} km`,
                            sub: 'failure propagation distance', color: cfg.color,
                        },
                        {
                            icon: '🔧', label: 'Recovery Estimate',
                            value: `${predData.system.recovery_time_hours}h`,
                            sub: 'time to full restoration', color: '#f59e0b',
                        },
                    ].map((m) => (
                        <div key={m.label}
                            className="rounded-[24px] p-6 flex flex-col gap-3"
                            style={{ background: `${m.color}08`, border: `1px solid ${m.color}25` }}>
                            <span className="text-3xl">{m.icon}</span>
                            <div>
                                <div className="text-4xl font-black tracking-tight" style={{ color: m.color }}>{m.value}</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">{m.label}</div>
                                <div className="text-xs text-gray-600 mt-0.5">{m.sub}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ══ MEDICAL STRESS GAUGES ══ */}
            {predData && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        { label: 'ICU Overload Probability', value: predData.system.icu_overload_probability_pct, icon: '🏥', color: '#ff4444' },
                        { label: 'Ambulance Delay Probability', value: predData.system.ambulance_delay_probability_pct, icon: '🚑', color: '#ff9900' },
                    ].map((g) => (
                        <div key={g.label} className="rounded-[24px] p-6 bg-white/[0.03] border border-white/10">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <span className="text-xl mr-2">{g.icon}</span>
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">{g.label}</span>
                                </div>
                                <span className="text-3xl font-black" style={{ color: g.color }}>{g.value.toFixed(0)}%</span>
                            </div>
                            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full"
                                    animate={{ width: `${g.value}%` }}
                                    transition={{ duration: 0.9, ease: 'easeOut' }}
                                    style={{ background: `linear-gradient(90deg, ${g.color}80, ${g.color})` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ══ PER-NODE FAILURE PREDICTIONS ══ */}
            {predData && (
                <div>
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                            ⚡ Infrastructure Failure Forecast — Per Node
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {predData.node_predictions.map((node) => {
                            const fp = node.failure_probability_pct;
                            const barColor = fp > 70 ? '#ff4444' : fp > 40 ? '#ff9900' : '#10b981';
                            const ttfColor = node.time_to_failure_minutes <= 10 ? '#ff4444'
                                : node.time_to_failure_minutes <= 25 ? '#ff9900' : '#10b981';
                            return (
                                <div key={node.node_id}
                                    className="rounded-2xl p-5 bg-white/[0.03] border border-white/10 flex flex-col gap-3"
                                    style={{ borderLeft: `3px solid ${barColor}` }}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{NODE_ICONS[node.node_type] || '📍'}</span>
                                            <div>
                                                <div className="text-sm font-black text-white">{node.node_name}</div>
                                                <div className="text-[8px] font-bold uppercase tracking-widest text-gray-600">{node.node_type}</div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-xl font-black tabular-nums" style={{ color: barColor }}>{fp.toFixed(0)}%</span>
                                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest"
                                                style={{ color: ttfColor, borderColor: `${ttfColor}40`, backgroundColor: `${ttfColor}10` }}>
                                                ⏱ {node.time_to_failure_minutes}m
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div className="h-full rounded-full"
                                            animate={{ width: `${fp}%` }}
                                            transition={{ duration: 0.7, ease: 'easeOut' }}
                                            style={{ background: `linear-gradient(90deg, ${barColor}60, ${barColor})` }}
                                        />
                                    </div>
                                    <div className="flex gap-4 text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                                        <span>👥 {node.affected_population.toLocaleString()} at risk</span>
                                        <span className="ml-auto">ICU {node.icu_overload_probability_pct.toFixed(0)}%</span>
                                        <span>Amb {node.ambulance_delay_probability_pct.toFixed(0)}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ══ GEMINI AI TRAJECTORY ══ */}
            <div className="rounded-[28px] p-8"
                style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.03))', border: '1px solid rgba(99,102,241,0.25)' }}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-pulse" />
                    <span className="text-sm font-black uppercase tracking-[0.2em] text-indigo-300">
                        Gemini AI · Disaster Trajectory Forecast
                    </span>
                    {aiLoading && (
                        <span className="ml-auto text-[9px] text-indigo-400 animate-pulse font-black uppercase tracking-widest">
                            Generating prediction...
                        </span>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {aiTimeline && !aiLoading ? (
                        <motion.div key={`${intensity}-${hazardType}`}
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="flex flex-col gap-6">
                            {aiTimeline.stages.map((stage, idx) => {
                                const stageColor = idx === 0 ? '#10b981' : idx === 1 ? '#f59e0b' : '#ff4444';
                                return (
                                    <div key={stage.label} className="flex gap-5 items-start">
                                        <div className="flex flex-col items-center gap-2 flex-shrink-0 w-16">
                                            <div className="text-base font-black" style={{ color: stageColor }}>{stage.label}</div>
                                            <div className="text-xs font-black text-gray-400 tabular-nums">{stage.intensity_pct}%</div>
                                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div className="h-full rounded-full"
                                                    animate={{ width: `${stage.intensity_pct}%` }}
                                                    transition={{ duration: 0.7 }}
                                                    style={{ backgroundColor: stageColor }}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1 p-4 rounded-2xl" style={{ background: `${stageColor}08`, border: `1px solid ${stageColor}20` }}>
                                            <p className="text-sm text-gray-200 font-medium italic leading-relaxed">{stage.prediction}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="flex flex-col gap-6">
                            {['T+15', 'T+30', 'T+60'].map((t) => (
                                <div key={t} className="flex gap-5 items-start">
                                    <div className="w-16 flex flex-col gap-2">
                                        <div className="text-base font-black text-indigo-400/40">{t}</div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full animate-pulse" />
                                    </div>
                                    <div className="flex-1 h-14 bg-white/[0.03] rounded-2xl animate-pulse" />
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    );
};

export default ImpactPredictionPanel;
