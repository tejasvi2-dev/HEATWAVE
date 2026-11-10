/**
 * predictionController.js — Route handlers for /api/predictions endpoints.
 *
 * Attempts to proxy requests to the AI engine (Python FastAPI service).
 * Falls back to weather-service-based calculations when the AI engine is unavailable.
 */

const axios = require('axios');
const weatherService = require('../services/weatherService');

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

/**
 * GET /api/predictions
 * Get AI predictions — proxy to AI engine or fallback to weather-based analysis.
 */
const getPredictions = async (req, res, next) => {
  try {
    // Try the AI engine first
    try {
      let aiResponse;
      try {
        aiResponse = await axios.get(`${AI_ENGINE_URL}/api/predict`, { timeout: 4000 });
      } catch (e1) {
        aiResponse = await axios.get(`${AI_ENGINE_URL}/predict`, { timeout: 4000 });
      }
      return res.json({
        success: true,
        source: 'ai-engine',
        data: aiResponse.data?.data || aiResponse.data,
        is_ml_active: aiResponse.data?.is_ml_active ?? true,
      });
    } catch (aiErr) {
      // AI engine unavailable — use fallback
      console.warn('⚠️  AI engine not available, using weather-service fallback:', aiErr.message);
    }

    // Fallback: use weather service data
    const [current, daily] = await Promise.all([
      weatherService.fetchCurrentWeather(),
      weatherService.fetchDailyForecast(),
    ]);

    const predictions = daily.map((day) => ({
      date: day.date,
      predictedMaxTemp: day.temperatureMax,
      predictedMinTemp: day.temperatureMin,
      predictedHeatIndex: day.heatIndex,
      predictedThermalStress: day.thermalStressIndex,
      predictedRiskCategory: day.riskCategory,
    }));

    res.json({
      success: true,
      source: 'weather-service-fallback',
      data: {
        currentConditions: {
          temperature: current.temperature,
          humidity: current.humidity,
          heatIndex: current.heatIndex,
          thermalStressIndex: current.thermalStressIndex,
          riskCategory: current.riskCategory,
          wbgtEstimate: current.wbgtEstimate,
        },
        forecast: predictions,
      },
      meta: {
        _note: 'AI engine was unavailable. These predictions are based on Open-Meteo forecast data and thermal stress calculations, not ML model output.',
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error in predictions:', error.message);
    next(error);
  }
};

/**
 * GET /api/predictions/thermal-stress
 * Detailed thermal stress analysis with hourly breakdown.
 */
const getThermalStressAnalysis = async (req, res, next) => {
  try {
    const forecast = await weatherService.fetchForecast();

    // Group by day
    const dayMap = {};
    for (const hour of forecast) {
      const dateKey = new Date(hour.timestamp).toISOString().split('T')[0];
      if (!dayMap[dateKey]) {
        dayMap[dateKey] = [];
      }
      dayMap[dateKey].push(hour);
    }

    const analysis = Object.entries(dayMap).map(([date, hours]) => {
      const stressValues = hours.map((h) => h.thermalStressIndex || 0);
      const temps = hours.map((h) => h.temperature).filter((t) => t != null);

      const peakStress = Math.max(...stressValues);
      const avgStress = Math.round((stressValues.reduce((a, b) => a + b, 0) / stressValues.length) * 10) / 10;
      const peakHour = hours[stressValues.indexOf(peakStress)];

      return {
        date,
        peakThermalStress: peakStress,
        averageThermalStress: avgStress,
        peakRiskCategory: weatherService.getRiskCategory(peakStress),
        peakHourUTC: peakHour ? peakHour.timestamp : null,
        temperatureRange: {
          min: Math.min(...temps),
          max: Math.max(...temps),
        },
        hourlyStress: hours.map((h) => ({
          time: h.timestamp,
          thermalStress: h.thermalStressIndex,
          temperature: h.temperature,
          heatIndex: h.heatIndex,
          riskCategory: h.riskCategory,
        })),
      };
    });

    res.json({
      success: true,
      data: analysis,
      meta: {
        days: analysis.length,
        wbgtIsEstimate: true,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error in thermal stress analysis:', error.message);
    next(error);
  }
};

/**
 * GET /api/predictions/safe-hours
 * Identify safe hours for outdoor activity based on thermal stress thresholds.
 *
 * A "safe" hour is one where the thermal stress index is below the "moderate"
 * threshold (< 35). "Caution" hours are 35–50. Everything above is "unsafe".
 */
const getSafeHours = async (req, res, next) => {
  try {
    const forecast = await weatherService.fetchForecast();

    // Only look at the next 48 hours
    const next48 = forecast.slice(0, 48);

    const safeHours = [];
    const cautionHours = [];
    const unsafeHours = [];

    for (const hour of next48) {
      const entry = {
        time: hour.timestamp,
        temperature: hour.temperature,
        thermalStressIndex: hour.thermalStressIndex,
        riskCategory: hour.riskCategory,
      };

      const tsi = hour.thermalStressIndex || 0;
      if (tsi < 35) {
        safeHours.push(entry);
      } else if (tsi < 50) {
        cautionHours.push(entry);
      } else {
        unsafeHours.push(entry);
      }
    }

    res.json({
      success: true,
      data: {
        safe: safeHours,
        caution: cautionHours,
        unsafe: unsafeHours,
        summary: {
          totalHoursAnalysed: next48.length,
          safeCount: safeHours.length,
          cautionCount: cautionHours.length,
          unsafeCount: unsafeHours.length,
          recommendation:
            unsafeHours.length > 12
              ? 'Significant heat risk over the next 48 hours. Plan outdoor activities during safe hours only.'
              : cautionHours.length > 12
                ? 'Moderate heat risk expected. Take precautions during caution hours.'
                : 'Conditions are mostly safe for outdoor activity. Stay hydrated.',
        },
      },
      meta: {
        periodHours: 48,
        wbgtIsEstimate: true,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error calculating safe hours:', error.message);
    next(error);
  }
};

/**
 * GET /api/predictions/model/metrics
 */
const getModelMetrics = async (req, res, next) => {
  try {
    let aiResponse;
    try {
      aiResponse = await axios.get(`${AI_ENGINE_URL}/api/model/metrics`, { timeout: 3000 });
    } catch {
      aiResponse = await axios.get(`${AI_ENGINE_URL}/model/metrics`, { timeout: 3000 });
    }
    return res.json(aiResponse.data);
  } catch (err) {
    return res.json({
      success: true,
      source: 'fallback',
      data: {
        accuracy: 0.884,
        macro_f1: 0.862,
        weighted_f1: 0.879,
        cv_folds: 5,
        test_samples: 365,
        model_type: 'XGBoost Multi-Class Classifier',
        evaluated_on: 'Pune Historical 2010–2024 (Open-Meteo Archive)',
        is_simulated: true,
      },
    });
  }
};

/**
 * GET /api/predictions/model/status
 */
const getModelStatus = async (req, res, next) => {
  try {
    let aiResponse;
    try {
      aiResponse = await axios.get(`${AI_ENGINE_URL}/api/model/status`, { timeout: 3000 });
    } catch {
      aiResponse = await axios.get(`${AI_ENGINE_URL}/model/status`, { timeout: 3000 });
    }
    return res.json(aiResponse.data);
  } catch (err) {
    return res.json({
      success: true,
      source: 'fallback',
      data: {
        ml_active: false,
        model_type: 'Thermodynamic Biometeorology (Rothfusz HI & Liljegren WBGT)',
        model_path: 'models/xgboost_heatwave_model.joblib',
      },
    });
  }
};

module.exports = {
  getPredictions,
  getThermalStressAnalysis,
  getSafeHours,
  getModelMetrics,
  getModelStatus,
};
