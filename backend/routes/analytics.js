const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/overview', protect, adminOnly, analyticsController.getOverview);
router.get('/busiest-hours', protect, adminOnly, analyticsController.getBusiestHours);
router.get('/:busNumber', protect, adminOnly, analyticsController.getBusAnalytics);

module.exports = router;
