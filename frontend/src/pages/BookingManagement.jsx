import React, { useState, useEffect } from 'react';
import { Trash2, Eye, IndianRupee, RefreshCw } from 'lucide-react';
import axios from 'axios';

const BookingManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchBookings();
        // Auto-refresh every 5 seconds
        const interval = setInterval(fetchBookings, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/bookings');
            setBookings(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchBookings();
        setRefreshing(false);
    };

    const handleStatusChange = async (bookingId, newStatus) => {
        try {
            await axios.patch(`http://localhost:5000/api/admin/bookings/${bookingId}/status`, { paymentStatus: newStatus });
            alert('✓ Status updated successfully!');
            fetchBookings();
        } catch (error) {
            alert('✗ Error: ' + error.response?.data?.message);
        }
    };

    const handleCancel = async (bookingId) => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            try {
                await axios.delete(`http://localhost:5000/api/admin/bookings/${bookingId}/cancel`);
                alert('✓ Booking cancelled successfully!');
                fetchBookings();
            } catch (error) {
                alert('✗ Error: ' + error.response?.data?.message);
            }
        }
    };

    const handleViewDetails = (booking) => {
        setSelectedBooking(booking);
        setShowDetails(true);
    };

    if (loading) {
        return <div className="text-center py-20"><div className="inline-block animate-spin"><Trash2 className="w-12 h-12 text-orange-600" /></div><p className="text-gray-600 mt-4">Loading bookings...</p></div>;
    }

    const statusColors = {
        'Paid': 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300',
        'Pending': 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300',
        'Failed': 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300',
        'Cancelled': 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300'
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">📋 Booking Management</h1>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transform transition hover:scale-105 font-semibold disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>

                {/* Details Modal */}
                {showDetails && selectedBooking && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
                            <h2 className="text-3xl font-bold mb-6 text-orange-600">Booking Details</h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 bg-gradient-to-r from-orange-50 to-green-50 p-6 rounded-lg">
                                    <div>
                                        <p className="text-gray-600 text-sm font-semibold">Booking ID</p>
                                        <p className="font-mono font-bold text-blue-600">{selectedBooking._id}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 text-sm font-semibold">User ID</p>
                                        <p className="font-mono text-purple-600">{selectedBooking.user}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 text-sm font-semibold">Flight</p>
                                        <p className="font-semibold text-blue-600">{selectedBooking.flight?.flightNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 text-sm font-semibold">Class</p>
                                        <p className="font-semibold capitalize text-green-600">{selectedBooking.classType}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <p className="text-gray-600 font-semibold mb-3">✈️ Passengers</p>
                                    {selectedBooking.passengers?.map((p, i) => (
                                        <div key={i} className="bg-white p-3 rounded mb-2 border-l-4 border-orange-500">
                                            👤 {p.name} • Age: {p.age} • {p.gender}
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <p className="text-gray-600 font-semibold mb-3">🪑 Seats</p>
                                    <p className="text-lg font-mono font-bold text-blue-600">{selectedBooking.seats?.join(', ')}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 bg-orange-50 p-6 rounded-lg">
                                    <div>
                                        <p className="text-gray-600 font-semibold">Total Amount</p>
                                        <p className="text-2xl font-bold text-green-600">₹{selectedBooking.totalAmount?.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 font-semibold">Payment Status</p>
                                        <p className={`font-semibold text-lg ${statusColors[selectedBooking.paymentStatus]?.split(' ')[3] || 'text-gray-600'}`}>
                                            {selectedBooking.paymentStatus}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white px-4 py-3 rounded-lg hover:shadow-lg font-semibold"
                                >
                                    ✕ Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bookings Table */}
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-orange-600 to-orange-500 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left font-bold">Booking ID</th>
                                <th className="px-6 py-4 text-left font-bold">User</th>
                                <th className="px-6 py-4 text-left font-bold">Flight</th>
                                <th className="px-6 py-4 text-center font-bold">Passengers</th>
                                <th className="px-6 py-4 text-right font-bold">Amount</th>
                                <th className="px-6 py-4 text-center font-bold">Status</th>
                                <th className="px-6 py-4 text-center font-bold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {bookings.map((booking, index) => (
                                <tr key={booking._id} className={`hover:bg-orange-50 transition ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                    <td className="px-6 py-4 font-mono text-sm text-blue-600">{booking._id.substring(0, 8)}...</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{booking.user.substring(0, 10)}...</td>
                                    <td className="px-6 py-4 font-semibold text-blue-600">{booking.flight?.flightNumber}</td>
                                    <td className="px-6 py-4 text-center text-gray-700 font-semibold">{booking.passengers?.length}</td>
                                    <td className="px-6 py-4 text-right font-bold text-green-600">₹{booking.totalAmount?.toLocaleString('en-IN')}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={booking.paymentStatus}
                                            onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                                            className={`px-3 py-2 rounded-lg text-sm font-semibold border-2 ${statusColors[booking.paymentStatus]}`}
                                        >
                                            <option>Pending</option>
                                            <option>Paid</option>
                                            <option>Failed</option>
                                            <option>Cancelled</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 flex justify-center gap-3">
                                        <button
                                            onClick={() => handleViewDetails(booking)}
                                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleCancel(booking._id)}
                                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {bookings.length === 0 && (
                        <div className="text-center py-16">
                            <IndianRupee className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No bookings found yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingManagement;
