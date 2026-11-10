import { useState, useEffect, useCallback } from 'react';
import { weatherAPI } from '../services/api';

export const useWeatherData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemo, setIsDemo] = useState(false);

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    try {
      const res = await weatherAPI.getCurrent();
      // Handle backend envelope { success: true, data: { ... } } or raw object
      const weatherPayload = res.data?.data || res.data;
      setData(weatherPayload);
      setIsDemo(Boolean(res.isDemo || weatherPayload?.isSimulated));
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
    // Refresh every 5 minutes
    const interval = setInterval(fetchWeather, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  return { data, loading, error, isDemo, refetch: fetchWeather };
};
