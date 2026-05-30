const express = require('express');
const router = express.Router();
const { clerkMiddleware } = require('@clerk/express');
const { adminOnly } = require('../middleware/adminMiddleware');
const {
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
} = require('../controllers/adminController');

// Apply Clerk middleware and admin check to all routes
router.use(clerkMiddleware());
router.use(adminOnly);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Flights Management
router.get('/flights', getAllFlights);
router.post('/flights', createFlight);
router.patch('/flights/:id', updateFlight);
router.delete('/flights/:id', deleteFlight);

// Bookings Management
router.get('/bookings', getAllBookings);
router.get('/bookings/:id', getBookingById);
router.patch('/bookings/:id/status', updateBookingStatus);
router.delete('/bookings/:id/cancel', cancelBooking);

// Inventory Management
router.get('/inventory', getAllInventory);
router.patch('/inventory/:id', updateInventory);

// Airports Management
router.get('/airports', getAllAirports);
router.post('/airports', createAirport);
router.delete('/airports/:id', deleteAirport);

// Reports
router.get('/reports/revenue', getRevenueReport);
router.get('/reports/bookings', getBookingReport);

module.exports = router;
