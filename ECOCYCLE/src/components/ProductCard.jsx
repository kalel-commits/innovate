import React, { useState, useEffect } from 'react';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchProductImage } from '../services/googleImageService';

export default function ProductCard({ option, index, onImageLoad }) {
    const [imageUrl, setImageUrl] = useState(null);
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        loadImage();
    }, [option.product_name]);

    const loadImage = async () => {
        setImageLoading(true);
        setImageError(false);
        try {
            const url = await fetchProductImage(option.product_name);
            setImageUrl(url);
            if (onImageLoad) {
                onImageLoad(option.product_name, url);
            }
        } catch (error) {
            console.error('Failed to load image:', error);
            setImageError(true);
        } finally {
            setImageLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-brand-brown/10 overflow-hidden hover:shadow-lg transition-all duration-300">
            {/* Image Section */}
            <div 
                className="relative h-48 bg-brand-cream/30 cursor-pointer group"
                onClick={() => setExpanded(!expanded)}
            >
                {imageLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-brand-red animate-spin" />
                    </div>
                ) : imageError ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-brand-cream">
                        <div className="text-center p-4">
                            <div className="text-4xl mb-2">🎨</div>
                            <p className="text-sm text-brand-brown/60 font-medium">{option.product_name}</p>
                        </div>
                    </div>
                ) : (
                    <img 
                        src={imageUrl} 
                        alt={option.product_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={() => setImageError(true)}
                    />
                )}
                
                {/* Overlay with product name */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-center justify-between text-white">
                            <span className="text-sm font-bold">Click to view details</span>
                            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                    </div>
                </div>

                {/* Number badge */}
                <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-brand-red text-white flex items-center justify-center font-bold text-sm shadow-lg">
                    {index + 1}
                </div>

                {/* Conversion type badge */}
                <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-brand-brown uppercase shadow-sm">
                    {option.conversion_type}
                </div>
            </div>

            {/* Product Info - Always Visible */}
            <div className="p-4">
                <h4 className="font-bold text-brand-brown text-lg mb-2">{option.product_name}</h4>
                
                {/* Quick Stats */}
                <div className="flex items-center gap-4 text-sm">
                    <span className="text-brand-green font-bold">₹{option.expected_profit_or_loss_inr}</span>
                    <span className="text-brand-brown/50">|</span>
                    <span className="text-brand-orange capitalize">{option.difficulty_level}</span>
                </div>

                {/* Expanded Details */}
                {expanded && (
                    <div className="mt-4 pt-4 border-t border-brand-brown/10 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div>
                            <div className="text-xs font-bold text-brand-brown/60 uppercase mb-1">Processing Required</div>
                            <p className="text-sm text-brand-brown">{option.required_processing}</p>
                        </div>
                        
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
                )}
            </div>
        </div>
    );
}
