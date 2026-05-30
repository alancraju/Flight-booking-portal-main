import React from 'react';
import { Plane, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './UI/Button';
import { motion } from 'framer-motion';

const FlightCard = ({ flight }) => {
    const navigate = useNavigate();
    
    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex flex-col md:flex-row justify-between items-center gap-6"
        >
            <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="bg-blue-50 p-4 rounded-xl text-primary flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <Plane className="h-8 w-8" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-lg">{flight.airline}</h3>
                    <p className="text-gray-500 text-sm font-medium">Flight {flight.flightNumber}</p>
                </div>
            </div>

            <div className="flex items-center justify-between flex-1 w-full gap-4">
                <div className="text-center md:text-left">
                    <p className="font-bold text-2xl text-gray-900">{formatTime(flight.departureTime)}</p>
                    <p className="text-gray-500 text-sm font-medium">{flight.from}</p>
                </div>

                <div className="flex flex-col items-center flex-1 px-4">
                    <div className="flex items-center text-gray-500 text-xs mb-2 font-semibold bg-gray-50 px-3 py-1 rounded-full whitespace-nowrap">
                        <Clock className="w-3 h-3 mr-1" />
                        {flight.duration}
                    </div>
                    <div className="w-full flex items-center">
                        <div className="h-px bg-gray-300 flex-1 relative">
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                        </div>
                        <Plane className="h-4 w-4 text-primary mx-3" />
                        <div className="h-px bg-gray-300 flex-1 relative">
                            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary"></div>
                        </div>
                    </div>
                </div>

                <div className="text-center md:text-right">
                    <p className="font-bold text-2xl text-gray-900">{formatTime(flight.arrivalTime)}</p>
                    <p className="text-gray-500 text-sm font-medium">{flight.to}</p>
                </div>
            </div>

            <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-48 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                <div>
                    <p className="text-gray-500 text-sm mb-1 font-medium">Price</p>
                    <p className="text-3xl font-bold text-primary">${flight.price}</p>
                </div>
                <Button onClick={() => navigate(`/flight/${flight._id}`)} className="mt-0 md:mt-4 w-full md:w-auto px-6">
                    Select
                </Button>
            </div>
        </motion.div>
    );
};

export default FlightCard;
