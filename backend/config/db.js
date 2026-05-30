const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/flight-booking';
        console.log(`📡 Attempting MongoDB connection to: ${mongoUri}`);

        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database: ${conn.connection.name}`);
        return conn;
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        console.error(`Connection URL: ${process.env.MONGO_URI || 'mongodb://localhost:27017/flight-booking'}`);
        throw error; // Re-throw so the caller can handle it
    }
};

module.exports = connectDB;
