import { Link, Outlet } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export default function Layout() {
    const { currentUser, logout } = useAuth();

    return (
        <div className="min-h-screen font-sans bg-brand-cream text-brand-black">
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b-2 border-brand-red/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <Link to="/" className="flex items-center gap-2">
                            <img src={logo} alt="EcoCycle Logo" className="h-16 w-auto object-contain" />
                        </Link>

                        <div className="flex items-center gap-4">
                            {currentUser ? (
                                <>
                                    <Link to="/dashboard" className="text-sm font-medium text-brand-brown hover:text-brand-red transition-colors">
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={() => logout()}
                                        className="px-4 py-2 text-sm font-medium text-brand-red hover:bg-brand-cream rounded-lg transition-colors border border-brand-red"
                                    >
                                        Log Out
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/auth"
                                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-red text-white text-sm font-medium rounded-full hover:bg-brand-brown transition-all hover:shadow-lg active:scale-95"
                                >
                                    <LogIn className="w-4 h-4" />
                                    Get Started
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="pt-24">
                <Outlet />
            </main>

            <footer className="bg-white border-t border-brand-brown/10 py-12 mt-20">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-brand-brown">© 2026 EcoCycle. Transforming waste into value.</p>
                </div>
            </footer>
        </div>
    );
}
