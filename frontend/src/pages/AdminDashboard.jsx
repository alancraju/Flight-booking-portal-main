import React, { useEffect, useState } from 'react';
import { BarChart3, Plane, Ticket, IndianRupee, TrendingUp, Users, MapPin, Calendar } from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/dashboard/stats');
            setStats(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching stats:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-20">
                <div className="inline-block animate-spin">
                    <Plane className="w-12 h-12 text-orange-600" />
                </div>
                <p className="text-xl text-gray-600 mt-4">Loading Dashboard...</p>
            </div>
        );
    }

    const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
        <div className={`${bgColor} rounded-xl shadow-lg p-6 border-l-4 ${color} transform transition hover:scale-105 hover:shadow-2xl`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-600 text-sm font-semibold uppercase tracking-wider">{label}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
                </div>
                <Icon className="w-16 h-16 opacity-20 text-gray-700" />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent mb-2">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-600 text-lg">Welcome to SkyBooking India Management Portal</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <StatCard
                        icon={Plane}
                        label="Total Flights"
                        value={stats?.totalFlights}
                        color="border-blue-500"
                        bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
                    />
                    <StatCard
                        icon={Ticket}
                        label="Total Bookings"
                        value={stats?.totalBookings}
                        color="border-purple-500"
                        bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
                    />
                    <StatCard
                        icon={IndianRupee}
                        label="Total Revenue"
                        value={`₹${stats?.totalRevenue ? stats.totalRevenue.toLocaleString('en-IN') : 0}`}
                        color="border-green-500"
                        bgColor="bg-gradient-to-br from-green-50 to-green-100"
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Paid Bookings"
                        value={stats?.paidBookings}
                        color="border-emerald-500"
                        bgColor="bg-gradient-to-br from-emerald-50 to-emerald-100"
                    />
                    <StatCard
                        icon={BarChart3}
                        label="Conversion Rate"
                        value={`${stats?.conversionRate}%`}
                        color="border-orange-500"
                        bgColor="bg-gradient-to-br from-orange-50 to-orange-100"
                    />
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Quick Stats */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8 border-t-4 border-orange-600">
                        <h2 className="text-3xl font-bold mb-6 text-gray-800">Payment Statistics</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border-l-4 border-blue-500">
                                <p className="text-gray-600 text-sm font-semibold">Pending Payments</p>
                                <p className="text-3xl font-bold text-blue-600 mt-2">{stats?.pendingBookings}</p>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border-l-4 border-green-500">
                                <p className="text-gray-600 text-sm font-semibold">Successful Payments</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">{stats?.paidBookings}</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border-l-4 border-purple-500">
                                <p className="text-gray-600 text-sm font-semibold">Average per Booking</p>
                                <p className="text-3xl font-bold text-purple-600 mt-2">
                                    ₹{stats?.totalRevenue && stats?.paidBookings 
                                        ? (stats.totalRevenue / stats.paidBookings).toLocaleString('en-IN', {maximumFractionDigits: 0}) 
                                        : 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="bg-gradient-to-br from-orange-500 to-green-500 rounded-xl shadow-lg p-8 text-white">
                        <h3 className="text-2xl font-bold mb-4">📊 System Info</h3>
                        <div className="space-y-4">
                            <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur">
                                <p className="text-white text-sm opacity-80">Flights in System</p>
                                <p className="text-3xl font-bold">{stats?.totalFlights}</p>
                            </div>
                            <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur">
                                <p className="text-white text-sm opacity-80">Total Users</p>
                                <p className="text-3xl font-bold">{stats?.totalBookings}</p>
                            </div>
                            <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur">
                                <p className="text-white text-sm opacity-80">Platform Status</p>
                                <p className="text-lg font-bold text-green-300">✓ Active</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center">
                    <p className="text-gray-500 text-sm">🇮🇳 SkyBooking India - Connecting India through the Skies 🇮🇳</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
