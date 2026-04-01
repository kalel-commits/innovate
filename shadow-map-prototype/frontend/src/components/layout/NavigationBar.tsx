import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, Terminal, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NavigationBar: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Command Center', path: '/command', icon: <Terminal className="w-4 h-4" /> },
    ];

    return (
        <nav className="bg-[#070708] border-b border-white/10 px-8 py-4 flex items-center justify-between sticky top-0 z-[2000] backdrop-blur-xl bg-[#070708]/80">
            <div className="flex items-center gap-8">
                <div
                    onClick={() => navigate('/')}
                    className="flex items-center gap-3 cursor-pointer group"
                >
                    <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-black tracking-tight text-white hidden md:block">SHADOW MAP</span>
                </div>

                <div className="flex items-center gap-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${location.pathname === item.path
                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="w-7 h-7 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="text-xs font-bold text-gray-300">Operator</span>
                    <button
                        onClick={logout}
                        className="ml-2 p-1.5 hover:bg-rose-500/10 hover:text-rose-500 rounded-lg transition-colors text-gray-500"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default NavigationBar;
