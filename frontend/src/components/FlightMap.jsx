import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

import { getCityCoordinates } from '../utils/coordinates';

const getBezierCurvePoints = (start, end, numPoints = 100) => {
    const lat1 = start[0], lon1 = start[1];
    const lat2 = end[0], lon2 = end[1];
    
    const midLat = (lat1 + lat2) / 2;
    const midLon = (lon1 + lon2) / 2;
    
    const latOffset = (lon2 - lon1) * 0.2;
    const lonOffset = -(lat2 - lat1) * 0.2;
    
    const controlLat = midLat + latOffset;
    const controlLon = midLon + lonOffset;

    const points = [];
    for (let t = 0; t <= 1; t += 1/numPoints) {
        const lat = (1 - t) * (1 - t) * lat1 + 2 * (1 - t) * t * controlLat + t * t * lat2;
        const lon = (1 - t) * (1 - t) * lon1 + 2 * (1 - t) * t * controlLon + t * t * lon2;
        points.push([lat, lon]);
    }
    return points;
};

const MapBounds = ({ start, end }) => {
    const map = useMap();
    useEffect(() => {
        if (start && end) {
            const bounds = L.latLngBounds([start, end]);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [start, end, map]);
    return null;
};

const FlightMap = ({ origin, destination }) => {
    const startCoord = getCityCoordinates(origin);
    const endCoord = getCityCoordinates(destination);

    if (!startCoord || !endCoord) {
        return (
            <div className="w-full h-full min-h-[300px] bg-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-500 border border-gray-200">
                <p>Map unavailable</p>
                <p className="text-xs mt-1">Coordinates not found for route: {origin} - {destination}</p>
            </div>
        );
    }

    const curvePoints = getBezierCurvePoints(startCoord, endCoord);

    return (
        <div className="w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-inner relative z-0 border border-gray-200">
            <MapContainer 
                center={startCoord} 
                zoom={4} 
                scrollWheelZoom={false} 
                style={{ height: '100%', width: '100%' }}
                className="z-0"
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapBounds start={startCoord} end={endCoord} />
                
                <Marker position={startCoord}>
                    <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent>
                        {origin} (Departure)
                    </Tooltip>
                </Marker>
                
                <Marker position={endCoord}>
                    <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent>
                        {destination} (Arrival)
                    </Tooltip>
                </Marker>

                <Polyline 
                    positions={curvePoints} 
                    color="#2563eb" 
                    weight={4} 
                    dashArray="8, 10" 
                    opacity={0.8}
                    className="animate-pulse"
                />
            </MapContainer>
        </div>
    );
};

export default FlightMap;
