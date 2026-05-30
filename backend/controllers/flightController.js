const Flight = require('../models/Flight');
const FlightInventory = require('../models/FlightInventory');
const Airport = require('../models/Airport');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const resolveAirportCode = async (value) => {
    if (!value) return null;

    const normalized = value.trim();
    if (!normalized) return null;

    const exactRegex = new RegExp(`^${escapeRegex(normalized)}$`, 'i');
    const containsRegex = new RegExp(escapeRegex(normalized), 'i');

    const airport = await Airport.findOne({
        $or: [
            { iata_code: exactRegex },
            { city: exactRegex },
            { city: containsRegex },
            { name: containsRegex }
        ]
    }).lean();

    return airport?.iata_code || normalized.toUpperCase();
};

const applyDynamicPricingAndStatus = (flight, inventory, classType) => {
    let status = 'Available';
    let dynamicPrice = inventory[classType].price;
    let availableSeats = inventory[classType].availableSeats;

    if (availableSeats === 0) {
        status = 'Sold Out';
    } else if (availableSeats < 10) {
        status = 'Almost Full';
        dynamicPrice = Math.round(inventory[classType].price * 1.40); // 40% increase
    } else if (availableSeats < 20) {
        status = 'Filling Fast';
        dynamicPrice = Math.round(inventory[classType].price * 1.20); // 20% increase
    }

    return {
        _id: flight._id,
        airline: flight.airline,
        flightNumber: flight.flightNumber,
        from: flight.from,
        to: flight.to,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        duration: flight.duration,
        classType,
        price: dynamicPrice,
        basePrice: inventory[classType].price,
        availableSeats,
        totalSeats: inventory[classType].totalSeats,
        status,
        inventoryId: inventory._id
    };
};

const getFlights = async (req, res) => {
    const { from, to, date, classType = 'economy' } = req.query;
    try {
        const [fromCode, toCode] = await Promise.all([
            resolveAirportCode(from),
            resolveAirportCode(to)
        ]);

        let flightQuery = {};

        if (fromCode) flightQuery.from = new RegExp(`^${escapeRegex(fromCode)}$`, 'i');
        if (toCode) flightQuery.to = new RegExp(`^${escapeRegex(toCode)}$`, 'i');

        const flights = await Flight.find(flightQuery).sort({ departureTime: 1 }).limit(50).lean();

        if (flights.length === 0) {
            return res.json([]);
        }

        // Get inventory for the specified date
        let inventoryQuery = {
            flight: { $in: flights.map(f => f._id) }
        };

        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            inventoryQuery.travelDate = { $gte: startOfDay, $lte: endOfDay };
        }

        const inventories = await FlightInventory.find(inventoryQuery).lean();

        // Combine flight data with inventory data and apply pricing
        const processedFlights = [];
        for (const flight of flights) {
            for (const inventory of inventories) {
                if (flight._id.toString() === inventory.flight.toString()) {
                    processedFlights.push(
                        applyDynamicPricingAndStatus(flight, inventory, classType)
                    );
                }
            }
        }

        res.json(processedFlights);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getFlightById = async (req, res) => {
    try {
        const flight = await Flight.findById(req.params.id).lean();
        if (!flight) return res.status(404).json({ message: 'Flight not found' });

        // Get latest inventory for this flight
        const inventory = await FlightInventory.findOne({ flight: flight._id }).sort({ travelDate: -1 }).lean();
        if (!inventory) return res.status(404).json({ message: 'Flight inventory not found' });

        res.json({
            flight,
            inventory
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const seedFlights = async (req, res) => {
    res.json({ message: 'Please run node seedFlights.js manually in the terminal.' });
};

module.exports = { getFlights, getFlightById, seedFlights };
