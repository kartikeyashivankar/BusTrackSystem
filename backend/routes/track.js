const express = require('express');
const router = express.Router();
const Bus = require('../models/Bus');

// GET /api/track/:busNumber - Public passenger tracking endpoint (No authentication required)
router.get('/:busNumber', async (req, res) => {
  try {
    const rawNumber = req.params.busNumber.trim();
    // Case-insensitive regex match
    const bus = await Bus.findOne({
      busNumber: { $regex: new RegExp(`^${rawNumber}$`, 'i') }
    });

    if (!bus) {
      return res.status(404).json({ message: 'Bus number not found' });
    }

    const capacity = bus.capacity || 40;
    const currentCount = bus.currentCount || 0;
    const occupancyPercentage = capacity > 0 ? Math.min(100, Math.round((currentCount / capacity) * 100)) : 0;
    const isFull = occupancyPercentage >= 90;
    const seatsAvailable = Math.max(0, capacity - currentCount);

    const stops = bus.stops || [];
    const currentIndex = bus.currentStopIndex || 0;
    const currentStop = stops[currentIndex] || bus.currentStop || 'Departing Station';
    const nextStop = stops[currentIndex + 1] || (bus.routeType === 'loop' && stops.length > 0 ? stops[0] : 'Terminus');

    res.status(200).json({
      busNumber: bus.busNumber,
      capacity,
      currentCount,
      occupancyPercentage,
      isFull,
      seatsAvailable,
      status: bus.status,
      routeType: bus.routeType,
      currentStopIndex: currentIndex,
      currentStop,
      nextStop,
      stops,
      isHardwareConnected: bus.isHardwareConnected,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Public track error:', error);
    res.status(500).json({ message: 'Server error querying passenger track status' });
  }
});

module.exports = router;
