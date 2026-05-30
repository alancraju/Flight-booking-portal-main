import React, { useCallback, useState, useEffect } from 'react';
import { Edit2, IndianRupee } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

const InventoryManagement = () => {
    const { getToken } = useAuth();
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        economyPrice: 0,
        businessPrice: 0,
        economySeats: 0,
        businessSeats: 0
    });

    const getAuthHeaders = async () => {
        const token = await getToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const fetchInventory = useCallback(async () => {
        try {
            const headers = await getAuthHeaders();
            const response = await axios.get('http://localhost:5000/api/admin/inventory', { headers });
            setInventory(response.data);
            setError('');
            setLoading(false);
        } catch (error) {
            console.error('Error fetching inventory:', error);
            setError(error.response?.data?.message || 'Unable to load inventory');
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        fetchInventory();
        const interval = setInterval(fetchInventory, 5000);
        return () => clearInterval(interval);
    }, [fetchInventory]);

    const handleEdit = (item) => {
        setEditingId(item._id);
        setFormData({
            economyPrice: item.economy.price,
            businessPrice: item.business.price,
            economySeats: item.economy.totalSeats,
            businessSeats: item.business.totalSeats
        });
    };

    const handleUpdate = async () => {
        try {
            const headers = await getAuthHeaders();
            const payload = {
                economyPrice: Number(formData.economyPrice),
                businessPrice: Number(formData.businessPrice),
                economySeats: Number(formData.economySeats),
                businessSeats: Number(formData.businessSeats)
            };
            await axios.patch(`http://localhost:5000/api/admin/inventory/${editingId}`, payload, { headers });
            alert('✓ Inventory updated successfully!');
            fetchInventory();
            setEditingId(null);
        } catch (error) {
            alert('✗ Error: ' + error.response?.data?.message);
        }
    };

    if (loading) {
        return <div className="text-center py-20"><div className="inline-block animate-spin"><IndianRupee className="w-12 h-12 text-orange-600" /></div><p className="text-gray-600 mt-4">Loading inventory...</p></div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent mb-8">💰 Inventory Management</h1>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
                        {error}
                    </div>
                )}

                {editingId && (
                    <div className="bg-white rounded-xl shadow-2xl p-8 mb-8 border-l-4 border-orange-600">
                        <h2 className="text-3xl font-bold mb-6 text-gray-800">✏️ Update Inventory</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">🎫 Economy Price (₹)</label>
                                <input
                                    type="number"
                                    value={formData.economyPrice}
                                    onChange={(e) => setFormData({...formData, economyPrice: parseFloat(e.target.value) || 0})}
                                    className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-orange-600 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">🥇 Business Price (₹)</label>
                                <input
                                    type="number"
                                    value={formData.businessPrice}
                                    onChange={(e) => setFormData({...formData, businessPrice: parseFloat(e.target.value) || 0})}
                                    className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-orange-600 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">🪑 Economy Seats</label>
                                <input
                                    type="number"
                                    value={formData.economySeats}
                                    onChange={(e) => setFormData({...formData, economySeats: parseInt(e.target.value) || 0})}
                                    className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-orange-600 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">👑 Business Seats</label>
                                <input
                                    type="number"
                                    value={formData.businessSeats}
                                    onChange={(e) => setFormData({...formData, businessSeats: parseInt(e.target.value) || 0})}
                                    className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-orange-600 focus:outline-none"
                                />
                            </div>
                            <div className="md:col-span-2 flex gap-4">
                                <button
                                    onClick={handleUpdate}
                                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-lg hover:shadow-lg transform transition hover:scale-105 font-semibold"
                                >
                                    💾 Update
                                </button>
                                <button
                                    onClick={() => setEditingId(null)}
                                    className="flex-1 bg-gray-400 text-white px-4 py-3 rounded-lg hover:shadow-lg transform transition hover:scale-105 font-semibold"
                                >
                                    ✕ Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Inventory Table */}
                <div className="bg-white rounded-xl shadow-2xl overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-orange-600 to-orange-500 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left font-bold">Flight</th>
                                <th className="px-6 py-4 text-left font-bold">Travel Date</th>
                                <th colSpan="4" className="px-6 py-4 text-center font-bold">🎫 Economy Class</th>
                                <th colSpan="4" className="px-6 py-4 text-center font-bold">👑 Business Class</th>
                                <th className="px-6 py-4 text-center font-bold">Actions</th>
                            </tr>
                            <tr className="bg-orange-400 text-white">
                                <th></th>
                                <th></th>
                                <th className="px-3 py-2 text-center text-sm">Total</th>
                                <th className="px-3 py-2 text-center text-sm">Available</th>
                                <th className="px-3 py-2 text-center text-sm">Price</th>
                                <th className="px-3 py-2 text-center text-sm">Occ%</th>
                                <th className="px-3 py-2 text-center text-sm">Total</th>
                                <th className="px-3 py-2 text-center text-sm">Available</th>
                                <th className="px-3 py-2 text-center text-sm">Price</th>
                                <th className="px-3 py-2 text-center text-sm">Occ%</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {inventory.map((item, index) => {
                                const ecoOccupancy = (((item.economy.totalSeats - item.economy.availableSeats) / item.economy.totalSeats) * 100).toFixed(1);
                                const busOccupancy = (((item.business.totalSeats - item.business.availableSeats) / item.business.totalSeats) * 100).toFixed(1);
                                
                                return (
                                    <tr key={item._id} className={`hover:bg-orange-50 transition ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                        <td className="px-6 py-4 font-bold text-blue-600">{item.flight?.flightNumber}</td>
                                        <td className="px-6 py-4 text-gray-700">{new Date(item.travelDate).toLocaleDateString('en-IN')}</td>
                                        
                                        {/* Economy */}
                                        <td className="px-3 py-4 text-center font-semibold">{item.economy.totalSeats}</td>
                                        <td className="px-3 py-4 text-center text-green-600 font-bold">{item.economy.availableSeats}</td>
                                        <td className="px-3 py-4 text-center font-bold text-purple-600">₹{item.economy.price.toLocaleString('en-IN')}</td>
                                        <td className="px-3 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-white text-sm font-bold ${
                                                ecoOccupancy > 80 ? 'bg-red-500' :
                                                ecoOccupancy > 50 ? 'bg-yellow-500' :
                                                'bg-green-500'
                                            }`}>
                                                {ecoOccupancy}%
                                            </span>
                                        </td>
                                        
                                        {/* Business */}
                                        <td className="px-3 py-4 text-center font-semibold">{item.business.totalSeats}</td>
                                        <td className="px-3 py-4 text-center text-green-600 font-bold">{item.business.availableSeats}</td>
                                        <td className="px-3 py-4 text-center font-bold text-purple-600">₹{item.business.price.toLocaleString('en-IN')}</td>
                                        <td className="px-3 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-white text-sm font-bold ${
                                                busOccupancy > 80 ? 'bg-red-500' :
                                                busOccupancy > 50 ? 'bg-yellow-500' :
                                                'bg-green-500'
                                            }`}>
                                                {busOccupancy}%
                                            </span>
                                        </td>
                                        
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition inline-block"
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {!error && inventory.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No inventory found. Run the flight seed script or search flights for a date to generate inventory.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InventoryManagement;
