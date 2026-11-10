const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');

router.get('/', alertController.getActiveAlerts);
router.get('/generate', alertController.generateAlerts);
router.post('/', alertController.createManualAlert);

module.exports = router;
