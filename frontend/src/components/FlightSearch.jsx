import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, ArrowLeftRight } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AutocompleteInput = ({ label, placeholder, value, onChange, onSelect }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (value.length > 0 && showDropdown) {
                try {
                    const res = await axios.get(`${API_URL}/airports/search?q=${value}`);
                    setSuggestions(res.data);
                } catch (error) {
                    console.error('Error fetching airports:', error);
                }
            } else {
                setSuggestions([]);
            }
        };

        const debounce = setTimeout(() => {
            fetchSuggestions();
        }, 300);

        return () => clearTimeout(debounce);
    }, [value, showDropdown]);

    return (
        <div className="flex-1 relative group" ref={wrapperRef}>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 pl-1">{label}</label>
            <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500 pointer-events-none" />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 font-medium text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white"
                    required
                />
                
                {/* Dropdown */}
                {showDropdown && suggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto">
                        {suggestions.map((airport) => (
                            <div
                                key={airport.iata_code}
                                onClick={() => {
                                    onSelect(airport.iata_code);
                                    setShowDropdown(false);
                                }}
                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex flex-col border-b border-gray-50 last:border-0"
                            >
                                <span className="font-bold text-gray-800 text-sm">
                                    {airport.city} ({airport.iata_code})
                                </span>
                                <span className="text-xs text-gray-500">
                                    {airport.name}, {airport.country}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const FlightSearch = () => {
    const [tripType, setTripType] = useState('one-way');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [date, setDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const navigate = useNavigate();

    const resolveAirportInput = async (value) => {
        const normalized = value.trim();
        if (!normalized) return '';

        try {
            const res = await axios.get(`${API_URL}/airports/search?q=${encodeURIComponent(normalized)}`);
            const exactMatch = res.data.find((airport) => (
                airport.city.toLowerCase() === normalized.toLowerCase()
                || airport.iata_code.toLowerCase() === normalized.toLowerCase()
            ));

            return (exactMatch || res.data[0])?.iata_code || normalized.toUpperCase();
        } catch (error) {
            console.error('Error resolving airport:', error);
            return normalized.toUpperCase();
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        const [fromCode, toCode] = await Promise.all([
            resolveAirportInput(from),
            resolveAirportInput(to)
        ]);

        const searchParams = new URLSearchParams();
        if (fromCode) searchParams.append('from', fromCode);
        if (toCode) searchParams.append('to', toCode);
        if (date) searchParams.append('date', date);
        if (tripType === 'round-trip' && returnDate) searchParams.append('returnDate', returnDate);
        searchParams.append('tripType', tripType);
        navigate(`/search?${searchParams.toString()}`);
    };

    const handleSwap = () => {
        setFrom(to);
        setTo(from);
    };

    return (
        <div className="search-card w-full max-w-4xl mx-auto p-6 md:p-8">
            <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
                <button 
                    type="button"
                    onClick={() => setTripType('one-way')}
                    className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${tripType === 'one-way' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >One Way</button>
                <button 
                    type="button"
                    onClick={() => setTripType('round-trip')}
                    className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${tripType === 'round-trip' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >Round Trip</button>
            </div>

            <form onSubmit={handleSearch}>
                <div className="flex flex-col md:flex-row gap-3 items-stretch">
                    <AutocompleteInput 
                        label="From" 
                        placeholder="Departure city or airport" 
                        value={from} 
                        onChange={setFrom}
                        onSelect={setFrom}
                    />

                    <div className="flex items-end pb-0.5 justify-center z-10">
                        <button
                            type="button"
                            onClick={handleSwap}
                            className="hidden md:flex w-10 h-10 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-full items-center justify-center text-blue-600 transition-all hover:scale-110 mt-6"
                        >
                            <ArrowLeftRight className="h-4 w-4" />
                        </button>
                    </div>

                    <AutocompleteInput 
                        label="To" 
                        placeholder="Arrival city or airport" 
                        value={to} 
                        onChange={setTo}
                        onSelect={setTo}
                    />

                    <div className="flex-1 relative">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 pl-1">Departure</label>
                        <div className="relative">
                            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500 pointer-events-none" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl text-gray-800 font-medium text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white"
                                required
                            />
                        </div>
                    </div>

                    {tripType === 'round-trip' && (
                        <div className="flex-1 relative">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 pl-1">Return</label>
                            <div className="relative">
                                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500 pointer-events-none" />
                                <input
                                    type="date"
                                    value={returnDate}
                                    min={date}
                                    onChange={(e) => setReturnDate(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl text-gray-800 font-medium text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white"
                                    required={tripType === 'round-trip'}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex items-end">
                        <button
                            type="submit"
                            className="w-full md:w-auto flex items-center justify-center space-x-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-200 hover:scale-105 hover:shadow-blue-500/40 text-sm mt-6"
                        >
                            <Search className="h-4 w-4" />
                            <span>Search</span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default FlightSearch;
