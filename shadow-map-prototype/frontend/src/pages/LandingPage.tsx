import { motion } from 'framer-motion';
import { Shield, Activity, Map as MapIcon, Zap, ArrowRight, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-[#070708] text-white selection:bg-indigo-500/30 font-sans">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#070708]/70 backdrop-blur-2xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">SHADOW MAP</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link to="/demo" className="hidden sm:block text-sm font-semibold text-gray-400 hover:text-white transition-colors">Demo Mode</Link>
                        <Link to="/login" className="px-5 py-2.5 bg-indigo-500 text-white rounded-full text-sm font-bold hover:bg-indigo-400 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/20">
                            Initialize Console
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-48 pb-32 px-6 overflow-hidden">
                {/* Background Decorative Elements */}
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none animate-pulse" />
                <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-[10px] font-black tracking-[0.2em] mb-10 uppercase backdrop-blur-md">
                            <Zap className="w-3 h-3 fill-indigo-400" />
                            v2.0 Persistence Engine Ready
                        </span>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-12 leading-[1.2] font-display">
                            Predicting Urban <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 drop-shadow-sm">Survival</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-400/90 mb-16 max-w-2xl mx-auto leading-relaxed px-4">
                            A high-fidelity disaster intelligence platform. Predict cascade failures <span className="text-white font-semibold">15 minutes ahead</span> and prioritize lives over assets.
                        </p>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-6 px-4">
                            <Link to="/login" className="group w-full md:w-auto px-10 py-5 bg-white text-black rounded-2xl font-black text-lg hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-500/10">
                                Launch Dashboard <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
                            </Link>
                            <Link to="/demo" className="w-full md:w-auto px-10 py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-lg hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center backdrop-blur-md">
                                Interactive Preview
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-3 gap-10">
                        {[
                            {
                                icon: <Activity className="w-10 h-10 text-rose-400" />,
                                title: "Monte Carlo Engine",
                                desc: "Runs 10,000 simulations per minute to calculate recursive probability of infrastructure collapse.",
                                color: "rose"
                            },
                            {
                                icon: <Zap className="w-10 h-10 text-amber-400" />,
                                title: "Cascade Forecasting",
                                desc: "Propagates failure models through city-scale dependency graphs to predict service blackout ripples.",
                                color: "amber"
                            },
                            {
                                icon: <MapIcon className="w-10 h-10 text-cyan-400" />,
                                title: "Life Impact Ranking",
                                desc: "Heuristic prioritization engine that ranks response zones based on dynamic citizen density data.",
                                color: "cyan"
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ delay: i * 0.15, duration: 0.6 }}
                                className="relative p-10 rounded-[40px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all group overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="mb-8 p-5 bg-white/[0.03] border border-white/5 rounded-3xl w-fit group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                                    {feature.icon}
                                </div>
                                <h3 className="text-3xl font-black mb-6 tracking-tight">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed text-base font-medium">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 border-t border-white/5">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-indigo-500" />
                        <span className="text-lg font-bold">SHADOW MAP v2.0</span>
                    </div>
                    <div className="text-gray-500 text-sm">© 2026 Urban Resilience Lab. All rights reserved.</div>
                    <div className="flex items-center gap-6">
                        <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                            <Github className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
