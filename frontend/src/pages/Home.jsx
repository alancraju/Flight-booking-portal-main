import React from 'react';
import { useNavigate } from 'react-router-dom';
import FlightSearch from '../components/FlightSearch';
import { Plane, Globe, Shield, CreditCard, Star, ArrowRight, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { destinationsData } from '../data/destinations';

const stats = [
    { value: '500+', label: 'Airlines' },
    { value: '190+', label: 'Countries' },
    { value: '2M+', label: 'Happy Travelers' },
    { value: '24/7', label: 'Support' },
];

const features = [
    {
        icon: Globe,
        title: 'Global Reach',
        desc: 'Access to over 500 airlines and thousands of destinations worldwide at your fingertips.',
        color: 'from-blue-500 to-cyan-400',
        bg: 'bg-blue-50',
        iconColor: 'text-blue-600',
    },
    {
        icon: Shield,
        title: 'Secure Booking',
        desc: 'Bank-level encryption ensures your data and payments are 100% secure with us.',
        color: 'from-emerald-500 to-teal-400',
        bg: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
    },
    {
        icon: CreditCard,
        title: 'Flexible Payments',
        desc: 'Pay with your preferred method smoothly and transparently with zero hidden fees.',
        color: 'from-violet-500 to-purple-400',
        bg: 'bg-violet-50',
        iconColor: 'text-violet-600',
    },
];

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="font-sans">
            {/* ─── HERO ─── */}
            <section className="hero-section min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="container mx-auto px-4 z-10 text-center flex flex-col items-center pt-28 pb-16">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center space-x-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 mb-6"
                    >
                        <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-white/90 text-sm font-medium">20,000+ flights searched today</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.65, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight"
                    >
                        Discover Your
                        <br />
                        <span className="relative">
                            Next{' '}
                            <span className="relative inline-block">
                                <span className="relative z-10 bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                                    Adventure
                                </span>
                                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                                    <path d="M2 9C50 3 100 1 150 6C200 11 250 9 298 5" stroke="url(#u)" strokeWidth="3" strokeLinecap="round" />
                                    <defs>
                                        <linearGradient id="u" x1="0" y1="0" x2="300" y2="0">
                                            <stop stopColor="#67e8f9" />
                                            <stop offset="1" stopColor="#93c5fd" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </span>
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-xl text-blue-100/80 mb-10 max-w-2xl mx-auto leading-relaxed"
                    >
                        Find the best flights to your dream destinations globally with our premium booking experience.
                    </motion.p>

                    {/* Search Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="w-full max-w-4xl"
                    >
                        <FlightSearch />
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 w-full max-w-3xl"
                    >
                        {stats.map((s) => (
                            <div key={s.label} className="text-center">
                                <div className="text-3xl font-extrabold text-white">{s.value}</div>
                                <div className="text-blue-200 text-sm mt-1 font-medium">{s.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Wave */}
                <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
                    <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full">
                        <path d="M0 80L1440 80L1440 20C1200 70 960 10 720 40C480 70 240 10 0 40L0 80Z" fill="#f0f4ff" />
                    </svg>
                </div>
            </section>

            {/* ─── POPULAR DESTINATIONS ─── */}
            <section className="py-24 bg-gradient-to-b from-[#f0f4ff] to-white">
                <div className="container mx-auto px-4 max-w-7xl">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="text-center mb-14"
                    >
                        <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
                            <TrendingUp className="h-4 w-4" />
                            <span>Trending Now</span>
                        </motion.div>
                        <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Popular <span className="gradient-text">Destinations</span>
                        </motion.h2>
                        <motion.p variants={itemVariants} className="text-gray-500 max-w-xl mx-auto text-lg">
                            Top-rated routes handpicked for the best travel experiences
                        </motion.p>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {destinationsData.map((dest) => (
                            <motion.div
                                key={dest.city}
                                variants={itemVariants}
                                whileHover={{ y: -6 }}
                                onClick={() => navigate(`/destination/${dest.id}`)}
                                className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer"
                            >
                                <div className="h-48 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 z-10 transition-opacity group-hover:opacity-70" />
                                    <img
                                        src={dest.image}
                                        alt={dest.city}
                                        className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                    />
                                    <div className="absolute bottom-4 left-4 z-20">
                                        <h3 className="text-2xl font-bold text-white drop-shadow-md">{dest.city}</h3>
                                        <p className="text-white/90 text-sm drop-shadow">{dest.country}</p>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Starting from</p>
                                            <span className="text-blue-600 font-extrabold text-xl">{dest.price}</span>
                                        </div>
                                        <span className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors shadow-sm">
                                            <ArrowRight className="h-5 w-5 text-blue-600 group-hover:text-white transition-colors" />
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ─── WHY BOOK WITH US ─── */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 max-w-7xl">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 bg-violet-50 text-violet-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
                            <Star className="h-4 w-4" />
                            <span>Why Choose Us</span>
                        </motion.div>
                        <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Everything you need,<br /><span className="gradient-text">in one place</span>
                        </motion.h2>
                        <motion.p variants={itemVariants} className="text-gray-500 max-w-2xl mx-auto text-lg">
                            Experience seamless travel planning with our industry-leading features designed for your comfort and security.
                        </motion.p>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {features.map((feature) => {
                            const Icon = feature.icon;
                            return (
                                <motion.div
                                    key={feature.title}
                                    variants={itemVariants}
                                    whileHover={{ y: -8 }}
                                    className="feature-card group"
                                >
                                    <div className={`w-16 h-16 ${feature.bg} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className={`h-8 w-8 ${feature.iconColor}`} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                    <p className="text-gray-500 leading-relaxed text-base">{feature.desc}</p>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </section>

            {/* ─── CTA BANNER ─── */}
            <section className="py-20 mx-4 md:mx-8 mb-12 rounded-3xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #0284c7 100%)' }}>
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
                <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-center justify-center space-x-2 mb-4">
                            <Clock className="h-5 w-5 text-cyan-300" />
                            <span className="text-cyan-300 font-semibold text-sm">Limited Time Offer</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                            Ready for Takeoff?
                        </h2>
                        <p className="text-blue-200 text-lg mb-10 max-w-lg mx-auto">
                            Book your next flight today and get exclusive deals on thousands of routes worldwide.
                        </p>
                        <a
                            href="/search"
                            className="inline-flex items-center space-x-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-white/25 hover:scale-105"
                        >
                            <Plane className="h-5 w-5" />
                            <span>Search Flights Now</span>
                            <ArrowRight className="h-5 w-5" />
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* ─── FOOTER ─── */}
            <footer className="bg-gray-950 text-gray-400 py-12">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-3 mb-4 md:mb-0">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <Plane className="text-white h-5 w-5" />
                            </div>
                            <span className="text-white font-bold text-lg">Flight<span className="text-blue-400">Booker</span></span>
                        </div>
                        <p className="text-sm">© 2026 FlightBooker. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
