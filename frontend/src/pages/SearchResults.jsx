import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { motion } from 'framer-motion';
import { Plane, Clock, ArrowRight, Filter, ChevronDown, ChevronUp, Wifi, UtensilsCrossed, Tv } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SORT_OPTIONS = [
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Duration', value: 'duration' },
    { label: 'Departure', value: 'departure' },
];

const AmenityIcon = ({ name }) => {
    if (name === 'WiFi') return <Wifi className="h-3.5 w-3.5" />;
    if (name === 'Meals') return <UtensilsCrossed className="h-3.5 w-3.5" />;
    if (name === 'Entertainment') return <Tv className="h-3.5 w-3.5" />;
    return null;
};

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { selectFlight, selectReturnFlight, selectedFlight } = useBooking();
    const [sort, setSort] = useState('price_asc');
    const [maxPrice, setMaxPrice] = useState(50000);
    const [stopsFilter, setStopsFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    const [allInventory, setAllInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const from = searchParams.get('from') || 'DEL';
    const to = searchParams.get('to') || 'BOM';
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const tripType = searchParams.get('tripType') || 'one-way';
    const returnDate = searchParams.get('returnDate') || '';

    React.useEffect(() => {
        const fetchFlights = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await axios.get(`${API_URL}/inventory/search`, {
                    params: { from, to, date }
                });
                setAllInventory(res.data);
            } catch (err) {
                console.error("Error fetching flights:", err);
                setAllInventory([]);
                setError(err.response?.data?.message || 'Unable to load flights. Please make sure the backend server is running.');
            } finally {
                setLoading(false);
            }
        };
        fetchFlights();
    }, [from, to, date]);

    const filtered = useMemo(() => {
        let f = allInventory.filter(inv => inv.economy.price <= maxPrice || inv.business.price <= maxPrice);
        if (stopsFilter === 'nonstop') f = f.filter(inv => (inv.flight.stops || 0) === 0);
        if (stopsFilter === 'stops') f = f.filter(inv => (inv.flight.stops || 0) > 0);
        if (sort === 'price_asc') f = [...f].sort((a, b) => a.economy.price - b.economy.price);
        if (sort === 'price_desc') f = [...f].sort((a, b) => b.economy.price - a.economy.price);
        if (sort === 'duration') f = [...f].sort((a, b) => a.flight.duration.localeCompare(b.flight.duration));
        // Note: departureTime is a string like "08:00 AM", this might not sort correctly without parsing.
        if (sort === 'departure') f = [...f].sort((a, b) => {
            const timeA = new Date(`1970/01/01 ${a.flight.departureTime}`);
            const timeB = new Date(`1970/01/01 ${b.flight.departureTime}`);
            return timeA - timeB;
        });
        return f;
    }, [allInventory, sort, maxPrice, stopsFilter]);

    const handleSelect = (inventory, classType) => {
        const selectedFlightData = {
            ...inventory.flight,
            _id: inventory.inventoryId,
            flightId: inventory.flight._id,
            travelDate: inventory.travelDate,
            price: inventory[classType].price,
            class: classType,
            availableSeats: inventory[classType].availableSeats,
        };

        if (tripType === 'round-trip') {
            selectFlight(selectedFlightData);
            navigate(`/search?from=${to}&to=${from}&date=${returnDate}&tripType=return`);
        } else if (tripType === 'return') {
            selectReturnFlight(selectedFlightData);
            navigate(`/flight/booking-details`);
        } else {
            selectFlight(selectedFlightData);
            selectReturnFlight(null); // clear any previous
            navigate(`/flight/${inventory.inventoryId}`);
        }
    };

    const fmtDate = (iso) => new Date(iso).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });

    return (
        <div className="min-h-screen bg-[#f0f4ff] pt-20 pb-12">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-8 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center space-x-3 text-2xl font-bold mb-1">
                                <span>{from.toUpperCase()}</span>
                                <Plane className={`h-5 w-5 text-blue-300 ${tripType === 'return' ? 'rotate-180' : ''}`} />
                                <span>{to.toUpperCase()}</span>
                            </div>
                            <p className="text-blue-200 text-sm">
                                {fmtDate(date + 'T00:00:00')} • {tripType === 'return' ? 'Select Return Flight' : tripType === 'round-trip' ? 'Select Outbound Flight' : 'One Way'}
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="bg-white/15 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-semibold border border-white/20">
                                {filtered.length} flights found
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-6xl mt-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Filters Sidebar */}
                    <div className="lg:w-72 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="w-full flex items-center justify-between p-5 font-bold text-gray-800 lg:cursor-default"
                            >
                                <span className="flex items-center space-x-2">
                                    <Filter className="h-4 w-4 text-blue-600" />
                                    <span>Filters</span>
                                </span>
                                <span className="lg:hidden">
                                    {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </span>
                            </button>
                            <div className={`px-5 pb-5 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                                {/* Stops */}
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Stops</p>
                                    <div className="space-y-2">
                                        {[['all', 'Any'], ['nonstop', 'Non-stop'], ['stops', '1+ Stop']].map(([val, label]) => (
                                            <label key={val} className="flex items-center space-x-2 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="stops"
                                                    checked={stopsFilter === val}
                                                    onChange={() => setStopsFilter(val)}
                                                    className="accent-blue-600"
                                                />
                                                <span className="text-sm text-gray-700 group-hover:text-blue-600 font-medium">{label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Price */}
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Max Price</p>
                                    <p className="text-2xl font-bold text-blue-700 mb-3">₹{maxPrice.toLocaleString()}</p>
                                    <input
                                        type="range"
                                        min={3000}
                                        max={50000}
                                        step={500}
                                        value={maxPrice}
                                        onChange={e => setMaxPrice(Number(e.target.value))}
                                        className="w-full accent-blue-600"
                                    />
                                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                                        <span>₹3,000</span>
                                        <span>₹50,000</span>
                                    </div>
                                </div>

                                {/* Sort */}
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Sort By</p>
                                    <div className="space-y-2">
                                        {SORT_OPTIONS.map(opt => (
                                            <label key={opt.value} className="flex items-center space-x-2 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="sort"
                                                    checked={sort === opt.value}
                                                    onChange={() => setSort(opt.value)}
                                                    className="accent-blue-600"
                                                />
                                                <span className="text-sm text-gray-700 group-hover:text-blue-600 font-medium">{opt.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Flight Cards */}
                    <div className="flex-1 space-y-6">
                        {loading ? (
                            <div className="text-center py-24">
                                <Plane className="h-12 w-12 text-blue-300 mx-auto animate-bounce mb-4" />
                                <p className="text-gray-500 font-medium">Searching for flights...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-24 bg-white rounded-2xl border border-red-100">
                                <Plane className="h-16 w-16 text-red-200 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-700 mb-2">Flight search is unavailable</h3>
                                <p className="text-gray-400">{error}</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
                                <Plane className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-700 mb-2">No flights match your filters</h3>
                                <p className="text-gray-400">Try adjusting your price or stop filters</p>
                            </div>
                        ) : (
                            filtered.map((inv, i) => (
                                <motion.div
                                    key={inv.inventoryId}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                    className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden hover:shadow-card-hover transition-all duration-300"
                                >
                                    <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-6">
                                        {/* Airline & Route */}
                                        <div className="flex-1 flex flex-col md:flex-row md:items-center gap-6">
                                            {/* Airline */}
                                            <div className="flex items-center space-x-4 md:w-48">
                                                <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center text-2xl font-bold text-blue-700 flex-shrink-0">
                                                    ✈️
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{inv.flight.airline}</p>
                                                    <p className="text-gray-500 text-xs font-medium">{inv.flight.flightNumber}</p>
                                                </div>
                                            </div>

                                            {/* Route / Time */}
                                            <div className="flex items-center flex-1 gap-4">
                                                <div className="text-center">
                                                    <p className="text-2xl font-extrabold text-gray-900">{inv.flight.departureTime}</p>
                                                    <p className="text-sm font-semibold text-gray-500">{inv.flight.from.toUpperCase()}</p>
                                                </div>

                                                <div className="flex-1 flex flex-col items-center px-4">
                                                    <div className="flex items-center text-gray-400 text-xs mb-1.5 font-bold uppercase tracking-wider">
                                                        <Clock className="h-3.5 w-3.5 mr-1" />
                                                        {inv.flight.duration}
                                                    </div>
                                                    <div className="w-full flex items-center">
                                                        <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                                                        <div className="flex-1 h-px bg-gradient-to-r from-blue-400 to-blue-600 relative">
                                                            <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
                                                        </div>
                                                        <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                                                    </div>
                                                    <p className={`text-xs mt-1.5 font-bold ${inv.flight.stops ? 'text-orange-500' : 'text-green-500'}`}>
                                                        {inv.flight.stops ? `${inv.flight.stops} Stop` : 'Non-stop'}
                                                    </p>
                                                </div>

                                                <div className="text-center">
                                                    <p className="text-2xl font-extrabold text-gray-900">{inv.flight.arrivalTime}</p>
                                                    <p className="text-sm font-semibold text-gray-500">{inv.flight.to.toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Classes Section */}
                                    <div className="bg-gray-50/80 border-t border-gray-100 p-4 md:px-6 flex flex-col md:flex-row gap-4">
                                        
                                        {/* Economy Class */}
                                        <div className={`flex-1 rounded-xl p-4 border-2 transition-all flex items-center justify-between ${inv.economy.availableSeats === 0 ? 'border-gray-200 bg-gray-100 opacity-70' : 'border-blue-100 bg-white hover:border-blue-300 shadow-sm'}`}>
                                            <div>
                                                <p className="font-bold text-gray-800 mb-1">Economy</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xl font-extrabold text-blue-700">₹{inv.economy.price.toLocaleString()}</p>
                                                    {inv.economy.status === 'Filling Fast' || inv.economy.status === 'Almost Full' ? (
                                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{inv.economy.status}</span>
                                                    ) : null}
                                                </div>
                                                <p className={`text-xs font-semibold mt-1 ${inv.economy.availableSeats === 0 ? 'text-red-500' : 'text-green-600'}`}>
                                                    {inv.economy.availableSeats === 0 ? 'Sold Out' : `${inv.economy.availableSeats} seats left`}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleSelect(inv, 'economy')}
                                                disabled={inv.economy.availableSeats === 0}
                                                className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
                                                    inv.economy.availableSeats === 0
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 shadow-md shadow-blue-500/20'
                                                }`}
                                            >
                                                Select
                                            </button>
                                        </div>

                                        {/* Business Class */}
                                        <div className={`flex-1 rounded-xl p-4 border-2 transition-all flex items-center justify-between ${inv.business.availableSeats === 0 ? 'border-gray-200 bg-gray-100 opacity-70' : 'border-purple-100 bg-purple-50 hover:border-purple-300 shadow-sm'}`}>
                                            <div>
                                                <p className="font-bold text-gray-800 mb-1">Business</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xl font-extrabold text-purple-700">₹{inv.business.price.toLocaleString()}</p>
                                                    {inv.business.status === 'Filling Fast' || inv.business.status === 'Almost Full' ? (
                                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{inv.business.status}</span>
                                                    ) : null}
                                                </div>
                                                <p className={`text-xs font-semibold mt-1 ${inv.business.availableSeats === 0 ? 'text-red-500' : 'text-green-600'}`}>
                                                    {inv.business.availableSeats === 0 ? 'Sold Out' : `${inv.business.availableSeats} seats left`}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleSelect(inv, 'business')}
                                                disabled={inv.business.availableSeats === 0}
                                                className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
                                                    inv.business.availableSeats === 0
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-105 shadow-md shadow-purple-500/20'
                                                }`}
                                            >
                                                Select
                                            </button>
                                        </div>

                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchResults;
