import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
    const [selectedFlight, setSelectedFlight] = useState(() => {
        const s = sessionStorage.getItem('selectedFlight');
        return s ? JSON.parse(s) : null;
    });

    const [returnFlight, setReturnFlight] = useState(() => {
        const s = sessionStorage.getItem('returnFlight');
        return s ? JSON.parse(s) : null;
    });

    const [currentBooking, setCurrentBooking] = useState(() => {
        const s = sessionStorage.getItem('currentBooking');
        return s ? JSON.parse(s) : null;
    });

    const selectFlight = (flight) => {
        setSelectedFlight(flight);
        sessionStorage.setItem('selectedFlight', JSON.stringify(flight));
    };

    const selectReturnFlight = (flight) => {
        setReturnFlight(flight);
        sessionStorage.setItem('returnFlight', JSON.stringify(flight));
    };

    const saveBooking = (booking) => {
        setCurrentBooking(booking);
        sessionStorage.setItem('currentBooking', JSON.stringify(booking));
    };

    const clearBooking = () => {
        setSelectedFlight(null);
        setReturnFlight(null);
        setCurrentBooking(null);
        sessionStorage.removeItem('selectedFlight');
        sessionStorage.removeItem('returnFlight');
        sessionStorage.removeItem('currentBooking');
    };

    return (
        <BookingContext.Provider value={{ selectedFlight, returnFlight, currentBooking, selectFlight, selectReturnFlight, saveBooking, clearBooking }}>
            {children}
        </BookingContext.Provider>
    );
};

export const useBooking = () => useContext(BookingContext);
