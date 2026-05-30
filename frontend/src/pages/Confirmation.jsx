import React, { useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useBooking } from '../context/BookingContext';
import { CheckCircle, Download, Plane, Calendar, Users, Hash, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Confetti from '../components/Confetti';

const Confirmation = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentBooking: contextBooking } = useBooking();
    const ticketRef = useRef(null);

    const booking = useMemo(() => {
        if (contextBooking && contextBooking._id === id) return contextBooking;
        const allBookings = JSON.parse(localStorage.getItem('myBookings') || '[]');
        return allBookings.find(b => b._id === id);
    }, [id, contextBooking]);

    const handleDownloadPdf = async () => {
        if (!ticketRef.current) return;
        const canvas = await html2canvas(ticketRef.current, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Ticket_${booking._id}.pdf`);
    };

    if (!booking) {
        return (
            <div className="min-h-screen bg-[#f0f4ff] pt-28 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">Booking not found</h2>
                    <button onClick={() => navigate('/')} className="text-blue-600 font-semibold hover:underline">← Go Home</button>
                </div>
            </div>
        );
    }

    const fmtDate = (iso) => {
        if (!iso) return '';
        return new Date(iso).toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-[#f0f4ff] pt-20 pb-16 flex items-center justify-center px-4">
            <Confetti />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full"
            >
                {/* Success Card */}
                <div ref={ticketRef} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-10 text-white text-center">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
                            <CheckCircle className="h-20 w-20 mx-auto mb-4" />
                        </motion.div>
                        <h1 className="text-4xl font-extrabold mb-2">Booking Confirmed!</h1>
                        <p className="text-green-100 text-lg">Your e-ticket has been sent to {booking.userEmail || 'your email'}</p>
                    </div>

                    <div className="p-8">
                        {/* Booking Ref */}
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6">
                            <div className="flex items-center space-x-2 mb-3">
                                <Hash className="h-4 w-4 text-gray-400" />
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Booking Reference</p>
                            </div>
                            <p className="text-4xl font-extrabold text-blue-700 font-mono tracking-widest text-center py-3 bg-white rounded-xl border border-gray-100">
                                {booking._id}
                            </p>
                        </div>

                        {/* Flight Summary */}
                        <div className="border border-gray-100 rounded-2xl overflow-hidden mb-6">
                            <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-4 text-white flex justify-between items-center">
                                <div>
                                    <p className="font-bold">{booking.flightDetails?.airline || booking.flight?.airline}</p>
                                    <p className="text-blue-200 text-xs">{booking.flightDetails?.flightNumber || booking.flight?.flightNumber} · {booking.flightDetails?.class || booking.flight?.class || booking.classType}</p>
                                </div>
                                <Plane className="h-6 w-6 text-blue-300" />
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <p className="text-3xl font-extrabold text-gray-900">{booking.flightDetails?.departureTime || booking.flight?.departureTime}</p>
                                        <p className="text-blue-700 font-bold">{booking.flightDetails?.from?.toUpperCase() || booking.flight?.from?.toUpperCase()}</p>
                                    </div>
                                    <div className="text-center text-gray-400 text-sm">
                                        <p>{booking.flightDetails?.duration || booking.flight?.duration}</p>
                                        <Plane className="h-4 w-4 mx-auto my-1 text-blue-500" />
                                        <p>{(booking.flightDetails?.stops || booking.flight?.stops) === 0 ? 'Non-stop' : '1 Stop'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-extrabold text-gray-900">{booking.flightDetails?.arrivalTime || booking.flight?.arrivalTime}</p>
                                        <p className="text-blue-700 font-bold">{booking.flightDetails?.to?.toUpperCase() || booking.flight?.to?.toUpperCase()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-gray-500 text-sm">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    {fmtDate(booking.flightDetails?.travelDate || booking.flight?.travelDate || booking.flight?.departureTime)}
                                </div>
                            </div>
                        </div>

                        {/* Passengers */}
                        <div className="mb-6">
                            <div className="flex items-center space-x-2 mb-3">
                                <Users className="h-4 w-4 text-gray-400" />
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Passengers</p>
                            </div>
                            <div className="space-y-2">
                                {booking.passengers.map((p, i) => (
                                    <div key={i} className="flex justify-between py-2 px-4 bg-gray-50 rounded-xl border border-gray-100 text-sm">
                                        <span className="font-semibold text-gray-800">{p.name}</span>
                                        <span className="text-gray-500">{p.gender} · Age {p.age}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="flex justify-between items-center bg-green-50 border border-green-100 rounded-xl px-5 py-4 mb-8">
                            <span className="text-gray-700 font-semibold">Amount Paid</span>
                            <div className="flex items-center space-x-2">
                                <span className="text-2xl font-extrabold text-green-700">₹{booking.totalAmount.toLocaleString()}</span>
                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">PAID</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div data-html2canvas-ignore className="flex flex-col sm:flex-row gap-3">
                            <button onClick={handleDownloadPdf}
                                className="flex-1 flex items-center justify-center space-x-2 py-3.5 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all">
                                <Download className="h-5 w-5" /><span>Download Ticket</span>
                            </button>
                            <button onClick={() => navigate('/my-bookings')}
                                className="flex-1 flex items-center justify-center space-x-2 py-3.5 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-105">
                                <span>View My Bookings</span><ArrowRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Confirmation;
