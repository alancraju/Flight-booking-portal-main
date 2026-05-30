const mongoose = require('mongoose');

const flightInventorySchema = new mongoose.Schema({
    flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
    travelDate: { type: Date, required: true }, // The specific date of travel
    economy: {
        totalSeats: { type: Number, required: true, default: 120 },
        availableSeats: { type: Number, required: true, default: 120 },
        price: { type: Number, required: true } // Base price for economy
    },
    business: {
        totalSeats: { type: Number, required: true, default: 20 },
        availableSeats: { type: Number, required: true, default: 20 },
        price: { type: Number, required: true } // Base price for business
    }
}, { timestamps: true });

// Compound index for fast queries based on flight and date
flightInventorySchema.index({ flight: 1, travelDate: 1 }, { unique: true });

module.exports = mongoose.model('FlightInventory', flightInventorySchema);
