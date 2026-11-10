/**
 * coolingCenterController.js — Route handlers for /api/cooling-centers endpoints.
 */

const coolingCenterService = require('../services/coolingCenterService');

/**
 * GET /api/cooling-centers
 * Return all active cooling centres.
 */
const getAllCoolingCenters = async (req, res, next) => {
  try {
    const activeOnly = req.query.active !== 'false';
    const centers = coolingCenterService.getAllCoolingCenters({ activeOnly });

    res.json({
      success: true,
      data: centers,
      meta: {
        count: centers.length,
        _note: 'Occupancy data is SIMULATED unless isOccupancyVerified is true.',
      },
    });
  } catch (error) {
    console.error('Error fetching cooling centers:', error.message);
    next(error);
  }
};

/**
 * GET /api/cooling-centers/nearest?lat=&lng=&limit=
 * Find nearest cooling centres to a given location.
 */
const getNearestCoolingCenters = async (req, res, next) => {
  try {
    const { lat, lng, limit } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'lat and lng query parameters are required. Example: ?lat=18.52&lng=73.85',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'lat and lng must be valid numbers.',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    const maxResults = Math.min(parseInt(limit) || 5, 20);
    const nearest = coolingCenterService.getNearestCoolingCenters(parsedLat, parsedLng, maxResults);

    res.json({
      success: true,
      data: nearest,
      meta: {
        userLocation: { lat: parsedLat, lng: parsedLng },
        count: nearest.length,
        _note: 'Occupancy data is SIMULATED unless isOccupancyVerified is true. Distances are approximate (Haversine).',
      },
    });
  } catch (error) {
    console.error('Error finding nearest cooling centers:', error.message);
    next(error);
  }
};

module.exports = {
  getAllCoolingCenters,
  getNearestCoolingCenters,
};
