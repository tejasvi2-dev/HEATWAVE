/**
 * wardController.js — Route handlers for /api/wards endpoints.
 */

const wardService = require('../services/wardService');
const weatherService = require('../services/weatherService');

/**
 * GET /api/wards
 * Return all Pune wards with their current risk levels.
 * Fetches live weather to calculate thermal stress, then applies ward vulnerability factors.
 */
const getAllWards = async (req, res, next) => {
  try {
    // Fetch current weather to get city-wide thermal stress
    let thermalStressIndex = 0;
    let weatherMeta = {};

    try {
      const weather = await weatherService.fetchCurrentWeather();
      thermalStressIndex = weather.thermalStressIndex || 0;
      weatherMeta = {
        temperature: weather.temperature,
        humidity: weather.humidity,
        heatIndex: weather.heatIndex,
        thermalStressIndex: weather.thermalStressIndex,
        riskCategory: weather.riskCategory,
      };
    } catch (weatherErr) {
      console.warn('⚠️  Could not fetch live weather for ward risk calculation:', weatherErr.message);
      console.warn('   Using default thermalStressIndex = 0');
    }

    const wards = wardService.calculateAllWardRisks(thermalStressIndex, weatherMeta);

    res.json({
      success: true,
      data: wards,
      meta: {
        wardCount: wards.length,
        cityWeather: weatherMeta,
        calculatedAt: new Date().toISOString(),
        _note: 'Ward risk scores combine city-wide thermal stress with local vulnerability factors. Ward boundaries (polygons) are not included — see wardService.js for details.',
      },
    });
  } catch (error) {
    console.error('Error fetching wards:', error.message);
    next(error);
  }
};

/**
 * GET /api/wards/:name
 * Return a specific ward's details and current risk level.
 */
const getWardByName = async (req, res, next) => {
  try {
    const { name } = req.params;
    const ward = wardService.getWardByName(name);

    if (!ward) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Ward "${name}" not found. Use GET /api/wards to list all available wards.`,
          code: 'NOT_FOUND',
        },
      });
    }

    // Fetch weather for risk calculation
    let thermalStressIndex = 0;
    let weatherMeta = {};
    try {
      const weather = await weatherService.fetchCurrentWeather();
      thermalStressIndex = weather.thermalStressIndex || 0;
      weatherMeta = {
        temperature: weather.temperature,
        humidity: weather.humidity,
        heatIndex: weather.heatIndex,
        thermalStressIndex: weather.thermalStressIndex,
        riskCategory: weather.riskCategory,
        wbgtEstimate: weather.wbgtEstimate,
      };
    } catch (weatherErr) {
      console.warn('⚠️  Could not fetch live weather:', weatherErr.message);
    }

    const riskData = wardService.calculateWardRisk(thermalStressIndex, ward, weatherMeta);

    res.json({
      success: true,
      data: riskData,
      meta: {
        thermalStressIndex,
        calculatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching ward:', error.message);
    next(error);
  }
};

module.exports = {
  getAllWards,
  getWardByName,
};
