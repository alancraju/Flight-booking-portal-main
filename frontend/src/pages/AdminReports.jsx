import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

const AdminReports = () => {
    const [revenueData, setRevenueData] = useState([]);
    const [bookingData, setBookingData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
        const interval = setInterval(fetchReports, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchReports = async () => {
        try {
            const revenueResponse = await axios.get('http://localhost:5000/api/admin/reports/revenue');
            const bookingResponse = await axios.get('http://localhost:5000/api/admin/reports/bookings');
            
            setRevenueData(revenueResponse.data);
            setBookingData(bookingResponse.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching reports:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-20"><div className="inline-block animate-spin"><BarChart className="w-12 h-12 text-orange-600" /></div><p className="text-gray-600 mt-4">Loading reports...</p></div>;
    }

    const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    const formatCurrency = (value) => `₹${(value / 100000).toFixed(1)}L`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent mb-8">📊 Reports & Analytics</h1>

                {/* Revenue Chart */}
                <div className="bg-white rounded-xl shadow-2xl p-8 mb-8 border-t-4 border-orange-600">
                    <h2 className="text-3xl font-bold mb-6 text-gray-800">💰 Daily Revenue (Last 30 Days)</h2>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="_id" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip 
                                formatter={(value, name) => {
                                    if (name === 'dailyRevenue') return [`₹${value.toLocaleString('en-IN')}`, 'Revenue'];
                                    return [value, 'Bookings'];
                                }}
                                contentStyle={{ backgroundColor: '#fff', border: '2px solid #f97316', borderRadius: '8px' }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="dailyRevenue"
                                stroke="#f97316"
                                name="Daily Revenue (₹)"
                                strokeWidth={3}
                                dot={{ fill: '#f97316', r: 5 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="bookingCount"
                                stroke="#10b981"
                                name="Bookings"
                                yAxisId="right"
                                strokeWidth={3}
                                dot={{ fill: '#10b981', r: 5 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Booking Status Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-xl shadow-2xl p-8 border-t-4 border-orange-600">
                        <h2 className="text-3xl font-bold mb-6 text-gray-800">💵 Revenue by Booking Status</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={bookingData}
                                    dataKey="totalAmount"
                                    nameKey="_id"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={({ _id, totalAmount }) => `${_id}: ₹${(totalAmount / 100000).toFixed(1)}L`}
                                >
                                    {bookingData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-xl shadow-2xl p-8 border-t-4 border-green-600">
                        <h2 className="text-3xl font-bold mb-6 text-gray-800">📈 Booking Count by Status</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={bookingData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="_id" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '2px solid #10b981', borderRadius: '8px' }} />
                                <Legend />
                                <Bar dataKey="count" fill="#10b981" name="Number of Bookings" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Summary Table */}
                <div className="bg-white rounded-xl shadow-2xl p-8 mt-8 border-t-4 border-orange-600">
                    <h2 className="text-3xl font-bold mb-6 text-gray-800">📋 Booking Summary</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-orange-600 to-orange-500 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left font-bold">Status</th>
                                    <th className="px-6 py-4 text-left font-bold">Count</th>
                                    <th className="px-6 py-4 text-left font-bold">Total Revenue</th>
                                    <th className="px-6 py-4 text-left font-bold">Avg per Booking</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {bookingData.map((item, index) => {
                                    const statusColors = {
                                        'Paid': 'bg-green-50',
                                        'Pending': 'bg-yellow-50',
                                        'Failed': 'bg-red-50',
                                        'Cancelled': 'bg-gray-50'
                                    };
                                    
                                    return (
                                        <tr key={item._id} className={`hover:bg-orange-50 transition ${statusColors[item._id]}`}>
                                            <td className="px-6 py-4 font-bold capitalize text-gray-800">{item._id}</td>
                                            <td className="px-6 py-4 text-gray-700 font-semibold">{item.count}</td>
                                            <td className="px-6 py-4 font-bold text-green-600">₹{item.totalAmount?.toLocaleString('en-IN')}</td>
                                            <td className="px-6 py-4 font-semibold text-purple-600">₹{(item.totalAmount / item.count).toLocaleString('en-IN', {maximumFractionDigits: 0})}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center">
                    <p className="text-gray-600 text-sm">🇮🇳 Last Updated: {new Date().toLocaleDateString('en-IN')}</p>
                </div>
            </div>
        </div>
    );
};

export default AdminReports;
