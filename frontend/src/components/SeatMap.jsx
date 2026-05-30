import React, { useState } from 'react';
import { motion } from 'framer-motion';

const SeatMap = ({ passengers, selectedSeats, onSeatSelect, classType }) => {
    // Basic mock logic: generate rows
    // Economy: 3-3 configuration, 20 rows
    // Business: 2-2 configuration, 5 rows
    
    const rows = classType === 'business' ? 5 : 20;
    const config = classType === 'business' ? ['A', 'B', 'gap', 'E', 'F'] : ['A', 'B', 'C', 'gap', 'D', 'E', 'F'];

    // Randomly pre-book some seats for realism
    const [bookedSeats] = useState(() => {
        const booked = new Set();
        for (let i = 1; i <= rows; i++) {
            config.filter(c => c !== 'gap').forEach(c => {
                if (Math.random() < 0.3) booked.add(`${i}${c}`);
            });
        }
        return booked;
    });

    const isSelected = (seatId) => selectedSeats.includes(seatId);
    const isBooked = (seatId) => bookedSeats.has(seatId);

    const toggleSeat = (seatId) => {
        if (isBooked(seatId)) return;
        onSeatSelect(seatId);
    };

    return (
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 flex flex-col items-center">
            <h3 className="font-bold text-gray-800 mb-6 text-xl">Select Your Seats</h3>
            
            <div className="flex gap-4 mb-8 text-sm font-semibold">
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-gray-200"></div>Available</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-blue-600"></div>Selected</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-100 border border-red-200"></div>Booked</div>
            </div>

            <div className="bg-gray-50 rounded-[3rem] p-8 border-4 border-gray-200 shadow-inner relative max-w-sm w-full mx-auto">
                {/* Airplane nose curve simulation */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-full h-20 bg-gray-50 border-t-4 border-x-4 border-gray-200 rounded-t-[50%]"></div>
                
                <div className="space-y-4">
                    {Array.from({ length: rows }).map((_, rIdx) => {
                        const rowNum = rIdx + 1;
                        return (
                            <div key={rowNum} className="flex items-center justify-center gap-2">
                                <div className="w-6 text-center text-xs font-bold text-gray-400">{rowNum}</div>
                                {config.map((col, cIdx) => {
                                    if (col === 'gap') return <div key={cIdx} className="w-6"></div>;
                                    const seatId = `${rowNum}${col}`;
                                    const booked = isBooked(seatId);
                                    const selected = isSelected(seatId);
                                    
                                    return (
                                        <motion.button
                                            whileTap={!booked ? { scale: 0.9 } : {}}
                                            key={seatId}
                                            onClick={() => toggleSeat(seatId)}
                                            disabled={booked}
                                            className={`w-10 h-10 rounded-t-xl rounded-b-sm border-2 flex items-center justify-center text-xs font-bold transition-colors
                                                ${booked ? 'bg-red-50 border-red-200 text-red-300 cursor-not-allowed' : 
                                                  selected ? 'bg-blue-600 border-blue-700 text-white shadow-md' : 
                                                  'bg-white border-gray-300 text-gray-600 hover:border-blue-400'
                                                }
                                            `}
                                        >
                                            {col}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="mt-6 text-center text-gray-500 text-sm">
                You have selected {selectedSeats.length} out of {passengers.length} seats.
            </div>
        </div>
    );
};

export default SeatMap;
