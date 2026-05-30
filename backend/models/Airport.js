const mongoose = require('mongoose');

const airportSchema = new mongoose.Schema({
    iata_code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true }
}, { timestamps: true });

// Create an index for faster text search
airportSchema.index({ name: 'text', city: 'text', iata_code: 'text' });

module.exports = mongoose.model('Airport', airportSchema);
