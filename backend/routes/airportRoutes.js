const express = require('express');
const router = express.Router();
const { searchAirports } = require('../controllers/airportController');

router.get('/search', searchAirports);

module.exports = router;
