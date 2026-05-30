const Flight = require('../models/Flight');
const Booking = require('../models/Booking');
const FlightInventory = require('../models/FlightInventory');
const Airport = require('../models/Airport');

// Dashboard Statistics
const getDashboardStats = async (req, res) => {
    try {
        const totalFlights = await Flight.countDocuments();
        const totalBookings = await Booking.countDocuments();
        const totalRevenue = await Booking.aggregate([
            { $match: { paymentStatus: 'Paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const paidBookings = await Booking.countDocuments({ paymentStatus: 'Paid' });
        const pendingBookings = await Booking.countDocuments({ paymentStatus: 'Pending' });

        res.json({
            totalFlights,
            totalBookings,
            totalRevenue: totalRevenue[0]?.total || 0,
            paidBookings,
            pendingBookings,
            conversionRate: totalBookings > 0 ? ((paidBookings / totalBookings) * 100).toFixed(2) : 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===== FLIGHT MANAGEMENT =====
const getAllFlights = async (req, res) => {
    try {
        const flights = await Flight.find().sort({ createdAt: -1 });
        res.json(flights);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createFlight = async (req, res) => {
    const { airline, flightNumber, from, to, departureTime, arrivalTime, duration } = req.body;
    
    try {
        if (!airline || !flightNumber || !from || !to || !departureTime || !arrivalTime || !duration) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const flight = new Flight({
            airline,
            flightNumber,
            from,
            to,
            departureTime,
            arrivalTime,
            duration
        });

        const savedFlight = await flight.save();
        res.status(201).json(savedFlight);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateFlight = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedFlight = await Flight.findByIdAndUpdate(id, req.body, { new: true });
        
        if (!updatedFlight) {
            return res.status(404).json({ message: 'Flight not found' });
        }
        
        res.json(updatedFlight);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteFlight = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedFlight = await Flight.findByIdAndDelete(id);
        
        if (!deletedFlight) {
            return res.status(404).json({ message: 'Flight not found' });
        }
        
        res.json({ message: 'Flight deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===== BOOKING MANAGEMENT =====
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('flight')
            .populate('inventory')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('flight')
            .populate('inventory');
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentStatus } = req.body;

        if (!['Pending', 'Paid', 'Failed', 'Cancelled'].includes(paymentStatus)) {
            return res.status(400).json({ message: 'Invalid payment status' });
        }

        const booking = await Booking.findByIdAndUpdate(
            id,
            { paymentStatus },
            { new: true }
        ).populate('flight');

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findByIdAndUpdate(
            id,
            { paymentStatus: 'Cancelled' },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json({ message: 'Booking cancelled successfully', booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===== INVENTORY MANAGEMENT =====
const getAllInventory = async (req, res) => {
    try {
        const inventory = await FlightInventory.find()
            .populate('flight')
            .sort({ travelDate: -1 });
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const { economyPrice, businessPrice, economySeats, businessSeats } = req.body;

        // Fetch current inventory to calculate new available seats
        const currentInventory = await FlightInventory.findById(id);
        if (!currentInventory) {
            return res.status(404).json({ message: 'Inventory not found' });
        }

        const update = {};
        
        // Update Economy
        if (economyPrice !== undefined && economyPrice !== null && economyPrice !== '') {
            update['economy.price'] = Number(economyPrice);
        }
        if (economySeats !== undefined && economySeats !== null && economySeats !== '') {
            const newEconomySeats = Number(economySeats);
            const currentEconomySeats = currentInventory.economy.totalSeats;
            const economyBooked = currentEconomySeats - currentInventory.economy.availableSeats;
            
            // New available seats = new total - already booked
            const newAvailableEconomy = Math.max(0, newEconomySeats - economyBooked);
            
            update['economy.totalSeats'] = newEconomySeats;
            update['economy.availableSeats'] = newAvailableEconomy;
        }
        
        // Update Business
        if (businessPrice !== undefined && businessPrice !== null && businessPrice !== '') {
            update['business.price'] = Number(businessPrice);
        }
        if (businessSeats !== undefined && businessSeats !== null && businessSeats !== '') {
            const newBusinessSeats = Number(businessSeats);
            const currentBusinessSeats = currentInventory.business.totalSeats;
            const businessBooked = currentBusinessSeats - currentInventory.business.availableSeats;
            
            // New available seats = new total - already booked
            const newAvailableBusiness = Math.max(0, newBusinessSeats - businessBooked);
            
            update['business.totalSeats'] = newBusinessSeats;
            update['business.availableSeats'] = newAvailableBusiness;
        }

        const inventory = await FlightInventory.findByIdAndUpdate(id, update, { new: true });
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===== AIRPORT MANAGEMENT =====
const getAllAirports = async (req, res) => {
    try {
        const airports = await Airport.find().sort({ name: 1 });
        res.json(airports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createAirport = async (req, res) => {
    const { iata_code, name, city, country } = req.body;
    
    try {
        if (!iata_code || !name || !city || !country) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const airport = new Airport({ iata_code, name, city, country });
        const savedAirport = await airport.save();
        
        res.status(201).json(savedAirport);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteAirport = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAirport = await Airport.findByIdAndDelete(id);
        
        if (!deletedAirport) {
            return res.status(404).json({ message: 'Airport not found' });
        }
        
        res.json({ message: 'Airport deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===== REPORTS =====
const getRevenueReport = async (req, res) => {
    try {
        const report = await Booking.aggregate([
            { $match: { paymentStatus: 'Paid' } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    dailyRevenue: { $sum: '$totalAmount' },
                    bookingCount: { $sum: 1 }
                }
            },
            { $sort: { _id: -1 } },
            { $limit: 30 }
        ]);

        res.json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getBookingReport = async (req, res) => {
    try {
        const report = await Booking.aggregate([
            {
                $group: {
                    _id: '$paymentStatus',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' }
                }
            }
        ]);

        res.json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getAllFlights,
    createFlight,
    updateFlight,
    deleteFlight,
    getAllBookings,
    getBookingById,
    updateBookingStatus,
    cancelBooking,
    getAllInventory,
    updateInventory,
    getAllAirports,
    createAirport,
    deleteAirport,
    getRevenueReport,
    getBookingReport
};
