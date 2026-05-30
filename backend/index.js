const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const seedAirports = require('./seedAirports');
const seedFlights = require('./seedFlights');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const { clerkMiddleware } = require('@clerk/express');

// Middleware
app.use(cors());
app.use(express.json());

// Test route before Clerk middleware
app.get('/test', (req, res) => {
    res.json({ message: 'Test route working' });
});

app.use(clerkMiddleware());

// Routes
app.get('/api/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.json({ message: 'API is running', status: 'OK', database: dbStatus });
});

// Debug endpoint to check database connection
app.get('/api/db-status', (req, res) => {
    res.json({
        status: mongoose.connection.readyState,
        statusText: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState],
        database: mongoose.connection.name,
        host: mongoose.connection.host,
        mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/flight-booking'
    });
});

// We will mount routes here later
try {
    app.use('/api/flights', require('./routes/flightRoutes'));
    console.log('✅ Flights routes loaded');
} catch(e) { console.error('❌ Flights routes error:', e.message); }

try {
    app.use('/api/bookings', require('./routes/bookingRoutes'));
    console.log('✅ Bookings routes loaded');
} catch(e) { console.error('❌ Bookings routes error:', e.message); }

try {
    app.use('/api/payments', require('./routes/paymentRoutes'));
    console.log('✅ Payments routes loaded');
} catch(e) { console.error('❌ Payments routes error:', e.message); }

try {
    app.use('/api/airports', require('./routes/airportRoutes'));
    console.log('✅ Airports routes loaded');
} catch(e) { console.error('❌ Airports routes error:', e.message); }

try {
    app.use('/api/inventory', require('./routes/inventoryRoutes'));
    console.log('✅ Inventory routes loaded');
} catch(e) { console.error('❌ Inventory routes error:', e.message); }

// Admin Routes
try {
    app.use('/api/admin', require('./routes/adminRoutes'));
    console.log('✅ Admin routes loaded');
} catch(e) { console.error('❌ Admin routes error:', e.message); }

// 404 handler
app.use((req, res) => {
    console.log(`404 Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ message: 'Not found', path: req.url });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({ message: err.message });
});

const ensureSeedData = async () => {
    const Airport = require('./models/Airport');
    const Flight = require('./models/Flight');

    const airportCount = await Airport.countDocuments();
    if (airportCount === 0) {
        console.log('🔧 No airports found. Seeding airport data...');
        await seedAirports();
    }

    const flightCount = await Flight.countDocuments();
    if (flightCount === 0) {
        console.log('🔧 No flights found. Seeding flights and inventory data...');
        await seedFlights();
    }
};

app.listen(PORT, async () => {
    try {
        await connectDB();
        await ensureSeedData();
        console.log(`Server running on port ${PORT}`);
    } catch (error) {
        console.error('Failed to connect to MongoDB or seed data:', error);
        process.exit(1);
    }
});
