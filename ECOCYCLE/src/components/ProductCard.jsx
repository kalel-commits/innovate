import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, Circle } from 'lucide-react';

export default function ProductCard({ option, index, isSelected, onToggleSelect }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden hover:shadow-lg transition-all duration-300 ${isSelected ? 'border-brand-green ring-2 ring-brand-green/20' : 'border-brand-brown/10'}`}>
            {/* Header Section - Replaces Image */}
            <div 
                className={`relative cursor-pointer group p-6 border-b border-brand-brown/10 transition-colors ${isSelected ? 'bg-gradient-to-br from-brand-green/10 to-brand-green/5' : 'bg-gradient-to-br from-brand-cream to-brand-cream/50'}`}
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-start justify-between gap-4">
                    {/* Selection Checkbox */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleSelect(option);
                        }}
                        className="flex-shrink-0 hover:scale-110 transition-transform"
                    >
                        {isSelected ? (
                            <CheckCircle2 className="w-8 h-8 text-brand-green fill-brand-green/20" />
                        ) : (
                            <Circle className="w-8 h-8 text-brand-brown/30 hover:text-brand-green" />
                        )}
                    </button>
                    
                    {/* Number badge */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-red text-white flex items-center justify-center font-bold text-lg shadow-lg">
                        {index + 1}
                    </div>
                    
                    <div className="flex-1">
                        <h4 className="font-bold text-brand-brown text-xl mb-1">{option.product_name}</h4>
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-white rounded-full text-xs font-bold text-brand-brown uppercase shadow-sm border border-brand-brown/10">
                                {option.conversion_type}
                            </span>
                        </div>
                    </div>

                    {/* Expand/Collapse Icon */}
                    <div className="flex-shrink-0 text-brand-brown/60 group-hover:text-brand-red transition-colors">
                        {expanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                    </div>
                </div>
            </div>

            {/* Quick Stats in Header */}
            <div className="px-6 py-3 bg-white border-b border-brand-brown/10">
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                        <span className="text-brand-brown/50 text-xs">Profit:</span>
                        <span className="text-brand-green font-bold">₹{option.expected_profit_or_loss_inr}</span>
                    </div>
                    <span className="text-brand-brown/20">|</span>
                    <div className="flex items-center gap-1">
                        <span className="text-brand-brown/50 text-xs">Difficulty:</span>
                        <span className="text-brand-orange capitalize font-medium">{option.difficulty_level}</span>
                    </div>
                </div>
            </div>

            {/* Expanded Details */}
            {expanded && (
                <div className="px-6 pb-6">
                    <div className="pt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* Daily Use Case - Highlighted */}
                        {option.daily_use_case && (
                            <div className="bg-brand-orange/10 rounded-lg p-3 border border-brand-orange/20">
                                <div className="text-xs font-bold text-brand-orange uppercase mb-1">💡 Daily Use</div>
                                <p className="text-sm text-brand-brown">{option.daily_use_case}</p>
                            </div>
                        )}
                        
                        <div>
                            <div className="text-xs font-bold text-brand-brown/60 uppercase mb-1">Processing Required</div>
                            <p className="text-sm text-brand-brown">{option.required_processing}</p>
                        </div>
                        
                        {/* Materials Section */}
                        {option.materials_needed && (
                            <div>
                                <div className="text-xs font-bold text-brand-brown/60 uppercase mb-1">📦 Materials Needed</div>
                                <p className="text-sm text-brand-brown">{option.materials_needed}</p>
                            </div>
                        )}
                        
                        {/* Customer Can Provide */}
                        {option.customer_can_provide && (
                            <div className="bg-brand-green/10 rounded-lg p-2 border border-brand-green/20">
                                <div className="text-xs font-bold text-brand-green uppercase mb-1">✓ You Can Provide</div>
                                <p className="text-sm text-brand-brown">{option.customer_can_provide}</p>
                            </div>
                        )}
                        
                        {/* Vendor Can Provide */}
                        {option.vendor_can_provide && (
                            <div className="bg-brand-red/10 rounded-lg p-2 border border-brand-red/20">
                                <div className="text-xs font-bold text-brand-red uppercase mb-1">🏪 Vendor Can Provide</div>
                                <p className="text-sm text-brand-brown">{option.vendor_can_provide}</p>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-brand-cream/30 rounded-lg p-2">
                                <div className="text-xs font-bold text-brand-brown/60 uppercase">Conversion Cost</div>
                                <div className="text-sm font-bold text-brand-brown">₹{option.estimated_conversion_cost_inr}</div>
                            </div>
                            <div className="bg-brand-cream/30 rounded-lg p-2">
                                <div className="text-xs font-bold text-brand-brown/60 uppercase">Market Value</div>
                                <div className="text-sm font-bold text-brand-brown">₹{option.estimated_market_value_inr}</div>
                            </div>
                        </div>

                        {option.feasibility_score && (
                            <div>
                                <div className="text-xs font-bold text-brand-brown/60 uppercase mb-1">Feasibility Score</div>
                                <div className="w-full bg-brand-cream/50 rounded-full h-2">
                                    <div 
                                        className="bg-brand-green h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${option.feasibility_score * 100}%` }}
                                    />
                                </div>
                                <div className="text-xs text-brand-brown/60 mt-1">{(option.feasibility_score * 100).toFixed(0)}% feasible</div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
