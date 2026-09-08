const Trip = require('../models/Trip');

// GET /api/trips - Return all trips with optional filtering and pagination
exports.getAllTrips = async (req, res) => {
  try {
    const { busNumber, startDate, endDate, page = 1, limit = 10 } = req.query;
    const query = {};

    if (busNumber && busNumber !== 'ALL') {
      query.busNumber = busNumber;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const totalTrips = await Trip.countDocuments(query);
    const trips = await Trip.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(totalTrips / limitNum) || 1;

    res.status(200).json({
      trips,
      pagination: {
        total: totalTrips,
        page: pageNum,
        limit: limitNum,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ message: 'Failed to fetch trips' });
  }
};

// GET /api/trips/:busNumber - Return trips for a specific bus
exports.getTripsByBus = async (req, res) => {
  try {
    const trips = await Trip.find({ busNumber: req.params.busNumber }).sort({ date: -1, createdAt: -1 });
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
