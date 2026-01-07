import { useAuth } from '../context/AuthContext';
import { BarChart3, Leaf, Recycle, MapPin, Plus } from 'lucide-react';

export default function Dashboard() {
    const { currentUser } = useAuth();

    const stats = [
        { label: 'Items Recycled', value: '128', icon: <Recycle className="w-5 h-5 text-purple-600" />, change: '+12% this month' },
        { label: 'CO2 Saved', value: '45kg', icon: <Leaf className="w-5 h-5 text-green-600" />, change: '+8% this month' },
        { label: 'Points Earned', value: '3,450', icon: <BarChart3 className="w-5 h-5 text-blue-600" />, change: 'Level 5 Recycler' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar (Desktop) */}
            <aside className="hidden lg:block w-64 bg-white border-r border-gray-200">
                <div className="p-6">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Menu</h2>
                    <nav className="space-y-2">
                        <SidebarLink active icon={<BarChart3 />} label="Dashboard" />
                        <SidebarLink icon={<Recycle />} label="My Recycling" />
                        <SidebarLink icon={<MapPin />} label="Find Vendors" />
                    </nav>
                </div>
                <div className="p-6 mt-10">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white">
                        <div className="font-bold mb-1">New Waste?</div>
                        <div className="text-sm opacity-90 mb-3">Identify and recycle in seconds.</div>
                        <button className="w-full py-2 bg-white text-green-700 font-bold rounded-lg text-sm hover:bg-opacity-90 transition-colors">
                            Start Scan
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 lg:p-8">

                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome back, {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'EcoWarrior'}!
                    </h1>
                    <p className="text-gray-500">Here's your environmental impact at a glance.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-gray-50 rounded-lg">{stat.icon}</div>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${i === 2 ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                    {stat.change}
                                </span>
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                            <div className="text-sm text-gray-500">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Recent Activity Placeholder */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h2>
                    <div className="space-y-6">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="flex items-center gap-4 border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                    <Recycle className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">Recycled Plastic Bottles</div>
                                    <div className="text-sm text-gray-500">2 hours ago • Verified by GreenBin Vendor</div>
                                </div>
                                <div className="font-bold text-green-600">+50 pts</div>
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
        <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${active ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            {icon}
            {label}
        </a>
    )
}
