const express = require('express');
const router = express.Router();
const { getFlights, getFlightById, seedFlights } = require('../controllers/flightController');

router.post('/seed', seedFlights);
router.get('/', getFlights);
router.get('/:id', getFlightById);

module.exports = router;
