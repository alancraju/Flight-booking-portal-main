import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { destinationsData } from '../data/destinations';
import { ArrowLeft, MapPin, Calendar, CheckCircle, Plane } from 'lucide-react';
import { motion } from 'framer-motion';
import WeatherWidget from '../components/WeatherWidget';

const DestinationDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [destination, setDestination] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        const dest = destinationsData.find(d => d.id === id);
        if (dest) {
            setDestination(dest);
        }
    }, [id]);

    if (!destination) {
        return (
            <div className="min-h-screen bg-[#f0f4ff] flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Destination Not Found</h1>
                <button 
                    onClick={() => navigate('/')}
                    className="text-blue-600 font-semibold hover:underline"
                >
                    Return Home
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f0f4ff] pb-24 font-sans">
            {/* HERO SECTION */}
            <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
                <div className="absolute inset-0 bg-black/40 z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#f0f4ff] via-transparent to-transparent z-20" />
                <motion.img 
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    src={destination.image} 
                    alt={destination.city} 
                    className="absolute inset-0 w-full h-full object-cover"
                />
                
                <div className="absolute z-30 top-24 left-4 md:left-12">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="flex items-center space-x-2 text-white bg-black/30 hover:bg-black/50 backdrop-blur-md px-4 py-2 rounded-full transition-all"
                    >
                        <ArrowLeft className="h-4 w-4" /><span>Back</span>
                    </button>
                </div>

                <div className="absolute z-30 bottom-16 left-4 md:left-12 max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <div className="flex items-center space-x-2 mb-3">
                            <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                Popular Destination
                            </span>
                            <span className="flex items-center text-white/90 text-sm font-medium backdrop-blur-md bg-black/20 px-3 py-1 rounded-full">
                                <MapPin className="h-3 w-3 mr-1" /> {destination.country}
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-2 tracking-tight drop-shadow-xl">
                            {destination.city}
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100 font-medium drop-shadow-md">
                            {destination.heroTitle}
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-12 max-w-7xl -mt-8 relative z-30">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* MAIN CONTENT */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-blue-900/5 border border-gray-100"
                        >
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-6">About {destination.city}</h2>
                            <p className="text-gray-600 text-lg leading-relaxed mb-8">
                                {destination.description}
                            </p>

                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Highlights</h3>
                            <div className="space-y-6">
                                {destination.features.map((feature, idx) => (
                                    <div key={idx} className="flex space-x-4">
                                        <div className="flex-shrink-0 mt-1">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                                <CheckCircle className="h-5 w-5 text-blue-600" />
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-gray-800">{feature.title}</h4>
                                            <p className="text-gray-500 mt-1">{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Gallery */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-blue-900/5 border border-gray-100"
                        >
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Gallery</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {destination.gallery.map((imgSrc, idx) => (
                                    <div key={idx} className={`rounded-2xl overflow-hidden ${idx === 0 ? 'md:col-span-2 md:h-80' : 'h-48'}`}>
                                        <img 
                                            src={imgSrc} 
                                            alt={`${destination.city} gallery ${idx + 1}`} 
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                                        />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* SIDEBAR */}
                    <div className="space-y-6">
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            className="bg-white rounded-3xl p-6 shadow-xl shadow-blue-900/5 border border-gray-100 sticky top-24 space-y-6"
                        >
                            <div className="text-center">
                                <p className="text-gray-500 font-medium mb-1">Starting from</p>
                                <h3 className="text-4xl font-black text-blue-600">{destination.price}</h3>
                                <p className="text-sm text-gray-400 mt-1">per passenger</p>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
                                <div className="flex items-center space-x-3 text-gray-700">
                                    <Calendar className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase">Best Time To Visit</p>
                                        <p className="font-semibold">{destination.bestTime}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <WeatherWidget city={destination.city} />

                            <button 
                                onClick={() => navigate('/search')}
                                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1"
                            >
                                <Plane className="h-5 w-5" />
                                <span>Find Flights to {destination.city}</span>
                            </button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DestinationDetails;
