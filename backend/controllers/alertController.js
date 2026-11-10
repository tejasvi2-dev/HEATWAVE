/**
 * alertController.js — Route handlers for /api/alerts endpoints.
 */

const mongoose = require('mongoose');
const Alert = require('../models/Alert');
const weatherService = require('../services/weatherService');
const alertService = require('../services/alertService');

// In-memory alert store for when MongoDB is not connected
let inMemoryAlerts = [];

/**
 * Helper to check if MongoDB is connected and ready
 */
const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * GET /api/alerts
 * Return all active, non-expired alerts.
 */
const getActiveAlerts = async (req, res, next) => {
  try {
    const now = new Date();

    if (isMongoConnected()) {
      let alerts = await Alert.find({
        isActive: true,
        $or: [
          { expiresAt: { $gte: now } },
          { expiresAt: null },
        ],
      })
        .sort({ createdAt: -1 })
        .lean();

      // If DB has no active alerts yet, generate dynamically from live weather
      if (alerts.length === 0) {
        try {
          const weather = await weatherService.fetchCurrentWeather();
          alerts = await alertService.generateAndSaveAlerts(weather, {
            isSimulated: Boolean(weather?.isSimulated),
          });
        } catch (genErr) {
          console.warn('Could not auto-generate initial alerts in DB:', genErr.message);
        }
      }

      return res.json({
        success: true,
        data: alerts,
        meta: {
          count: alerts.length,
          storage: 'mongodb',
          queriedAt: now.toISOString(),
        },
      });
    }

    // Fallback: MongoDB not connected (in-memory mode)
    let activeAlerts = inMemoryAlerts.filter(
      (a) => a.isActive && (!a.expiresAt || new Date(a.expiresAt) >= now)
    );

    if (activeAlerts.length === 0) {
      try {
        const weather = await weatherService.fetchCurrentWeather();
        activeAlerts = alertService.generateAlerts(weather, {
          isSimulated: Boolean(weather?.isSimulated),
        });
        inMemoryAlerts = [...activeAlerts];
      } catch (genErr) {
        console.warn('Could not generate in-memory alerts:', genErr.message);
      }
    }

    res.json({
      success: true,
      data: activeAlerts,
      meta: {
        count: activeAlerts.length,
        storage: 'in-memory',
        mongoConnected: false,
        queriedAt: now.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching alerts:', error.message);
    next(error);
  }
};

/**
 * GET /api/alerts/generate
 * Fetch current weather, generate alerts based on thermal stress, and save to DB or memory.
 */
const generateAlerts = async (req, res, next) => {
  try {
    const weather = await weatherService.fetchCurrentWeather();
    let alerts = [];

    if (isMongoConnected()) {
      alerts = await alertService.generateAndSaveAlerts(weather, {
        isSimulated: Boolean(weather?.isSimulated),
      });
    } else {
      alerts = alertService.generateAlerts(weather, {
        isSimulated: Boolean(weather?.isSimulated),
      });
      // Replace active in-memory alerts
      inMemoryAlerts = alerts.map((a, idx) => ({ ...a, _id: `mem_alert_${Date.now()}_${idx}` }));
    }

    res.json({
      success: true,
      data: {
        alerts,
        weather: {
          temperature: weather.temperature,
          heatIndex: weather.heatIndex,
          thermalStressIndex: weather.thermalStressIndex,
          riskCategory: weather.riskCategory,
          source: weather.source,
        },
      },
      meta: {
        generatedAt: new Date().toISOString(),
        alertCount: alerts.length,
        storage: isMongoConnected() ? 'mongodb' : 'in-memory',
      },
    });
  } catch (error) {
    console.error('Error generating alerts:', error.message);
    next(error);
  }
};

/**
 * POST /api/alerts
 * Create a manual alert (admin endpoint).
 * Body: { type, severity, title, description, affectedWards, recommendations, expiresAt }
 */
const createManualAlert = async (req, res, next) => {
  try {
    const {
      type,
      severity,
      title,
      description,
      affectedWards,
      recommendations,
      expiresAt,
    } = req.body;

    if (!type || !severity || !title) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'type, severity, and title are required fields.',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    const alertData = {
      type,
      severity,
      title,
      description,
      affectedWards: affectedWards || [],
      recommendations: recommendations || [],
      isActive: true,
      isSimulated: false,
      createdAt: new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    if (isMongoConnected()) {
      const alert = await Alert.create(alertData);
      return res.status(201).json({
        success: true,
        data: alert,
      });
    }

    // In-memory creation
    const memAlert = {
      _id: `mem_alert_${Date.now()}`,
      ...alertData,
    };
    inMemoryAlerts.unshift(memAlert);

    res.status(201).json({
      success: true,
      data: memAlert,
      meta: { storage: 'in-memory' },
    });
  } catch (error) {
    console.error('Error creating manual alert:', error.message);
    next(error);
  }
};

module.exports = {
  getActiveAlerts,
  generateAlerts,
  createManualAlert,
};
