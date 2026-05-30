import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { Plane, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    
    const isTransparentPage = location.pathname === '/' || location.pathname.startsWith('/destination');
    const isScrolled = scrolled || !isTransparentPage;

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
            isScrolled ? 'nav-scrolled py-3 bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent py-5'
        }`}>
            <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3 group">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-2.5 rounded-xl shadow-lg group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-105">
                            <Plane className="text-white h-5 w-5" />
                        </div>
                        <span className={`text-xl font-bold transition-colors duration-300 ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
                            Flight<span className="text-blue-400">Booker</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex space-x-1 items-center">
                        <Link to="/" className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${isScrolled ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' : 'text-white/85 hover:text-white hover:bg-white/15'}`}>
                            Home
                        </Link>
                        <Link to="/search" className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${isScrolled ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' : 'text-white/85 hover:text-white hover:bg-white/15'}`}>
                            Search Flights
                        </Link>

                        <SignedIn>
                            <Link to="/my-bookings" className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${isScrolled ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' : 'text-white/85 hover:text-white hover:bg-white/15'}`}>
                                My Bookings
                            </Link>
                        </SignedIn>

                        <div className="ml-4 flex items-center space-x-3">
                            <SignedOut>
                                <Link to="/login">
                                    <button className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                        isScrolled ? 'text-blue-600 hover:bg-blue-50 border border-blue-200' : 'text-white border border-white/30 hover:bg-white/15'
                                    }`}>
                                        Login
                                    </button>
                                </Link>
                                <Link to="/register">
                                    <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105">
                                        Register
                                    </button>
                                </Link>
                            </SignedOut>

                            <SignedIn>
                                <div className="flex items-center ml-2">
                                    <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "w-9 h-9 border-2 border-white/50" } }} />
                                </div>
                            </SignedIn>
                        </div>
                    </nav>

                    {/* Mobile Toggle */}
                    <button
                        className={`md:hidden p-2 rounded-lg transition-colors ${isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/15'}`}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-gray-100 mt-2 absolute w-full shadow-lg"
                    >
                        <div className="flex flex-col p-4 space-y-1">
                            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 hover:bg-blue-50 rounded-xl transition-colors font-medium text-gray-700">Home</Link>
                            <Link to="/search" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 hover:bg-blue-50 rounded-xl transition-colors font-medium text-gray-700">Search Flights</Link>
                            
                            <SignedIn>
                                <Link to="/my-bookings" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 hover:bg-blue-50 rounded-xl transition-colors font-medium text-gray-700">My Bookings</Link>
                            </SignedIn>
                            
                            <div className="pt-2 border-t border-gray-100 grid gap-2">
                                <SignedOut>
                                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                        <button className="w-full px-4 py-3 font-semibold text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors">Login</button>
                                    </Link>
                                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                                        <button className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors mt-2">Register</button>
                                    </Link>
                                </SignedOut>

                                <SignedIn>
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="font-semibold text-gray-700">Account</span>
                                        <UserButton afterSignOutUrl="/" />
                                    </div>
                                </SignedIn>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;
