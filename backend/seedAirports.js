const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Airport = require('./models/Airport');

dotenv.config();

const indianAirports = [
    { iata_code: 'DEL', name: 'Indira Gandhi International Airport', city: 'New Delhi', country: 'India' },
    { iata_code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India' },
    { iata_code: 'BLR', name: 'Kempegowda International Airport', city: 'Bangalore', country: 'India' },
    { iata_code: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', country: 'India' },
    { iata_code: 'MAA', name: 'Chennai International Airport', city: 'Chennai', country: 'India' },
    { iata_code: 'CCU', name: 'Netaji Subhas Chandra Bose International Airport', city: 'Kolkata', country: 'India' },
    { iata_code: 'COK', name: 'Cochin International Airport', city: 'Kochi', country: 'India' },
    { iata_code: 'CCJ', name: 'Calicut International Airport', city: 'Kozhikode', country: 'India' },
    { iata_code: 'TRV', name: 'Trivandrum International Airport', city: 'Thiruvananthapuram', country: 'India' },
    { iata_code: 'AMD', name: 'Sardar Vallabhbhai Patel International Airport', city: 'Ahmedabad', country: 'India' },
    { iata_code: 'GOI', name: 'Dabolim Airport', city: 'Goa', country: 'India' },
    { iata_code: 'PNQ', name: 'Pune Airport', city: 'Pune', country: 'India' },
    { iata_code: 'LKO', name: 'Chaudhary Charan Singh International Airport', city: 'Lucknow', country: 'India' },
    { iata_code: 'ATQ', name: 'Sri Guru Ram Dass Jee International Airport', city: 'Amritsar', country: 'India' },
    { iata_code: 'JAI', name: 'Jaipur International Airport', city: 'Jaipur', country: 'India' }
];

const uaeAirports = [
    { iata_code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates' },
    { iata_code: 'AUH', name: 'Zayed International Airport', city: 'Abu Dhabi', country: 'United Arab Emirates' },
    { iata_code: 'SHJ', name: 'Sharjah International Airport', city: 'Sharjah', country: 'United Arab Emirates' },
    { iata_code: 'DWC', name: 'Al Maktoum International Airport', city: 'Dubai', country: 'United Arab Emirates' }
];

const airportsData = [...indianAirports, ...uaeAirports];

const seedDB = async () => {
    let connected = false;
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/flight-booking');
            connected = true;
            console.log('MongoDB Connected for Airport Seeding');
        }

        await Airport.deleteMany();
        console.log('Cleared existing airports');

        await Airport.insertMany(airportsData, { ordered: false });
        console.log(`Successfully seeded ${airportsData.length} India and UAE airports data!`);
    } catch (error) {
        if (error.code === 11000) {
            console.warn('Some airport records were skipped due to duplicate keys.');
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
