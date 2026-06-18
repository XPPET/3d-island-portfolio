import { useState, useEffect } from 'react';

export interface WeatherData {
    temperature: number;
    weathercode: number;
    is_day: number;
    windspeed: number;
}

export const useWeather = () => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWeather = async (latitude: number, longitude: number) => {
            try {
                console.log(`Fetching weather for ${latitude}, ${longitude}`);
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
                );
                const data = await response.json();
                console.log("Weather data received:", data);
                setWeather(data.current_weather);
            } catch (err) {
                console.warn("Weather fetch failed:", err);
                setError('Failed to fetch weather data');
            } finally {
                setLoading(false);
            }
        };

        if (!navigator.geolocation) {
            console.warn("Geolocation not supported, using fallback.");
            setError('Geolocation is not supported by your browser');
            fetchWeather(51.5074, -0.1278); // London Fallback
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log("Geolocation success:", position);
                const { latitude, longitude } = position.coords;
                fetchWeather(latitude, longitude);
            },
            (err) => {
                console.warn("Geolocation failed or denied:", err);
                setError('Unable to retrieve your location');
                fetchWeather(51.5074, -0.1278); // London Fallback
            }
        );
    }, []);

    return { weather, loading, error };
};
