const express = require('express');
const router = express.Router();
const coolingCenterController = require('../controllers/coolingCenterController');

router.get('/', coolingCenterController.getAllCoolingCenters);
router.get('/nearest', coolingCenterController.getNearestCoolingCenters);

module.exports = router;
