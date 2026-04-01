import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Thermometer, Wind, Droplets, Activity } from 'lucide-react';
import { useDisaster } from '../context/DisasterContext';

const DisasterControlPanel: React.FC = () => {
    const { intensity, setIntensity, hazardType, setHazardType } = useDisaster();

    const getStatusColor = () => {
        if (intensity < 30) return 'text-emerald-400';
        if (intensity < 70) return 'text-amber-400';
        return 'text-rose-500';
    };

    const hazardModes = [
        { id: 'general', label: 'General', icon: <Activity className="w-4 h-4" /> },
        { id: 'flood', label: 'Flood', icon: <Droplets className="w-4 h-4" /> },
        { id: 'earthquake', label: 'Earthquake', icon: <Activity className="w-4 h-4" /> },
        { id: 'storm', label: 'Storm', icon: <Wind className="w-4 h-4" /> },
    ];

    return (
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-white/5 ${getStatusColor()}`}>
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white uppercase text-sm tracking-tighter">Hazard Severity</h3>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Active Forecast Mode</p>
                    </div>
                </div>
                <div className={`text-3xl font-black ${getStatusColor()}`}>
                    {intensity}%
                </div>
            </div>

            {/* Hazard Mode Selector */}
            <div className="grid grid-cols-4 gap-2 mb-8">
                {hazardModes.map((mode) => (
                    <button
                        key={mode.id}
                        onClick={() => setHazardType(mode.id as any)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${hazardType === mode.id
                            ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-500/10'
                            : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10'
                            }`}
                    >
                        {mode.icon}
                        {/* Icon label for Earthquake on button */}
                        <span className="text-[8px] font-black uppercase tracking-widest">{mode.label}</span>
                    </button>
                ))}
            </div>

            <div className="relative h-12 flex items-center mb-6">
                <div className="absolute inset-0 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 opacity-20"
                        animate={{ width: `${intensity}%` }}
                    />
                </div>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={intensity}
                    onChange={(e) => setIntensity(parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <motion.div
                    className="absolute h-8 w-1 bg-white rounded-full pointer-events-none"
                    animate={{ left: `${intensity}%` }}
                />
            </div>

            <div className="grid grid-cols-4 gap-4">
                {[
                    { icon: <Droplets />, label: 'Precip', value: hazardType === 'flood' ? intensity : intensity * 0.4 },
                    { icon: <Activity />, label: 'Stress', value: hazardType === 'earthquake' ? intensity * 0.1 : intensity * 0.05 },
                    { icon: <Wind />, label: 'Force', value: hazardType === 'storm' ? intensity * 1.5 : intensity * 0.8 },
                    { icon: <Thermometer />, label: 'Thermal', value: 20 + (intensity * 0.2) },
                ].map((stat, i) => (
                    <div key={i} className="text-center p-3 rounded-2xl bg-white/5 border border-white/5 transition-all group hover:bg-white/10">
                        <div className={`w-fit mx-auto mb-2 text-gray-400 group-hover:text-indigo-400 ${intensity > 70 ? 'text-rose-400' : ''}`}>
                            {React.cloneElement(stat.icon as React.ReactElement, { className: 'w-4 h-4' })}
                        </div>
                        <div className="text-[9px] uppercase font-black text-gray-600 mb-1 tracking-tighter">{stat.label}</div>
                        <div className="text-xs font-black text-white">{stat.value.toFixed(1)}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DisasterControlPanel;
