// Dummy flight data generator - simulates real airline data
const airlines = [
    { name: 'IndiGo', code: '6E', logo: '🔵' },
    { name: 'Air India', code: 'AI', logo: '🔴' },
    { name: 'SpiceJet', code: 'SG', logo: '🟠' },
    { name: 'Vistara', code: 'UK', logo: '🟣' },
    { name: 'GoAir', code: 'G8', logo: '🟢' },
    { name: 'AirAsia India', code: 'I5', logo: '🔴' },
];

const classes = ['Economy', 'Business', 'First Class'];

function addHours(date, hours) {
    return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateFlightNumber(code) {
    return `${code}-${randomBetween(100, 999)}`;
}

export function generateDummyFlights(from, to, date) {
    const seed = `${from}-${to}-${date}`;
    // Deterministic-ish seed so same search returns same results
    const numFlights = 5 + (seed.length % 4);
    const baseDate = date ? new Date(date + 'T05:00:00') : new Date();

    return Array.from({ length: numFlights }, (_, i) => {
        const airline = airlines[i % airlines.length];
        const departureHour = 5 + i * 2 + randomBetween(0, 1);
        const durationHours = 1 + randomBetween(0, 3) + (i % 2 === 0 ? 0.5 : 0);
        const departureTime = addHours(baseDate, departureHour);
        const arrivalTime = addHours(departureTime, durationHours);
        const hours = Math.floor(durationHours);
        const mins = Math.round((durationHours % 1) * 60);
        const price = randomBetween(3499, 18999);
        const stops = i % 3 === 0 ? 1 : 0;
        const seats = randomBetween(8, 42);

        return {
            _id: `flight_${seed}_${i}`,
            airline: airline.name,
            airlineCode: airline.code,
            logo: airline.logo,
            flightNumber: generateFlightNumber(airline.code),
            from: from || 'DEL',
            to: to || 'BOM',
            departureTime: departureTime.toISOString(),
            arrivalTime: arrivalTime.toISOString(),
            duration: `${hours}h ${mins}m`,
            durationMins: hours * 60 + mins,
            price,
            stops,
            seatsAvailable: seats,
            class: classes[i % classes.length],
            amenities: ['WiFi', 'Meals', 'Entertainment'].slice(0, randomBetween(1, 3)),
        };
    });
}
