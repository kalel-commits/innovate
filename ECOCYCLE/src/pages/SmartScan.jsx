import React, { useState } from 'react';
import { analyzeWasteImage } from '../services/gemini';
import { Upload, Camera, Loader2, ArrowRight, Leaf, DollarSign, Recycle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
                        Upload a photo of your waste to instantly identify materials, estimate value, and get eco-friendly conversion ideas.
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-brand-red to-orange-500 rounded-2xl p-6 text-white shadow-lg">
                                <div className="flex items-center gap-2 opacity-90 mb-1">
                                    <Recycle className="w-5 h-5" />
                                    <span className="text-sm font-bold uppercase tracking-wider">Material</span>
                                </div>
                                <div className="text-3xl font-extrabold">{result.waste_analysis?.detected_items?.[0]?.material_type || "Unknown"}</div>
                                <div className="text-white/80 mt-1">{result.waste_analysis?.detected_items?.[0]?.specific_object}</div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-brown/10">
                                <div className="flex items-center gap-2 text-brand-brown/60 mb-1">
                                    <Leaf className="w-5 h-5" />
                                    <span className="text-sm font-bold uppercase tracking-wider">Sustainability Score</span>
                                </div>
                                <div className="text-3xl font-extrabold text-brand-green">
                                    {result.environmental_impact?.sustainability_score || 0}/100
                                </div>
                                <div className="text-xs text-brand-brown/60 mt-1">Based on potential impact</div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-brown/10">
                                <div className="flex items-center gap-2 text-brand-brown/60 mb-1">
                                    <DollarSign className="w-5 h-5" />
                                    <span className="text-sm font-bold uppercase tracking-wider">Est. Value</span>
                                </div>
                                <div className="text-3xl font-extrabold text-brand-brown">
                                    ₹{result.quantity_estimation?.approximate_market_value || "0"}
                                </div>
                                <div className="text-xs text-brand-brown/60 mt-1">Market estimate</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column: Analysis Details */}
                            <div className="space-y-6">
                                <AnalysisCard title="Quality Assessment">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-brand-cream/30 rounded-xl">
                                            <div className="text-xs text-brand-brown/60 font-bold uppercase">Condition</div>
                                            <div className="font-medium text-brand-brown capitalize">{result.quality_assessment?.cleanliness_level?.replace('_', ' ')}</div>
                                        </div>
                                        <div className="p-3 bg-brand-cream/30 rounded-xl">
                                            <div className="text-xs text-brand-brown/60 font-bold uppercase">Damage</div>
                                            <div className="font-medium text-brand-brown capitalize">{result.quality_assessment?.damage_level?.replace('_', ' ')}</div>
                                        </div>
                                        <div className="p-3 bg-brand-cream/30 rounded-xl">
                                            <div className="text-xs text-brand-brown/60 font-bold uppercase">Reusability</div>
                                            <div className="font-medium text-brand-brown">{(result.quality_assessment?.reusability_score * 100).toFixed(0)}%</div>
                                        </div>
                                        <div className="p-3 bg-brand-cream/30 rounded-xl">
                                            <div className="text-xs text-brand-brown/60 font-bold uppercase">Weight/Vol</div>
                                            <div className="font-medium text-brand-brown">
                                                {result.quantity_estimation?.approximate_weight_kg}kg / {result.quantity_estimation?.volume_estimate_liters}L
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
                                    <div className="space-y-4">
                                        {result.conversion_options?.map((option, idx) => (
                                            <div key={idx} className="flex gap-4 p-4 rounded-xl border border-brand-brown/10 hover:border-brand-red/30 hover:bg-brand-cream/20 transition-colors">
                                                <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red font-bold flex-shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-bold text-brand-brown">{option.product_name}</h4>
                                                        <span className="text-xs font-bold px-2 py-1 bg-brand-cream rounded-lg text-brand-brown/70 uppercase">
                                                            {option.conversion_type}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-brand-brown/60 mt-1 mb-2">
                                                        Process: {option.required_processing}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-xs font-medium">
                                                        <span className="text-brand-green">Profit: ₹{option.expected_profit_or_loss_inr}</span>
                                                        <span className="text-brand-brown/50">|</span>
                                                        <span className="text-brand-orange">Diff: {option.difficulty_level}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </AnalysisCard>

                                <AnalysisCard title="AI Generation Prompts">
                                    <div className="space-y-4">
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="text-xs font-bold text-gray-400 uppercase mb-2">Product Visual</div>
                                            <p className="text-xs text-gray-600 font-mono leading-relaxed select-all">
                                                {result.image_generation?.product_visual_prompt}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="text-xs font-bold text-gray-400 uppercase mb-2">Before / After</div>
                                            <p className="text-xs text-gray-600 font-mono leading-relaxed select-all">
                                                {result.image_generation?.before_after_prompt}
                                            </p>
                                        </div>
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
