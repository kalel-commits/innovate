import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import logo from '../assets/logo.png';

export default function Dashboard() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        try {
            await logout();
            navigate('/');
        } catch {
            console.error("Failed to log out");
        }
    }

    return (
        <div className="min-h-screen bg-brand-cream font-sans">
            <nav className="bg-white/90 backdrop-blur-md border-b border-brand-brown/10 shadow-sm fixed top-0 left-0 right-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex gap-3 items-center">
                            <img src={logo} alt="EcoCycle Logo" className="h-16 w-auto object-contain flex-shrink-0" />
                        </div>
                        <div className="flex items-center gap-6">
                            <span className="text-brand-brown font-medium hidden sm:block">
                                <span className="opacity-60 text-sm mr-1">Signed in as</span> {currentUser?.email}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center px-5 py-2.5 border border-brand-red text-sm font-bold rounded-xl text-brand-red bg-white hover:bg-brand-red hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-red transition-all duration-200 shadow-sm"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto pt-24 pb-10 px-4 sm:px-6 lg:px-8">

                {/* Dashboard Header */}
                <div className="mb-10 px-4 sm:px-0">
                    <h2 className="text-3xl font-bold text-brand-brown">Dashboard Overview</h2>
                    <p className="text-brand-brown/60 mt-1">Manage your orders, inventory, and performance metrics.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 px-4 sm:px-0">
                    <StatCard
                        title="Total Orders"
                        value="1,248"
                        color="text-brand-red"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
                    />
                    <StatCard
                        title="Revenue"
                        value="$45,200"
                        color="text-brand-brown"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                    <StatCard
                        title="Active Listings"
                        value="86"
                        color="text-brand-orange"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>}
                    />
                </div>

                {/* Main Content Area */}
                <div className="px-4 sm:px-0">
                    <div className="bg-white border text-center border-brand-brown/10 rounded-3xl shadow-sm h-96 flex flex-col items-center justify-center text-brand-brown/40 p-12">
                        <div className="w-24 h-24 bg-brand-cream rounded-full flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-brand-brown mb-2">No Active Orders</h3>
                        <p className="max-w-md mx-auto">Your recent orders will appear here. Start by adding new inventory to attract customers.</p>
                        <button className="mt-8 px-8 py-3 bg-brand-red text-white font-bold rounded-xl shadow-lg shadow-brand-red/20 hover:bg-brand-brown transition-all">
                            Add New Listing
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ title, value, color, icon }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-brand-brown/5 shadow-sm hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-start">
                <div>
                    <div className="text-sm font-bold text-brand-brown/50 uppercase tracking-wider mb-1">{title}</div>
                    <div className={`text-4xl font-extrabold ${color}`}>{value}</div>
                </div>
                <div className={`p-3 rounded-xl bg-brand-cream/50 ${color}`}>
                    {icon}
                </div>
            </div>
        </div>
    )
}
