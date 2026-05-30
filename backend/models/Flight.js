const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
    airline: { type: String, required: true },
    flightNumber: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    departureTime: { type: String, required: true }, // e.g. "08:00 AM" (Scheduled departure time)
    arrivalTime: { type: String, required: true }, // e.g. "11:30 AM"
    duration: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Flight', flightSchema);
