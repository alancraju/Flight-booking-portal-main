const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const FlightInventory = require('../models/FlightInventory');

const createBooking = async (req, res) => {
    const { flightId, inventoryId, classType, passengers, totalAmount, addons, seats } = req.body;

    try {
        console.log('📝 Creating booking:', { flightId, inventoryId, classType, passengerCount: passengers?.length });

        if (!req.auth || !req.auth.userId) {
            return res.status(401).json({ message: 'User not authenticated. No auth.userId found.' });
        }

        const numberOfTickets = passengers.length;

        // Atomic check and update to prevent race conditions
        const seatField = `${classType}.availableSeats`;
        console.log(`🔍 Checking inventory availability for ${classType}...`);

        const inventory = await FlightInventory.findOneAndUpdate(
            { _id: inventoryId, [seatField]: { $gte: numberOfTickets } },
            { $inc: { [seatField]: -numberOfTickets } },
            { new: true }
        );

        if (!inventory) {
            // Check if inventory exists at all to return appropriate error
            const exists = await FlightInventory.findById(inventoryId);
            if (!exists) return res.status(404).json({ message: 'Flight inventory not found' });
            const availableSeats = exists?.[classType]?.availableSeats || 0;
            console.log(`❌ Not enough seats. Available: ${availableSeats}, Requested: ${numberOfTickets}`);
            return res.status(400).json({ message: `Not enough ${classType} seats available. Only ${availableSeats} left.` });
        }

        console.log(`✅ Seats reserved. Updated inventory:`, inventory[classType]);

        const booking = new Booking({
            user: req.auth.userId,
            flight: flightId,
            inventory: inventoryId,
            classType: classType,
            passengers,
            addons,
            seats,
            totalAmount,
            paymentStatus: 'Pending'
        });

        const createdBooking = await booking.save();
        console.log(`✅ Booking saved to MongoDB with ID: ${createdBooking._id}`);
        res.status(201).json(createdBooking);
    } catch (error) {
        console.error('❌ Error creating booking:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({ message: error.message, error: error.toString() });
    }
};

const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.auth.userId }).populate('flight');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('flight');
        if (booking && booking.user === req.auth.userId) {
            res.json(booking);
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateBookingToPaid = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (booking) {
            booking.paymentStatus = 'Paid';
            booking.stripePaymentIntentId = req.body.paymentIntentId;
            const updatedBooking = await booking.save();
            res.json(updatedBooking);
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // Ensure user owns booking
        if (booking.user !== req.auth.userId) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Avoid double cancellation
        if (booking.paymentStatus === 'Cancelled') {
            return res.status(400).json({ message: 'Booking is already cancelled' });
        }

        // Only allow cancellation if booking is not paid, or provide refund logic
        if (booking.paymentStatus === 'Paid') {
            console.log(`⚠️ Cancelling paid booking ${booking._id}. Refund required.`);
        }

        // Restore seats using atomic increment on the correct inventory
        const seatField = `${booking.classType}.availableSeats`;
        console.log(`🔄 Restoring ${booking.passengers.length} seats to inventory...`);

        await FlightInventory.findByIdAndUpdate(
            booking.inventory,
            { $inc: { [seatField]: booking.passengers.length } }
        );

        booking.paymentStatus = 'Cancelled';
        booking.cancelledAt = new Date();
        await booking.save();

        console.log(`✅ Booking ${booking._id} cancelled and seats restored`);
        res.json({
            message: 'Booking cancelled successfully and seats restored',
            booking,
            refundRequired: booking.paymentStatus === 'Paid'
        });
    } catch (error) {
        console.error('❌ Error cancelling booking:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// New function: Cancel specific tickets/passengers from a booking
const cancelTicket = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { passengerIndices } = req.body; // Array of passenger indices to cancel

        const booking = await Booking.findById(bookingId);

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // Ensure user owns booking
        if (booking.user !== req.auth.userId) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (booking.paymentStatus === 'Cancelled') {
            return res.status(400).json({ message: 'Cannot modify cancelled booking' });
        }

        if (!Array.isArray(passengerIndices) || passengerIndices.length === 0) {
            return res.status(400).json({ message: 'Invalid passenger indices' });
        }

        // Validate indices
        if (passengerIndices.some(idx => idx < 0 || idx >= booking.passengers.length)) {
            return res.status(400).json({ message: 'Invalid passenger index' });
        }

        // Can't cancel more passengers than exist
        if (passengerIndices.length > booking.passengers.length) {
            return res.status(400).json({ message: 'Cannot cancel more passengers than in booking' });
        }

        const ticketsToCancelled = passengerIndices.length;
        const cancelledPassengers = passengerIndices.map(idx => booking.passengers[idx]);
        const remainingPassengers = booking.passengers.filter((_, idx) => !passengerIndices.includes(idx));
        const remainingSeats = booking.seats.filter((_, idx) => !passengerIndices.includes(idx));

        // If cancelling all passengers, cancel entire booking
        if (remainingPassengers.length === 0) {
            return cancelBooking(req, res);
        }

        // Restore seats for cancelled passengers
        const seatField = `${booking.classType}.availableSeats`;
        console.log(`🔄 Restoring ${ticketsToCancelled} seats to inventory...`);

        await FlightInventory.findByIdAndUpdate(
            booking.inventory,
            { $inc: { [seatField]: ticketsToCancelled } }
        );

        // Update booking with remaining passengers
        booking.passengers = remainingPassengers;
        booking.seats = remainingSeats;

        // Recalculate total amount (divide by original count to get per-ticket price)
        const pricePerTicket = booking.totalAmount / (passengerIndices.length + remainingPassengers.length);
        booking.totalAmount = Math.round(pricePerTicket * remainingPassengers.length);

        await booking.save();

        console.log(`✅ ${ticketsToCancelled} tickets cancelled from booking ${bookingId}`);
        res.json({
            message: `${ticketsToCancelled} ticket(s) cancelled successfully`,
            booking,
            cancelledPassengers,
            refundAmount: Math.round(pricePerTicket * ticketsToCancelled)
        });
    } catch (error) {
        console.error('❌ Error cancelling ticket:', error.message);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createBooking, getMyBookings, getBookingById, updateBookingToPaid, cancelBooking, cancelTicket };
