const Airport = require('../models/Airport');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const searchAirports = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        // Search by first letter or any matching substring in name, city, or code.
        // We use regex for a flexible, "starts with" or partial match
        const escapedQuery = escapeRegex(query.trim());
        const regex = new RegExp(`^${escapedQuery}`, 'i'); // Case-insensitive starts with
        const containsRegex = new RegExp(escapedQuery, 'i'); // Case-insensitive contains

        // Prioritize airports that start with the letter/string, then those that contain it
        const airports = await Airport.find({
            $or: [
                { city: regex },
                { name: regex },
                { iata_code: regex },
                { city: containsRegex },
                { name: containsRegex }
            ]
        }).limit(10);

        res.json(airports);
    } catch (error) {
        res.status(500).json({ message: 'Error searching airports', error: error.message });
    }
};

module.exports = { searchAirports };
