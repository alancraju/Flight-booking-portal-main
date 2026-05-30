import React, { useState, useEffect } from 'react';
import { Trash2, Plus, MapPin } from 'lucide-react';
import axios from 'axios';

const indianCities = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Goa', 'Indore', 'Bhopal', 'Patna'];

const AirportManagement = () => {
    const [airports, setAirports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        iata_code: '',
        name: '',
        city: '',
        country: 'India'
    });

    useEffect(() => {
        fetchAirports();
        const interval = setInterval(fetchAirports, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchAirports = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/airports');
            setAirports(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching airports:', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/admin/airports', formData);
            alert('✓ Airport created successfully!');
            fetchAirports();
            setShowForm(false);
            setFormData({
                iata_code: '',
                name: '',
                city: '',
                country: 'India'
            });
        } catch (error) {
            alert('✗ Error: ' + error.response?.data?.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this airport?')) {
            try {
                await axios.delete(`http://localhost:5000/api/admin/airports/${id}`);
                alert('✓ Airport deleted successfully!');
                fetchAirports();
            } catch (error) {
                alert('✗ Error: ' + error.response?.data?.message);
            }
        }
    };

    if (loading) {
        return <div className="text-center py-20"><div className="inline-block animate-spin"><MapPin className="w-12 h-12 text-orange-600" /></div><p className="text-gray-600 mt-4">Loading airports...</p></div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">✈️ Airport Management</h1>
                        <p className="text-gray-600 mt-2">Manage airports across India</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transform transition hover:scale-105 font-semibold"
                    >
                        <Plus className="w-5 h-5" /> Add Airport
                    </button>
                </div>

                {showForm && (
                    <div className="bg-white rounded-xl shadow-2xl p-8 mb-8 border-l-4 border-orange-600">
                        <h2 className="text-3xl font-bold mb-6 text-gray-800">➕ Add New Airport</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">IATA Code (e.g., DEL)</label>
                                <input
                                    type="text"
                                    placeholder="e.g., DEL, BOM, BLR"
                                    value={formData.iata_code}
                                    onChange={(e) => setFormData({...formData, iata_code: e.target.value.toUpperCase()})}
                                    className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-orange-600 focus:outline-none uppercase"
                                    maxLength="3"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Airport Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Indira Gandhi International"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-orange-600 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">City</label>
                                <select
                                    value={formData.city}
                                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                                    className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-orange-600 focus:outline-none"
                                    required
                                >
                                    <option value="">Select City</option>
                                    {indianCities.map(city => <option key={city} value={city}>{city}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Country</label>
                                <input
                                    type="text"
                                    value={formData.country}
                                    className="w-full border-2 border-gray-300 p-3 rounded-lg bg-gray-100 font-semibold"
                                    disabled
                                />
                            </div>
                            <div className="md:col-span-2 flex gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transform transition hover:scale-105 font-semibold"
                                >
                                    ✓ Create
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

                {/* Airports Table */}
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-orange-600 to-orange-500 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left font-bold">IATA Code</th>
                                <th className="px-6 py-4 text-left font-bold">Airport Name</th>
                                <th className="px-6 py-4 text-left font-bold">City</th>
                                <th className="px-6 py-4 text-left font-bold">Country</th>
                                <th className="px-6 py-4 text-center font-bold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {airports.map((airport, index) => (
                                <tr key={airport._id} className={`hover:bg-orange-50 transition ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                    <td className="px-6 py-4 font-bold text-2xl text-blue-600">{airport.iata_code}</td>
                                    <td className="px-6 py-4 text-gray-800 font-semibold">{airport.name}</td>
                                    <td className="px-6 py-4 text-gray-700">🏙️ {airport.city}</td>
                                    <td className="px-6 py-4 text-gray-700">🇮🇳 {airport.country}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleDelete(airport._id)}
                                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition inline-block"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {airports.length === 0 && (
                        <div className="text-center py-16">
                            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No airports found. Create one to get started!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AirportManagement;
