import React, { useState } from 'react';
import { analyzeWasteImage } from '../services/gemini';
import { Upload, Camera, Loader2, ArrowRight, Leaf, DollarSign, Recycle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

export default function SmartScan() {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleFile = (file) => {
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size should be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
            setImage(reader.result);
            setResult(null);
            setError('');
        };
        reader.readAsDataURL(file);
    };

    const handleAnalyze = async () => {
        if (!image) return;

        setAnalyzing(true);
        setError('');
        try {
            const data = await analyzeWasteImage(image);
            setResult(data);
        } catch (err) {
            setError(err.message || 'Failed to analyze image. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    const AnalysisCard = ({ title, children, className = "" }) => (
        <div className={`bg-white rounded-2xl shadow-sm border border-brand-brown/10 p-6 ${className}`}>
            <h3 className="text-lg font-bold text-brand-brown mb-4 border-b border-brand-brown/10 pb-2">{title}</h3>
            {children}
        </div>
    );

    return (
        <div className="min-h-screen bg-brand-cream pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-brand-brown mb-4">Smart Scan AI Analysis</h1>
                    <p className="text-brand-brown/60 max-w-2xl mx-auto">
                        Upload a photo of your waste to instantly identify materials, estimate value, and discover eco-friendly conversion ideas.
                    </p>
                </div>

                {/* Upload Section */}
                {!result && (
                    <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-dashed border-brand-brown/20 hover:border-brand-red/50 transition-colors">
                        <div className="flex flex-col items-center justify-center space-y-6">
                            {preview ? (
                                <div className="relative w-full max-w-md aspect-video rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
                                    <img src={preview} alt="Upload preview" className="w-full h-full object-contain" />
                                    <button
                                        onClick={() => { setPreview(null); setImage(null); }}
                                        className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-sm hover:text-brand-red"
                                    >
                                        <Upload className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center space-y-4 py-12">
                                    <div className="w-20 h-20 bg-brand-cream rounded-full flex items-center justify-center mx-auto text-brand-brown/50">
                                        <Camera className="w-10 h-10" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-brand-brown">Drag & drop or click to upload</p>
                                        <p className="text-sm text-brand-brown/50 mt-1">Supports JPG, PNG (Max 5MB)</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4 w-full max-w-xs">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    id="image-upload"
                                />
                                {!preview && (
                                    <label
                                        htmlFor="image-upload"
                                        className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-6 py-3 bg-white border border-brand-brown/20 rounded-xl font-bold text-brand-brown hover:bg-brand-cream transition-colors"
                                    >
                                        <Upload className="w-5 h-5" />
                                        Select Image
                                    </label>
                                )}
                                {preview && (
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={analyzing}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-brand-red text-white rounded-xl font-bold hover:bg-[#c4442b] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-brand-red/25"
                                    >
                                        {analyzing ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                Run Analysis
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-brand-red bg-red-50 px-4 py-2 rounded-lg text-sm font-medium">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Results Section */}
                {result && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Top Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Material Card - Enhanced */}
                            <div className="bg-gradient-to-br from-brand-red to-orange-500 rounded-2xl p-6 text-white shadow-lg">
                                <div className="flex items-center gap-2 opacity-90 mb-2">
                                    <Recycle className="w-5 h-5" />
                                    <span className="text-sm font-bold uppercase tracking-wider">Detected Materials</span>
                                </div>
                                <div className="space-y-2">
                                    {result.waste_analysis?.detected_items?.slice(0, 2).map((item, idx) => (
                                        <div key={idx} className={idx > 0 ? "text-sm opacity-90" : ""}>
                                            <div className={idx === 0 ? "text-2xl font-extrabold" : "text-lg font-bold"}>
                                                {item.material_type}
                                            </div>
                                            <div className="text-white/80 text-xs">
                                                {item.specific_object}
                                            </div>
                                        </div>
                                    ))}
                                    {result.waste_analysis?.detected_items?.length > 2 && (
                                        <div className="text-xs text-white/70 mt-1">
                                            +{result.waste_analysis.detected_items.length - 2} more items
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Scrap Dealer Value (Bhangar Wale) */}
                            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
                                <div className="flex items-center gap-2 opacity-90 mb-1">
                                    <DollarSign className="w-5 h-5" />
                                    <span className="text-sm font-bold uppercase tracking-wider">Scrap Value</span>
                                </div>
                                <div className="text-3xl font-extrabold">
                                    ₹{result.quantity_estimation?.approximate_market_value || "0"}
                                </div>
                                <div className="text-xs text-white/80 mt-1">If sold to bhangar wale</div>
                            </div>

                            {/* Conversion Value */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-brand-green/30">
                                <div className="flex items-center gap-2 text-brand-green/80 mb-1">
                                    <DollarSign className="w-5 h-5" />
                                    <span className="text-sm font-bold uppercase tracking-wider">Conversion Value</span>
                                </div>
                                <div className="text-3xl font-extrabold text-brand-green">
                                    ₹{result.conversion_options?.[0]?.estimated_market_value_inr || "0"}
                                </div>
                                <div className="text-xs text-brand-brown/60 mt-1">Best conversion option</div>
                            </div>

                            {/* Sustainability Score */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-brown/10">
                                <div className="flex items-center gap-2 text-brand-brown/60 mb-1">
                                    <Leaf className="w-5 h-5" />
                                    <span className="text-sm font-bold uppercase tracking-wider">Eco Score</span>
                                </div>
                                <div className="text-3xl font-extrabold text-brand-green">
                                    {result.environmental_impact?.sustainability_score || 0}/100
                                </div>
                                <div className="text-xs text-brand-brown/60 mt-1">Environmental impact</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column: Analysis Details */}
                            <div className="space-y-6">
                                <AnalysisCard title="Quality Assessment">
                                    {/* Reusability Score - Highlighted */}
                                    <div className="bg-gradient-to-r from-brand-green/10 to-brand-blue/10 rounded-xl p-4 mb-4 border border-brand-green/20">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-bold text-brand-brown/80">Reusability Potential</span>
                                            <span className="text-2xl font-extrabold text-brand-green">
                                                {(result.quality_assessment?.reusability_score * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-white rounded-full h-3 overflow-hidden shadow-inner">
                                            <div 
                                                className="bg-gradient-to-r from-brand-green to-brand-blue h-3 rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${(result.quality_assessment?.reusability_score * 100).toFixed(0)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Condition Details Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white border-2 border-brand-cream rounded-xl p-4 hover:border-brand-orange/30 transition-colors">
                                            <div className="text-xs text-brand-brown/50 font-bold uppercase mb-1">Cleanliness</div>
                                            <div className="text-lg font-bold text-brand-brown capitalize">
                                                {result.quality_assessment?.cleanliness_level?.replace(/_/g, ' ') || 'N/A'}
                                            </div>
                                        </div>
                                        <div className="bg-white border-2 border-brand-cream rounded-xl p-4 hover:border-brand-red/30 transition-colors">
                                            <div className="text-xs text-brand-brown/50 font-bold uppercase mb-1">Damage Level</div>
                                            <div className="text-lg font-bold text-brand-brown capitalize">
                                                {result.quality_assessment?.damage_level?.replace(/_/g, ' ') || 'N/A'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quantity Details */}
                                    <div className="mt-4 bg-brand-cream/30 rounded-xl p-4">
                                        <div className="text-xs text-brand-brown/60 font-bold uppercase mb-3">Estimated Quantity</div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-sm text-brand-brown/60">Weight</div>
                                                <div className="text-xl font-bold text-brand-brown">
                                                    {result.quantity_estimation?.approximate_weight_kg || '0'} kg
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-brand-brown/60">Volume</div>
                                                <div className="text-xl font-bold text-brand-brown">
                                                    {result.quantity_estimation?.volume_estimate_liters || '0'} L
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </AnalysisCard>

                                <AnalysisCard title="Best Recommendation">
                                    <div className="bg-brand-red/5 border border-brand-red/10 rounded-xl p-4 mb-4">
                                        <h4 className="font-bold text-brand-red mb-2">{result.best_recommendation?.recommended_option}</h4>
                                        <p className="text-sm text-brand-brown/80 leading-relaxed">
                                            {result.best_recommendation?.reasoning}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                        <div className="bg-white p-2 rounded-lg border border-brand-brown/10">
                                            <div className="font-bold text-brand-brown">Feasibility</div>
                                            <div className="text-brand-orange">High</div>
                                        </div>
                                        <div className="bg-white p-2 rounded-lg border border-brand-brown/10">
                                            <div className="font-bold text-brand-brown">Economic</div>
                                            <div className="text-brand-green">Good</div>
                                        </div>
                                        <div className="bg-white p-2 rounded-lg border border-brand-brown/10">
                                            <div className="font-bold text-brand-brown">Eco Impact</div>
                                            <div className="text-brand-blue">Positive</div>
                                        </div>
                                    </div>
                                </AnalysisCard>
                            </div>

                            {/* Right Column: Conversion Options */}
                            <div className="space-y-6">
                                <AnalysisCard title="Conversion Ideas">
                                    <p className="text-sm text-brand-brown/60 mb-4">Explore creative ways to repurpose your waste</p>
                                    <div className="grid grid-cols-1 gap-4">
                                        {result.conversion_options?.map((option, idx) => (
                                            <ProductCard 
                                                key={idx} 
                                                option={option} 
                                                index={idx}
                                            />
                                        ))}
                                    </div>
                                </AnalysisCard>
                            </div>
                        </div>

                        <div className="flex justify-center pt-8">
                            <button
                                onClick={() => { setResult(null); setImage(null); setPreview(null); }}
                                className="px-8 py-3 bg-white border border-brand-brown/20 rounded-xl font-bold text-brand-brown hover:bg-brand-cream transition-colors shadow-sm"
                            >
                                Analyze Another Item
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
