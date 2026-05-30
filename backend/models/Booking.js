const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: { type: String, required: true },
    flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
    inventory: { type: mongoose.Schema.Types.ObjectId, ref: 'FlightInventory', required: true },
    classType: { type: String, enum: ['economy', 'business'], required: true },
    passengers: [{
        name: { type: String, required: true },
        age: { type: Number, required: true },
        gender: { type: String, required: true }
    }],
    addons: {
        extraBaggage: { type: Boolean, default: false },
        priorityBoarding: { type: Boolean, default: false },
        meal: { type: Boolean, default: false }
    },
    seats: [{ type: String }],
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Cancelled'], default: 'Pending' },
    stripePaymentIntentId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
