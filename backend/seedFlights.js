const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Flight = require('./models/Flight');
const FlightInventory = require('./models/FlightInventory');
const Airport = require('./models/Airport');

dotenv.config();

const airlines = [
    'Emirates', 'Etihad Airways', 'Air Arabia', 'flydubai', 
    'Air India', 'IndiGo', 'SpiceJet', 'Vistara', 'Air India Express'
];

// Helper to format time "HH:MM AM/PM"
const formatTime = (hour, min) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    const m = min.toString().padStart(2, '0');
    return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
};

const seedDB = async () => {
    let connected = false;
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/flight-booking');
            connected = true;
            console.log('MongoDB Connected for Flight & Inventory Seeding');
        }

        // Clear existing flights and inventory
        await Flight.deleteMany();
        await FlightInventory.deleteMany();
        console.log('Cleared existing flights and inventory');

        const airports = await Airport.find();
        if (airports.length === 0) {
            console.error('No airports found. Please run seedAirports.js first.');
            throw new Error('No airports found');
        }

        const flightsToInsert = [];
        
        console.log('Generating 10-15 fixed flights (routes) per airport pair...');

        // 1. GENERATE FIXED FLIGHTS (ROUTES)
        for (let i = 0; i < airports.length; i++) {
            for (let j = 0; j < airports.length; j++) {
                if (i === j) continue;

                const origin = airports[i];
                const destination = airports[j];
                
                // Random between 10 and 15 fixed flights per route
                const numFlights = Math.floor(Math.random() * 6) + 10; 
                
                for (let f = 0; f < numFlights; f++) {
                    const airline = airlines[Math.floor(Math.random() * airlines.length)];
                    
                    // Spread flights throughout the day
                    const depHour = Math.floor((f * (24 / numFlights)) + Math.random() * 2) % 24;
                    const depMin = Math.floor(Math.random() * 60);
                    const departureTime = formatTime(depHour, depMin);

                    // Duration
                    const durationHours = Math.floor(Math.random() * 4) + 1;
                    const durationMins = Math.floor(Math.random() * 60);
                    const durationStr = `${durationHours}h ${durationMins.toString().padStart(2, '0')}m`;

                    const arrHour = (depHour + durationHours + Math.floor((depMin + durationMins) / 60)) % 24;
                    const arrMin = (depMin + durationMins) % 60;
                    const arrivalTime = formatTime(arrHour, arrMin);

                    flightsToInsert.push({
                        airline: airline,
                        flightNumber: `${airline.substring(0, 2).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`,
                        from: origin.iata_code,
                        to: destination.iata_code,
                        departureTime,
                        arrivalTime,
                        duration: durationStr
                    });
                }
            }
        }

        const insertedFlights = await Flight.insertMany(flightsToInsert);
        console.log(`Successfully seeded exactly ${insertedFlights.length} fixed flights (Routes)!`);

        // 2. GENERATE INVENTORY FOR THE NEXT 7 DAYS
        const inventoryToInsert = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        console.log('Generating inventory for the next 7 days...');

        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
            const flightDate = new Date(today);
            flightDate.setDate(today.getDate() + dayOffset);

            for (const flight of insertedFlights) {
                // Randomize Base Prices per route slightly, but economy is cheaper than business
                const baseEconomyPrice = Math.floor(Math.random() * (15000 - 4000 + 1) + 4000);
                const baseBusinessPrice = Math.floor(baseEconomyPrice * (Math.random() * 2 + 2)); // 2x to 4x economy

                const totalEconomy = [120, 150, 180][Math.floor(Math.random() * 3)];
                const totalBusiness = [12, 20, 30][Math.floor(Math.random() * 3)];

                // Simulate some bookings already made (available < total)
                let availableEconomy = totalEconomy;
                let availableBusiness = totalBusiness;
                
                const rand = Math.random();
                if (rand < 0.1) availableEconomy = 0; // 10% sold out
                else if (rand < 0.3) availableEconomy = Math.floor(Math.random() * 15) + 1; // Almost full
                else availableEconomy = totalEconomy - Math.floor(Math.random() * 50);

                const randBiz = Math.random();
                if (randBiz < 0.1) availableBusiness = 0;
                else if (randBiz < 0.3) availableBusiness = Math.floor(Math.random() * 3) + 1;
                else availableBusiness = totalBusiness - Math.floor(Math.random() * 10);

                inventoryToInsert.push({
                    flight: flight._id,
                    travelDate: flightDate,
                    economy: {
                        totalSeats: totalEconomy,
                        availableSeats: availableEconomy,
                        price: baseEconomyPrice
                    },
                    business: {
                        totalSeats: totalBusiness,
                        availableSeats: availableBusiness,
                        price: baseBusinessPrice
                    }
                });
            }
        }

        const batchSize = 2000;
        for (let i = 0; i < inventoryToInsert.length; i += batchSize) {
            const batch = inventoryToInsert.slice(i, i + batchSize);
            await FlightInventory.insertMany(batch, { ordered: false });
            console.log(`Inserted inventory batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(inventoryToInsert.length / batchSize)}`);
        }

        console.log(`Successfully seeded ${inventoryToInsert.length} inventory records!`);
    } catch (error) {
        if (error.code === 11000) {
            console.warn('Some inventory records were skipped due to duplicate keys.');
        } else {
            console.error('Error seeding data:', error);
            throw error;
        }
    } finally {
        if (connected) await mongoose.disconnect();
    }
};

if (require.main === module) {
    seedDB().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = seedDB;
