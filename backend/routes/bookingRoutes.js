const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createBooking, getMyBookings, getBookingById, updateBookingToPaid, cancelBooking, cancelTicket } = require('../controllers/bookingController');

router.route('/').post(protect, createBooking).get(protect, getMyBookings);
router.route('/:id').get(protect, getBookingById);
router.route('/:id/pay').put(protect, updateBookingToPaid);
router.route('/:id/cancel').post(protect, cancelBooking);
router.route('/:bookingId/cancel-ticket').post(protect, cancelTicket);

module.exports = router;
