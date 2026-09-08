const express = require('express');
const router = express.Router();
const busController = require('../controllers/busController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', busController.getAllBuses);
router.post('/', protect, adminOnly, busController.createBus);
router.get('/:busNumber', busController.getBusByNumber);
router.put('/:busNumber', protect, busController.updateBus);
router.delete('/:busNumber', protect, adminOnly, busController.deleteBus);
router.put('/:busNumber/stop', protect, busController.updateStop);
router.put('/:busNumber/loop', protect, busController.completeLoop);
router.put('/:busNumber/route', protect, adminOnly, busController.updateRoute);

module.exports = router;
