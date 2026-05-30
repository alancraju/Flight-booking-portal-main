import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, BarChart3, Plane, Ticket, IndianRupee, Map, TrendingUp, Home } from 'lucide-react';

const AdminNavbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        { path: '/admin', label: 'Dashboard', icon: BarChart3 },
        { path: '/admin/flights', label: 'Flights', icon: Plane },
        { path: '/admin/bookings', label: 'Bookings', icon: Ticket },
        { path: '/admin/inventory', label: 'Inventory', icon: Map },
        { path: '/admin/airports', label: 'Airports', icon: Map },
        { path: '/admin/reports', label: 'Reports', icon: TrendingUp }
    ];

    return (
        <nav className="bg-gradient-to-r from-orange-600 via-white to-green-600 shadow-2xl border-b-4 border-orange-700">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-orange-700 hover:text-green-600 transition">
                        <IndianRupee className="w-8 h-8" />
                        <span>SkyBooking India</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex gap-1">
                        {menuItems.map(item => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-orange-500 hover:text-white text-gray-800 font-semibold transition duration-300 transform hover:scale-105"
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden text-orange-700 hover:text-green-600"
                    >
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden pb-4 border-t-2 border-orange-700 bg-gradient-to-b from-white to-orange-50">
                        {menuItems.map(item => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-orange-500 hover:text-white text-gray-800 font-semibold transition"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default AdminNavbar;
