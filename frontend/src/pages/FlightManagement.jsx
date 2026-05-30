import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, Plane } from 'lucide-react';
import axios from 'axios';

const indianCities = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Goa'];

const FlightManagement = () => {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        airline: '',
        flightNumber: '',
        from: '',
        to: '',
        departureTime: '',
        arrivalTime: '',
        duration: ''
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchFlights();
        const interval = setInterval(fetchFlights, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchFlights = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/flights');
            setFlights(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching flights:', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.patch(`http://localhost:5000/api/admin/flights/${editingId}`, formData);
                alert('✓ Flight updated successfully!');
            } else {
                await axios.post('http://localhost:5000/api/admin/flights', formData);
                alert('✓ Flight created successfully!');
            }
            fetchFlights();
            setShowForm(false);
            setFormData({
                airline: '',
                flightNumber: '',
                from: '',
                to: '',
                departureTime: '',
                arrivalTime: '',
                duration: ''
            });
            setEditingId(null);
        } catch (error) {
            alert('✗ Error: ' + error.response?.data?.message);
        }
    };

    const handleEdit = (flight) => {
        setFormData(flight);
        setEditingId(flight._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this flight?')) {
            try {
                await axios.delete(`http://localhost:5000/api/admin/flights/${id}`);
                alert('✓ Flight deleted successfully!');
                fetchFlights();
            } catch (error) {
                alert('✗ Error: ' + error.response?.data?.message);
            }
        }
    };

    if (loading) {
        return <div className="text-center py-20"><Plane className="w-12 h-12 animate-bounce text-orange-600 mx-auto" /><p className="text-gray-600 mt-4">Loading flights...</p></div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">✈️ Flight Management</h1>
                        <p className="text-gray-600 mt-2">Manage all flights in your system</p>
                    </div>
                    <button
                        onClick={() => {
                            setShowForm(!showForm);
                            setEditingId(null);
                            setFormData({
                                airline: '',
                                flightNumber: '',
                                from: '',
                                to: '',
                                departureTime: '',
                                arrivalTime: '',
                                duration: ''
                            });
                        }}
                        className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transform transition hover:scale-105 font-semibold"
                    >
                        <Plus className="w-5 h-5" /> Add New Flight
                    </button>
                </div>

                {showForm && (
                    <div className="bg-white rounded-xl shadow-2xl p-8 mb-8 border-l-4 border-orange-600">
                        <h2 className="text-3xl font-bold mb-6 text-gray-800">{editingId ? '✏️ Edit Flight' : '➕ Create New Flight'}</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Airline Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Air India, IndiGo"
                                    value={formData.airline}
                                    onChange={(e) => setFormData({...formData, airline: e.target.value})}
                                    className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-orange-600 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Flight Number</label>
                                <input
                                    type="text"
                                    placeholder="e.g., AI101"
                                    value={formData.flightNumber}
                                    onChange={(e) => setFormData({...formData, flightNumber: e.target.value})}
                                    className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-orange-600 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">From (City)</label>
                                <select
                                    value={formData.from}
                                    onChange={(e) => setFormData({...formData, from: e.target.value})}
                                    className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-orange-600 focus:outline-none"
                                    required
                                >
                                    <option value="">Select City</option>
                                    {indianCities.map(city => <option key={city} value={city}>{city}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">To (City)</label>
                                <select
                                    value={formData.to}
                                    onChange={(e) => setFormData({...formData, to: e.target.value})}
                                    className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-orange-600 focus:outline-none"
                                    required
                                >
                                    <option value="">Select City</option>
                                    {indianCities.map(city => <option key={city} value={city}>{city}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Departure Time</label>
                                <input
                                    type="text"
                                    placeholder="08:00 AM"
                                    value={formData.departureTime}
                                    onChange={(e) => setFormData({...formData, departureTime: e.target.value})}
                                    className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-orange-600 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Arrival Time</label>
                                <input
                                    type="text"
                                    placeholder="11:30 AM"
                                    value={formData.arrivalTime}
                                    onChange={(e) => setFormData({...formData, arrivalTime: e.target.value})}
                                    className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-orange-600 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Duration</label>
                                <input
                                    type="text"
                                    placeholder="3h 30m"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                                    className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-orange-600 focus:outline-none"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2 flex gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transform transition hover:scale-105 font-semibold"
                                >
                                    {editingId ? '💾 Update' : '✓ Create'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 bg-gray-400 text-white px-6 py-3 rounded-lg hover:shadow-lg transform transition hover:scale-105 font-semibold"
                                >
                                    ✕ Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Flights Table */}
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-orange-600 to-orange-500 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left font-bold">Airline</th>
                                <th className="px-6 py-4 text-left font-bold">Flight #</th>
                                <th className="px-6 py-4 text-left font-bold">Route</th>
                                <th className="px-6 py-4 text-left font-bold">Departure</th>
                                <th className="px-6 py-4 text-left font-bold">Arrival</th>
                                <th className="px-6 py-4 text-left font-bold">Duration</th>
                                <th className="px-6 py-4 text-center font-bold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {flights.map((flight, index) => (
                                <tr key={flight._id} className={`hover:bg-orange-50 transition ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                    <td className="px-6 py-4 font-semibold text-gray-800">{flight.airline}</td>
                                    <td className="px-6 py-4 font-bold text-blue-600">{flight.flightNumber}</td>
                                    <td className="px-6 py-4 text-gray-700">{flight.from} → {flight.to}</td>
                                    <td className="px-6 py-4 text-gray-700">⏰ {flight.departureTime}</td>
                                    <td className="px-6 py-4 text-gray-700">⏰ {flight.arrivalTime}</td>
                                    <td className="px-6 py-4 text-gray-700">⌛ {flight.duration}</td>
                                    <td className="px-6 py-4 flex justify-center gap-3">
                                        <button
                                            onClick={() => handleEdit(flight)}
                                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(flight._id)}
                                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {flights.length === 0 && (
                        <div className="text-center py-12">
                            <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No flights found. Create one to get started!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FlightManagement;
