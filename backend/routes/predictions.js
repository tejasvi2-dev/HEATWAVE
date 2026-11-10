const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');

router.get('/', predictionController.getPredictions);
router.get('/thermal-stress', predictionController.getThermalStressAnalysis);
router.get('/safe-hours', predictionController.getSafeHours);
router.get('/model/metrics', predictionController.getModelMetrics);
router.get('/model/status', predictionController.getModelStatus);

module.exports = router;
