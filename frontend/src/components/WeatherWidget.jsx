import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudLightning, Snowflake, Loader2 } from 'lucide-react';
import { getCityCoordinates } from '../utils/coordinates';

const getWeatherIcon = (code) => {
    if (code === 0 || code === 1) return <Sun className="h-8 w-8 text-yellow-400" />;
    if (code >= 2 && code <= 45) return <Cloud className="h-8 w-8 text-gray-400" />;
    if (code >= 51 && code <= 67) return <CloudRain className="h-8 w-8 text-blue-400" />;
    if (code >= 71 && code <= 86) return <Snowflake className="h-8 w-8 text-blue-200" />;
    if (code >= 95) return <CloudLightning className="h-8 w-8 text-purple-500" />;
    return <Cloud className="h-8 w-8 text-gray-400" />;
};

const getWeatherDesc = (code) => {
    if (code === 0) return 'Clear sky';
    if (code === 1 || code === 2 || code === 3) return 'Partly cloudy';
    if (code >= 51 && code <= 67) return 'Rainy';
    if (code >= 71 && code <= 86) return 'Snowy';
    if (code >= 95) return 'Thunderstorm';
    return 'Cloudy';
};

const WeatherWidget = ({ city }) => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWeather = async () => {
            const coords = getCityCoordinates(city);
            if (!coords) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords[0]}&longitude=${coords[1]}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`);
                const data = await res.json();
                
                if (data && data.current_weather) {
                    setWeather({
                        temp: Math.round(data.current_weather.temperature),
                        code: data.current_weather.weathercode,
                        max: Math.round(data.daily.temperature_2m_max[0]),
                        min: Math.round(data.daily.temperature_2m_min[0]),
                    });
                }
            } catch (err) {
                console.error("Failed to fetch weather", err);
            } finally {
                setLoading(false);
            }
        };

        if (city) {
            fetchWeather();
        }
    }, [city]);

    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center justify-center h-32 shadow-sm">
                <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!weather) {
        return null;
    }

    return (
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-5 border border-blue-100 shadow-sm">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Current Weather in {city}</h4>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    {getWeatherIcon(weather.code)}
                    <div>
                        <p className="text-3xl font-black text-gray-800">{weather.temp}°C</p>
                        <p className="text-sm font-medium text-gray-500">{getWeatherDesc(weather.code)}</p>
                    </div>
                </div>
                <div className="text-right border-l border-gray-200 pl-4">
                    <p className="text-xs text-gray-400 font-bold uppercase">High / Low</p>
                    <p className="text-sm font-bold text-gray-700">{weather.max}° / {weather.min}°</p>
                </div>
            </div>
        </div>
    );
};

export default WeatherWidget;
