import { useAuth } from '../context/AuthContext';
import { BarChart3, Leaf, Recycle, MapPin, LogOut, User, Phone, Mail, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth } from '../firebase'; // Ensure we import auth to get the app for firestore

export default function Dashboard() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [newPhone, setNewPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const db = getFirestore(auth.app);

    useEffect(() => {
        async function fetchUserData() {
            if (currentUser) {
                const docRef = doc(db, "customers", currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserData(data);
                    if (!data.phone) {
                        setShowPhoneModal(true);
                    }
                }
            }
        }
        fetchUserData();
    }, [currentUser, db]);

    async function handleLogout() {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    }

    async function handleUpdatePhone(e) {
        e.preventDefault();
        setLoading(true);
        try {
            const docRef = doc(db, "customers", currentUser.uid);
            await updateDoc(docRef, {
                phone: newPhone
            });
            setUserData(prev => ({ ...prev, phone: newPhone }));
            setShowPhoneModal(false);
        } catch (error) {
            console.error("Error updating phone:", error);
            alert("Failed to update phone number. Please try again.");
        }
        setLoading(false);
    }

    const stats = [
        { label: 'Items Recycled', value: '128', icon: <Recycle className="w-5 h-5 text-brand-red" />, change: '+12% this month' },
        { label: 'CO2 Saved', value: '45kg', icon: <Leaf className="w-5 h-5 text-brand-orange" />, change: '+8% this month' },
        { label: 'Points Earned', value: '3,450', icon: <BarChart3 className="w-5 h-5 text-brand-brown" />, change: 'Level 5 Recycler' },
    ];

    return (
        <div className="min-h-screen bg-brand-cream flex font-sans relative">
            {/* Phone Number Modal */}
            {showPhoneModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setShowPhoneModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-brand-red"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto mb-3 text-brand-red">
                                <Phone className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-brand-black">Complete Your Profile</h2>
                            <p className="text-sm text-brand-brown/70 mt-1">Please provide your mobile number to continue.</p>
                        </div>

                        <form onSubmit={handleUpdatePhone}>
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-brand-black mb-1.5 uppercase tracking-wide">Mobile Number <span className="text-brand-red">*</span></label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        required
                                        value={newPhone}
                                        onChange={(e) => setNewPhone(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red text-brand-black placeholder-gray-400 transition-colors"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-brand-red text-white font-bold rounded-xl hover:bg-brand-brown transition-all disabled:opacity-70"
                            >
                                {loading ? 'Saving...' : 'Save Mobile Number'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Sidebar (Desktop) */}
            <aside className="hidden lg:block w-64 bg-white border-r border-brand-brown/10 flex flex-col justify-between">
                <div className="p-6">
                    <h2 className="text-xs font-bold text-brand-brown/50 uppercase tracking-wider mb-4">Menu</h2>
                    <nav className="space-y-2">
                        <SidebarLink active icon={<BarChart3 />} label="Dashboard" />
                        <SidebarLink icon={<Recycle />} label="My Recycling" />
                        <SidebarLink icon={<MapPin />} label="Find Vendors" />
                    </nav>
                </div>

                <div className="p-6">
                    <div className="bg-gradient-to-br from-brand-red to-brand-orange rounded-xl p-4 text-white shadow-lg mb-6">
                        <div className="font-bold mb-1">New Waste?</div>
                        <div className="text-sm opacity-90 mb-3">Identify and recycle in seconds.</div>
                        <button className="w-full py-2 bg-white text-brand-red font-bold rounded-lg text-sm hover:bg-brand-cream transition-colors">
                            Start Scan
                        </button>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-brand-brown/70 hover:bg-brand-red/5 hover:text-brand-red rounded-xl font-bold transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 lg:p-8 overflow-y-auto">

                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-brand-black">
                            Welcome back, <span className="text-brand-red">{userData?.name || currentUser?.displayName || 'EcoWarrior'}</span>!
                        </h1>
                        <p className="text-brand-brown font-medium">Here's your environmental impact at a glance.</p>
                    </div>
                    {/* Mobile Logout */}
                    <button
                        onClick={handleLogout}
                        className="lg:hidden p-2 text-brand-brown hover:text-brand-red self-end"
                    >
                        <LogOut className="w-6 h-6" />
                    </button>
                </div>

                {/* Profile Card & Stats Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Profile Card */}
                    <div className="bg-white p-6 rounded-xl border border-brand-brown/10 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center border-2 border-brand-red text-brand-red">
                                <User className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-brand-black">{userData?.name || 'User Name'}</h3>
                                <span className="inline-block px-2 py-0.5 bg-brand-orange/10 text-brand-orange text-xs font-bold rounded-full uppercase tracking-wide">
                                    {userData?.role || 'Customer'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-brand-brown">
                                <Mail className="w-4 h-4 text-brand-red" />
                                <span className="truncate">{userData?.email || currentUser?.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-brand-brown">
                                <Phone className="w-4 h-4 text-brand-red" />
                                <span>{userData?.phone || 'No phone number linked'}</span>
                                {!userData?.phone && (
                                    <button onClick={() => setShowPhoneModal(true)} className="text-xs text-brand-red font-bold underline ml-auto">
                                        Add
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {stats.map((stat, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl border border-brand-brown/10 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-brand-cream rounded-lg">{stat.icon}</div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${i === 2 ? 'bg-brand-brown/10 text-brand-brown' : 'bg-brand-orange/10 text-brand-orange'}`}>
                                        {stat.change}
                                    </span>
                                </div>
                                <div className="text-3xl font-bold text-brand-black mb-1">{stat.value}</div>
                                <div className="text-sm text-brand-brown font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity Placeholder */}
                <div className="bg-white rounded-xl border border-brand-brown/10 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-brand-black mb-6">Recent Activity</h2>
                    <div className="space-y-6">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="flex items-center gap-4 border-b border-brand-brown/5 last:border-0 pb-4 last:pb-0">
                                <div className="w-12 h-12 bg-brand-cream rounded-lg flex items-center justify-center text-brand-brown">
                                    <Recycle className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-brand-black">Recycled Plastic Bottles</div>
                                    <div className="text-sm text-brand-brown font-medium">2 hours ago • Verified by GreenBin Vendor</div>
                                </div>
                                <div className="font-bold text-brand-red">+50 pts</div>
                            </div>
                        ))}
                    </div>
                </div>

            </main>
        </div>
    );
}

function SidebarLink({ active, icon, label }) {
    return (
        <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${active ? 'bg-brand-red/10 text-brand-red' : 'text-brand-brown hover:bg-brand-cream'}`}>
            {icon}
            {label}
        </a>
    )
}
