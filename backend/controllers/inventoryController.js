const FlightInventory = require('../models/FlightInventory');
const Flight = require('../models/Flight');
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

// Helper to determine status and dynamic pricing based on availability
const processClassData = (classData, className) => {
    let status = 'Available';
    let dynamicPrice = classData.price;

    if (classData.availableSeats === 0) {
        status = 'Sold Out';
    } else if (classData.availableSeats < 5) {
        status = 'Almost Full';
        dynamicPrice = Math.round(classData.price * 1.40); // 40% increase
    } else if (classData.availableSeats < 15) {
        status = 'Filling Fast';
        dynamicPrice = Math.round(classData.price * 1.20); // 20% increase
    }

    return {
        ...classData, // totalSeats, availableSeats
        basePrice: classData.price,
        price: dynamicPrice,
        status,
        seatsLeft: classData.availableSeats
    };
};

const createDefaultInventory = async (flights, travelDate, existingRecords) => {
    const existingFlightIds = new Set(existingRecords.map(inv => {
        const flight = inv.flight?._id || inv.flight;
        return flight.toString();
    }));
    const recordsToCreate = flights
        .filter(flight => !existingFlightIds.has(flight._id.toString()))
        .map((flight) => {
            const economyPrice = Math.floor(Math.random() * (15000 - 4000 + 1) + 4000);
            const businessPrice = Math.floor(economyPrice * 2.5);

            return {
                flight: flight._id,
                travelDate,
                economy: {
                    totalSeats: 120,
                    availableSeats: 120,
                    price: economyPrice
                },
                business: {
                    totalSeats: 20,
                    availableSeats: 20,
                    price: businessPrice
                }
            };
        });

    if (recordsToCreate.length === 0) return;

    try {
        await FlightInventory.insertMany(recordsToCreate, { ordered: false });
    } catch (error) {
        // Ignore duplicate-key races if two searches generate the same date together.
        if (error.code !== 11000 && error.name !== 'BulkWriteError') {
            throw error;
        }
    }
};

const searchInventory = async (req, res) => {
    const { from, to, date } = req.query;

    try {
        const [fromCode, toCode] = await Promise.all([
            resolveAirportCode(from),
            resolveAirportCode(to)
        ]);

        // Find matching flight routes first
        let flightQuery = {};
        if (fromCode) flightQuery.from = new RegExp(`^${escapeRegex(fromCode)}$`, 'i');
        if (toCode) flightQuery.to = new RegExp(`^${escapeRegex(toCode)}$`, 'i');

        const flights = await Flight.find(flightQuery).lean();
        const flightIds = flights.map(f => f._id);

        // Now find inventory for these flights on the specific date
        let inventoryQuery = { flight: { $in: flightIds } };
        
        let travelDateForCreation = null;

        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            inventoryQuery.travelDate = { $gte: startOfDay, $lte: endOfDay };
            travelDateForCreation = startOfDay;
        } else {
            // If no date provided, maybe just return today's onwards (or just require date)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            inventoryQuery.travelDate = { $gte: today };
        }

        let inventoryRecords = await FlightInventory.find(inventoryQuery)
            .populate('flight')
            .lean();

        if (travelDateForCreation && inventoryRecords.length < flights.length) {
            await createDefaultInventory(flights, travelDateForCreation, inventoryRecords);
            inventoryRecords = await FlightInventory.find(inventoryQuery)
                .populate('flight')
                .lean();
        }

        // Process dynamic pricing and status
        const processedInventory = inventoryRecords.map(inv => {
            return {
                inventoryId: inv._id,
                flight: inv.flight,
                travelDate: inv.travelDate,
                economy: processClassData(inv.economy, 'Economy'),
                business: processClassData(inv.business, 'Business'),
            };
        });

        res.json(processedInventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const bookInventory = async (req, res) => {
    const { inventoryId, classType, seatsToBook } = req.body;
    // classType should be 'economy' or 'business'

    if (!classType || !['economy', 'business'].includes(classType.toLowerCase())) {
        return res.status(400).json({ message: "Invalid class type" });
    }

    const classKey = classType.toLowerCase();

    try {
        // Atomic check and update using dynamic key
        const updateQuery = {};
        updateQuery[`${classKey}.availableSeats`] = -seatsToBook;

        const conditionQuery = { _id: inventoryId };
        conditionQuery[`${classKey}.availableSeats`] = { $gte: seatsToBook };

        const inventory = await FlightInventory.findOneAndUpdate(
            conditionQuery,
            { $inc: updateQuery },
            { new: true }
        );

        if (!inventory) {
            const exists = await FlightInventory.findById(inventoryId);
            if (!exists) return res.status(404).json({ message: 'Inventory not found' });
            return res.status(400).json({ message: `Not enough ${classType} seats available. Only ${exists[classKey].availableSeats} left.` });
        }

        res.status(200).json({ message: "Seats reserved successfully", inventory });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const cancelInventory = async (req, res) => {
    const { inventoryId, classType, seatsToRestore } = req.body;

    if (!classType || !['economy', 'business'].includes(classType.toLowerCase())) {
        return res.status(400).json({ message: "Invalid class type" });
    }

    const classKey = classType.toLowerCase();

    try {
        const updateQuery = {};
        updateQuery[`${classKey}.availableSeats`] = seatsToRestore;

        const inventory = await FlightInventory.findByIdAndUpdate(
            inventoryId,
            { $inc: updateQuery },
            { new: true }
        );

        if (!inventory) {
            return res.status(404).json({ message: 'Inventory not found' });
        }

        res.status(200).json({ message: "Seats restored successfully", inventory });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { searchInventory, bookInventory, cancelInventory };
