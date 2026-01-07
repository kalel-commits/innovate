import { Link, Outlet } from 'react-router-dom';
import { Leaf, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
    const { currentUser, logout } = useAuth();

    return (
        <div className="min-h-screen font-sans bg-gray-50 text-gray-900">
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="p-2 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg">
                                <Leaf className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-800">
                                EcoCycle
                            </span>
                        </Link>

                        <div className="flex items-center gap-4">
                            {currentUser ? (
                                <>
                                    <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors">
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={() => logout()}
                                        className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        Log Out
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/auth"
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all hover:shadow-lg active:scale-95"
                                >
                                    <LogIn className="w-4 h-4" />
                                    Get Started
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="pt-16">
                <Outlet />
            </main>

            <footer className="bg-white border-t border-gray-100 py-12 mt-20">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-500">© 2024 EcoCycle. Transforming waste into value.</p>
                </div>
            </footer>
        </div>
    );
}
