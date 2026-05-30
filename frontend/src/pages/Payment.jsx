import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { CreditCard, Lock, ArrowLeft, CheckCircle, Plane } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';

const Payment = () => {
    const navigate = useNavigate();
    const { currentBooking: booking, saveBooking } = useBooking();
    const [verifying, setVerifying] = useState(false);
    const [cardNum, setCardNum] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [name, setName] = useState('');

    if (!booking) {
        return (
            <div className="min-h-screen bg-[#f0f4ff] pt-28 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">No booking found</h2>
                    <button onClick={() => navigate('/search')} className="text-blue-600 font-semibold hover:underline">← Search Flights</button>
                </div>
            </div>
        );
    }



    const formatCardNum = (val) => val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    const formatExpiry = (val) => {
        const d = val.replace(/\D/g, '').slice(0, 4);
        return d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2) : d;
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        if (!cardNum || !expiry || !cvv || !name) return toast.error('Please fill all card details');
        setVerifying(true);
        
        try {
            // Call backend to update inventory
            await axios.post('http://localhost:5000/api/inventory/book', {
                inventoryId: booking.inventory || booking.flight._id, // Handle both old and new formats
                classType: booking.classType || 'economy',
                seatsToBook: booking.passengers.length
            });
            
            setTimeout(() => {
                const confirmed = { ...booking, paymentStatus: 'Paid', paidAt: new Date().toISOString() };
                saveBooking(confirmed);

                // Save to "my bookings" in localStorage
                const existing = JSON.parse(localStorage.getItem('myBookings') || '[]');
                existing.unshift(confirmed);
                localStorage.setItem('myBookings', JSON.stringify(existing));

                toast.success('Payment Successful! 🎉');
                navigate(`/confirmation/${booking._id}`);
            }, 1000);
        } catch (error) {
            setVerifying(false);
            toast.error(error.response?.data?.message || 'Failed to process payment and book seats.');
        }
    };

    return (
        <div className="min-h-screen bg-[#f0f4ff] pt-20 pb-16">
            <div className="container mx-auto px-4 max-w-5xl">
                <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 font-medium mb-6 mt-4 transition-colors">
                    <ArrowLeft className="h-4 w-4" /><span>Back</span>
                </button>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-8 space-x-4">
                    {['Search', 'Select', 'Passengers', 'Payment', 'Confirm'].map((step, i) => (
                        <React.Fragment key={step}>
                            <div className={`flex items-center space-x-2 ${i <= 3 ? 'text-blue-600' : 'text-gray-300'}`}>
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i <= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>{i + 1}</div>
                                <span className="text-xs font-semibold hidden md:block">{step}</span>
                            </div>
                            {i < 4 && <div className={`flex-1 h-px max-w-10 ${i < 3 ? 'bg-blue-400' : 'bg-gray-200'}`} />}
                        </React.Fragment>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Payment Form */}
                    <div className="lg:col-span-3">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-card border border-gray-100 p-8">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <CreditCard className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-extrabold text-gray-900">Secure Payment</h2>
                                    <p className="text-xs text-gray-400 flex items-center"><Lock className="h-3 w-3 mr-1" />256-bit SSL encryption</p>
                                </div>
                            </div>

                            <form onSubmit={handlePayment} className="space-y-5">
                                {/* Credit Card Visual */}
                                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
                                    <div className="flex justify-between items-start mb-8">
                                        <CreditCard className="h-8 w-8 opacity-80" />
                                        <div className="flex space-x-1">
                                            <div className="w-8 h-8 bg-red-400/80 rounded-full" />
                                            <div className="w-8 h-8 bg-yellow-400/80 rounded-full -ml-3" />
                                        </div>
                                    </div>
                                    <p className="text-xl font-mono tracking-widest mb-4">
                                        {cardNum || '•••• •••• •••• ••••'}
                                    </p>
                                    <div className="flex justify-between text-sm">
                                        <div>
                                            <p className="text-blue-200 text-xs">CARD HOLDER</p>
                                            <p className="font-semibold">{name || 'Your Name'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-blue-200 text-xs">EXPIRES</p>
                                            <p className="font-semibold">{expiry || 'MM/YY'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Cardholder Name</label>
                                    <input value={name} onChange={e => setName(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-medium text-gray-800 transition-all"
                                        placeholder="Name on card" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Card Number</label>
                                    <input value={cardNum} onChange={e => setCardNum(formatCardNum(e.target.value))}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-medium text-gray-800 font-mono tracking-wider transition-all"
                                        placeholder="1234 5678 9012 3456" maxLength={19} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Expiry Date</label>
                                        <input value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-medium text-gray-800 transition-all"
                                            placeholder="MM/YY" maxLength={5} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">CVV</label>
                                        <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-medium text-gray-800 transition-all"
                                            placeholder="•••" type="password" maxLength={3} />
                                    </div>
                                </div>

                                <button type="submit" disabled={verifying}
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-extrabold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105 text-base flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2">
                                    {verifying ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Processing Payment...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="h-5 w-5" />
                                            <span>Pay ₹{booking.totalAmount.toLocaleString()} Securely</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-900 rounded-2xl p-6 text-white sticky top-24">
                            <h3 className="font-bold text-lg mb-5 pb-4 border-b border-gray-700">Order Summary</h3>
                            <div className="bg-gray-800 rounded-xl p-4 mb-5">
                                <p className="text-sm text-gray-400 mb-1">{booking.flightDetails?.airline} · {booking.flightDetails?.flightNumber}</p>
                                <div className="flex justify-between items-center">
                                    <div className="text-center">
                                        <p className="text-lg font-extrabold">{booking.flightDetails?.departureTime}</p>
                                        <p className="text-xs text-gray-400">{booking.flightDetails?.from?.toUpperCase()}</p>
                                    </div>
                                    <Plane className="h-4 w-4 text-blue-400" />
                                    <div className="text-center">
                                        <p className="text-lg font-extrabold">{booking.flightDetails?.arrivalTime}</p>
                                        <p className="text-xs text-gray-400">{booking.flightDetails?.to?.toUpperCase()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm mb-5">
                                {booking.passengers.map((p, i) => (
                                    <div key={i} className="flex justify-between text-gray-400">
                                        <span>{p.name || `Passenger ${i+1}`}</span>
                                        <span className="text-white font-semibold">₹{booking.flightDetails?.price?.toLocaleString() || booking.totalAmount / booking.passengers.length}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between text-gray-400">
                                    <span>Taxes & Fees</span>
                                    <span className="text-green-400 font-semibold">Included</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-700 pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Total</span>
                                    <span className="text-3xl font-extrabold">₹{booking.totalAmount.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="mt-5 pt-5 border-t border-gray-700 space-y-2">
                                {['Free cancellation within 24hrs', 'Instant e-ticket on email', '24/7 customer support'].map(t => (
                                    <div key={t} className="flex items-center space-x-2 text-xs text-gray-400">
                                        <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /><span>{t}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
