const Trip = require('../models/Trip');

// GET /api/trips - Return all trips
exports.getAllTrips = async (req, res) => {
  try {
    const { busNumber, startDate, endDate } = req.query;
    const query = {};

    if (busNumber) {
      query.busNumber = busNumber;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const trips = await Trip.find(query).sort({ date: -1 });
    res.status(200).json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ message: 'Failed to fetch trips' });
  }
};

// GET /api/trips/:busNumber - Return trips for a specific bus
exports.getTripsByBus = async (req, res) => {
  try {
    const trips = await Trip.find({ busNumber: req.params.busNumber }).sort({ date: -1 });
    res.status(200).json(trips);
  } catch (error) {
    console.error('Error fetching trips for bus:', error);
    res.status(500).json({ message: 'Failed to fetch trips for bus' });
  }
};

// POST /api/trips - Create new trip record
exports.createTrip = async (req, res) => {
  try {
    const newTrip = await Trip.create(req.body);
    res.status(201).json(newTrip);
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(400).json({ message: error.message || 'Failed to create trip' });
  }
};
