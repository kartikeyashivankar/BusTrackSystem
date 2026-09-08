const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, tripController.getAllTrips);
router.get('/:busNumber', protect, tripController.getTripsByBus);
router.post('/', protect, tripController.createTrip);

module.exports = router;
