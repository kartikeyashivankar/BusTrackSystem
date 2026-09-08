const express = require('express');
const router = express.Router();
const busController = require('../controllers/busController');

// Public passenger view endpoint
router.get('/:busNumber', busController.getBusByNumber);

module.exports = router;
