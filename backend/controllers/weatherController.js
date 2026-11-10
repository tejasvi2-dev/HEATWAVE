/**
 * weatherController.js — Route handlers for /api/weather endpoints.
 */

const weatherService = require('../services/weatherService');
const WeatherData = require('../models/WeatherData');

/**
 * GET /api/weather/current
 * Fetch current weather from Open-Meteo, enrich with thermal stress, and return.
 * Also stores the data point in MongoDB for historical queries.
 */
const getCurrentWeather = async (req, res, next) => {
  try {
    const weather = await weatherService.fetchCurrentWeather();

    // Store in MongoDB (fire-and-forget — don't block the response)
    WeatherData.create(weather).catch((err) => {
      console.warn('⚠️  Failed to store weather data in MongoDB:', err.message);
    });

    res.json({
      success: true,
      data: weather,
      meta: {
        source: 'open-meteo',
        wbgtIsEstimate: true,
        fetchedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching current weather:', error.message);
    next(error);
  }
};

/**
 * GET /api/weather/forecast
 * 5-day hourly forecast with thermal stress calculations.
 */
const getForecast = async (req, res, next) => {
  try {
    const forecast = await weatherService.fetchForecast();

    res.json({
      success: true,
      data: forecast,
      meta: {
        source: 'open-meteo',
        totalHours: forecast.length,
        wbgtIsEstimate: true,
        fetchedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching forecast:', error.message);
    next(error);
  }
};

/**
 * GET /api/weather/daily
 * 5-day daily summary forecast.
 */
const getDailyForecast = async (req, res, next) => {
  try {
    const daily = await weatherService.fetchDailyForecast();

    res.json({
      success: true,
      data: daily,
      meta: {
        source: 'open-meteo',
        days: daily.length,
        wbgtIsEstimate: true,
        fetchedAt: new Date().toISOString(),
        _note: 'Daily thermal stress uses max temperature and estimated humidity. Actual values may differ.',
      },
    });
  } catch (error) {
    console.error('Error fetching daily forecast:', error.message);
    next(error);
  }
};

/**
 * GET /api/weather/history
 * Return recent weather data stored in MongoDB.
 * Query params: ?limit=48&source=open-meteo
 */
const getWeatherHistory = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 48, 500);
    const source = req.query.source; // optional filter

    const query = {};
    if (source) query.source = source;

    const history = await WeatherData.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: history,
      meta: {
        count: history.length,
        limit,
        source: source || 'all',
      },
    });
  } catch (error) {
    console.error('Error fetching weather history:', error.message);
    next(error);
  }
};

module.exports = {
  getCurrentWeather,
  getForecast,
  getDailyForecast,
  getWeatherHistory,
};
