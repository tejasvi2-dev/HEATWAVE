import { useState, useEffect } from 'react';
import { weatherAPI } from '../services/api';

export const useForecast = () => {
  const [forecast, setForecast] = useState([]);
  const [dailyForecast, setDailyForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchForecasts = async () => {
      setLoading(true);
      try {
        const [hourlyRes, dailyRes] = await Promise.all([
          weatherAPI.getForecast(),
          weatherAPI.getDaily(),
        ]);

        if (isMounted) {
          const hourlyData = hourlyRes.data?.data || hourlyRes.data || [];
          const dailyData = dailyRes.data?.data || dailyRes.data || [];
          setForecast(Array.isArray(hourlyData) ? hourlyData : []);
          setDailyForecast(Array.isArray(dailyData) ? dailyData : []);
          setIsDemo(Boolean(hourlyRes.isDemo || dailyRes.isDemo));
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load forecast');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchForecasts();
    return () => { isMounted = false; };
  }, []);

  return { forecast, dailyForecast, loading, error, isDemo };
};
