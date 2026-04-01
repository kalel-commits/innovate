import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const response = await api.post('/auth/login', formData);
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('refresh_token', response.data.refresh_token);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#070708] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.12),transparent_70%)] font-sans">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ rotate: -10, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        className="w-20 h-20 bg-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/30"
                    >
                        <Shield className="w-12 h-12 text-white" />
                    </motion.div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-3 font-display">Initialize Terminal</h1>
                    <p className="text-gray-400 font-medium">Enter operator credentials to access Shadow Map</p>
                </div>

                <div className="bg-white/[0.03] border border-white/10 p-10 rounded-[40px] backdrop-blur-3xl shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-8">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3 ml-1">Operational Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-5 text-white focus:outline-none focus:border-indigo-500/40 focus:bg-white/[0.07] transition-all font-medium"
                                    placeholder="operator@resilience.lab"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3 ml-1">Access Key</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-5 text-white focus:outline-none focus:border-indigo-500/40 focus:bg-white/[0.07] transition-all font-medium"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm font-bold flex items-center gap-3"
                            >
                                <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white font-black text-lg py-5 rounded-2xl transition-all flex items-center justify-center gap-3 group shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isLoading ? 'Decrypting...' : 'Authorize Access'}
                            {!isLoading && <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />}
                        </button>
                    </form>
                </div>

                <div className="mt-10 text-center text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
                    Restricted access. All actions are logged under the Audit Trail.
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
