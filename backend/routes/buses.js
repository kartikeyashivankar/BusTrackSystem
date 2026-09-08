const express = require('express');
const router = express.Router();
const busController = require('../controllers/busController');
const { protect, adminOnly, checkBusAccess } = require('../middleware/authMiddleware');

// Public or Protected Read
router.get('/', busController.getAllBuses);
router.get('/:busNumber', busController.getBusByNumber);

// Admin Only Fleet Controls
router.post('/', protect, adminOnly, busController.createBus);
router.delete('/:busNumber', protect, adminOnly, busController.deleteBus);
router.put('/:busNumber/route', protect, adminOnly, busController.updateRoute);
router.put('/:busNumber', protect, adminOnly, busController.updateBus);

// Conductor / Assigned Bus Operations
router.put('/:busNumber/stop', protect, checkBusAccess, busController.updateStop);
router.put('/:busNumber/loop', protect, checkBusAccess, busController.completeLoop);
router.put('/:busNumber/reset', protect, checkBusAccess, busController.resetCount);

module.exports = router;
