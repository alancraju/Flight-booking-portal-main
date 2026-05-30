import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Ticket, Plane, Calendar, ExternalLink, ArrowRight, Search, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const MyBookings = () => {
    const { user } = useUser();
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState(() => {
        const all = JSON.parse(localStorage.getItem('myBookings') || '[]');
        return all;
    });
    const [cancellingId, setCancellingId] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const fmtDate = (iso) => {
        if (!iso) return '';
        return new Date(iso).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    };

    const handleCancelBooking = async (bookingId) => {
        setLoading(true);
        setError(null);

        try {
            const token = await getToken();

            // First, try to cancel using the booking ID
            let response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/bookings/${bookingId}/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // If 400 error (likely invalid ObjectId), it means the booking doesn't exist in MongoDB
            // This is a frontend-only booking, so just update local state
            if (response.status === 400 || response.status === 404) {
                console.warn('Booking not found in MongoDB - removing from local storage only');

                // Update local state
                setBookings(bookings.map(b =>
                    b._id === bookingId
                        ? { ...b, paymentStatus: 'Cancelled' }
                        : b
                ));

                // Update localStorage
                const updated = bookings.map(b =>
                    b._id === bookingId
                        ? { ...b, paymentStatus: 'Cancelled' }
                        : b
                );
                localStorage.setItem('myBookings', JSON.stringify(updated));

                setSuccess('Booking cancelled locally. (Note: Booking was not yet confirmed in our system)');
                setShowConfirmDialog(null);
                setTimeout(() => setSuccess(null), 3000);
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to cancel booking');
            }

            const data = await response.json();

            // Update local state
            setBookings(bookings.map(b =>
                b._id === bookingId
                    ? { ...b, paymentStatus: 'Cancelled' }
                    : b
            ));

            // Update localStorage
            const updated = bookings.map(b =>
                b._id === bookingId
                    ? { ...b, paymentStatus: 'Cancelled' }
                    : b
            );
            localStorage.setItem('myBookings', JSON.stringify(updated));

            setSuccess(`Booking cancelled successfully! ${data.refundRequired ? 'Refund will be processed.' : ''}`);
            setShowConfirmDialog(null);

            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error cancelling booking:', err);
            // Even if API fails, allow local cancellation for frontend-only bookings
            if (err.message.includes('Cast to ObjectId')) {
                setBookings(bookings.map(b =>
                    b._id === showConfirmDialog
                        ? { ...b, paymentStatus: 'Cancelled' }
                        : b
                ));
                const updated = bookings.map(b =>
                    b._id === showConfirmDialog
                        ? { ...b, paymentStatus: 'Cancelled' }
                        : b
                );
                localStorage.setItem('myBookings', JSON.stringify(updated));
                setSuccess('Booking cancelled.');
                setShowConfirmDialog(null);
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
            setCancellingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#f0f4ff] pt-20 pb-16">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Header */}
                <div className="flex items-center justify-between mt-6 mb-8">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900">My Bookings</h2>
                        <p className="text-gray-500 mt-1">Welcome back, {user?.firstName || 'Traveler'} ✈️</p>
                    </div>
                    <button
                        onClick={() => navigate('/search')}
                        className="flex items-center space-x-2 bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all hover:scale-105 text-sm"
                    >
                        <Search className="h-4 w-4" /><span>Book Another</span>
                    </button>
                </div>

                {/* Success Message */}
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg flex items-center space-x-2 border border-green-200"
                    >
                        <CheckCircle className="h-5 w-5" />
                        <span>{success}</span>
                    </motion.div>
                )}

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center space-x-2 border border-red-200"
                    >
                        <AlertCircle className="h-5 w-5" />
                        <span>{error}</span>
                    </motion.div>
                )}

                {bookings.length > 0 ? (
                    <div className="space-y-5">
                        {bookings.map((booking, idx) => (
                            <motion.div
                                key={booking._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.07 }}
                                className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden hover:shadow-card-hover hover:border-blue-100 transition-all duration-300"
                            >
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center gap-5">
                                        {/* Airline Logo */}
                                        <div className="flex items-center space-x-3 md:w-56">
                                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                                                {booking.flight.logo}
                                            </div>
                                            <div>
                                                <p className="font-extrabold text-gray-900">{booking.flightDetails?.airline || booking.flight?.airline}</p>
                                                <p className="text-xs text-gray-400">{booking.flightDetails?.flightNumber || booking.flight?.flightNumber} · {booking.flightDetails?.class || booking.flight?.class || booking.classType}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">Ref: <span className="font-mono font-bold text-blue-600">{booking._id}</span></p>
                                            </div>
                                        </div>

                                        {/* Route */}
                                        <div className="flex items-center flex-1 gap-3">
                                            <div className="text-center">
                                                <p className="text-xl font-extrabold text-gray-900">{booking.flightDetails?.departureTime || booking.flight?.departureTime}</p>
                                                <p className="text-sm font-bold text-blue-700">{booking.flightDetails?.from?.toUpperCase() || booking.flight?.from?.toUpperCase()}</p>
                                            </div>
                                            <div className="flex-1 flex flex-col items-center px-2">
                                                <p className="text-xs text-gray-400 mb-1">{booking.flightDetails?.duration || booking.flight?.duration}</p>
                                                <div className="w-full flex items-center">
                                                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                                                    <div className="flex-1 h-px bg-blue-300" />
                                                    <Plane className="h-3.5 w-3.5 text-blue-600 mx-1" />
                                                    <div className="flex-1 h-px bg-blue-300" />
                                                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                                                </div>
                                                <p className={`text-xs mt-1 font-semibold ${(booking.flightDetails?.stops || booking.flight?.stops) === 0 ? 'text-green-600' : 'text-orange-500'}`}>
                                                    {(booking.flightDetails?.stops || booking.flight?.stops) === 0 ? 'Non-stop' : '1 Stop'}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xl font-extrabold text-gray-900">{booking.flightDetails?.arrivalTime || booking.flight?.arrivalTime}</p>
                                                <p className="text-sm font-bold text-blue-700">{booking.flightDetails?.to?.toUpperCase() || booking.flight?.to?.toUpperCase()}</p>
                                            </div>
                                        </div>

                                        {/* Passengers & Amount */}
                                        <div className="flex items-center gap-4 md:border-l md:border-gray-100 md:pl-5">
                                            <div className="text-center">
                                                <p className="text-xs text-gray-400 font-medium">{booking.passengers.length} Pax</p>
                                                <p className="text-xl font-extrabold text-gray-900">₹{booking.totalAmount.toLocaleString()}</p>
                                                <div className="flex items-center text-gray-400 text-xs mt-1">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    {fmtDate(booking.flightDetails?.travelDate || booking.flight?.travelDate || booking.flight?.departureTime)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status + Actions */}
                                        <div className="flex flex-col items-end gap-3 min-w-[140px]">
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                booking.paymentStatus === 'Paid'
                                                    ? 'bg-green-100 text-green-700'
                                                    : booking.paymentStatus === 'Cancelled'
                                                    ? 'bg-gray-100 text-gray-600'
                                                    : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {booking.paymentStatus}
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => navigate(`/confirmation/${booking._id}`)}
                                                    className="flex items-center space-x-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                                                >
                                                    <span>View</span><ExternalLink className="h-3.5 w-3.5" />
                                                </button>
                                                {booking.paymentStatus !== 'Cancelled' && (
                                                    <button
                                                        onClick={() => setShowConfirmDialog(booking._id)}
                                                        disabled={loading && cancellingId === booking._id}
                                                        className="flex items-center space-x-1.5 text-sm font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        <span>{loading && cancellingId === booking._id ? 'Cancelling...' : 'Cancel'}</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-28 bg-white rounded-3xl border border-gray-100 shadow-card">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Ticket className="h-10 w-10 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-700 mb-3">No bookings yet</h3>
                        <p className="text-gray-400 max-w-sm mx-auto mb-8">Looks like you haven't booked any flights yet. Start planning your next adventure!</p>
                        <button
                            onClick={() => navigate('/search')}
                            className="inline-flex items-center space-x-2 bg-blue-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all hover:scale-105"
                        >
                            <Search className="h-5 w-5" /><span>Search Flights</span><ArrowRight className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                    onClick={() => !loading && setShowConfirmDialog(null)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Cancel Booking?</h3>
                        <p className="text-gray-600 text-center mb-6">
                            Are you sure you want to cancel this booking? All seats will be restored and a refund will be processed if the booking was paid.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmDialog(null)}
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                Keep Booking
                            </button>
                            <button
                                onClick={() => handleCancelBooking(showConfirmDialog)}
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Cancelling...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4" />
                                        <span>Cancel Booking</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default MyBookings;
