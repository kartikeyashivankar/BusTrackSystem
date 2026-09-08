const Bus = require('../models/Bus');
const { broadcast } = require('../websocket');

// GET /api/buses - Return all buses
exports.getAllBuses = async (req, res) => {
  try {
    const buses = await Bus.find().sort({ busNumber: 1 });
    res.status(200).json(buses);
  } catch (error) {
    console.error('Error fetching buses:', error);
    res.status(500).json({ message: 'Failed to fetch buses' });
  }
};

// GET /api/buses/:busNumber - Return single bus by busNumber
exports.getBusByNumber = async (req, res) => {
  try {
    const bus = await Bus.findOne({ busNumber: req.params.busNumber });
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    res.status(200).json(bus);
  } catch (error) {
    console.error('Error fetching bus:', error);
    res.status(500).json({ message: 'Failed to fetch bus details' });
  }
};

// POST /api/buses - Create a new bus (Admin only)
exports.createBus = async (req, res) => {
  try {
    const newBus = await Bus.create(req.body);
    broadcast({ type: 'BUS_CREATED', data: newBus });
    res.status(201).json(newBus);
  } catch (error) {
    console.error('Error creating bus:', error);
    res.status(400).json({ message: error.message || 'Failed to create bus' });
  }
};

// PUT /api/buses/:busNumber - Update bus fields
exports.updateBus = async (req, res) => {
  try {
    const updatedBus = await Bus.findOneAndUpdate(
      { busNumber: req.params.busNumber },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedBus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    broadcast({ type: 'BUS_UPDATE', data: updatedBus });
    res.status(200).json(updatedBus);
  } catch (error) {
    console.error('Error updating bus:', error);
    res.status(400).json({ message: error.message || 'Failed to update bus' });
  }
};

// DELETE /api/buses/:busNumber - Delete a bus (Admin only)
exports.deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findOneAndDelete({ busNumber: req.params.busNumber });
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    broadcast({ type: 'BUS_DELETED', data: { busNumber: req.params.busNumber } });
    res.status(200).json({ message: 'Bus removed successfully' });
  } catch (error) {
    console.error('Error deleting bus:', error);
    res.status(500).json({ message: 'Failed to delete bus' });
  }
};

// PUT /api/buses/:busNumber/stop - Update current stop
exports.updateStop = async (req, res) => {
  try {
    const { stopIndex, stopName } = req.body;
    const bus = await Bus.findOne({ busNumber: req.params.busNumber });
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    if (stopIndex !== undefined) bus.currentStopIndex = stopIndex;
    if (stopName) bus.currentStop = stopName;
    else if (stopIndex !== undefined && bus.stops && bus.stops[stopIndex]) {
      bus.currentStop = bus.stops[stopIndex];
    }

    await bus.save();
    broadcast({ type: 'BUS_UPDATE', data: bus });
    res.status(200).json(bus);
  } catch (error) {
    console.error('Error updating stop:', error);
    res.status(400).json({ message: error.message || 'Failed to update stop' });
  }
};

// PUT /api/buses/:busNumber/loop - Complete loop and reset
exports.completeLoop = async (req, res) => {
  try {
    const bus = await Bus.findOne({ busNumber: req.params.busNumber });
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    bus.loopCount += 1;
    bus.currentStopIndex = bus.startingStopIndex || 0;
    bus.currentStop = bus.stops?.[bus.currentStopIndex] || '';
    bus.currentCount = 0; // Reset passenger count on new loop

    await bus.save();
    broadcast({ type: 'BUS_UPDATE', data: bus });
    res.status(200).json(bus);
  } catch (error) {
    console.error('Error completing loop:', error);
    res.status(400).json({ message: error.message || 'Failed to complete loop' });
  }
};

// PUT /api/buses/:busNumber/route - Update route configuration (Admin only)
exports.updateRoute = async (req, res) => {
  try {
    const { stops, routeType, capacity, startingStopIndex } = req.body;
    const bus = await Bus.findOne({ busNumber: req.params.busNumber });
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    if (stops) bus.stops = stops;
    if (routeType) bus.routeType = routeType;
    if (capacity) bus.capacity = capacity;
    if (startingStopIndex !== undefined) bus.startingStopIndex = startingStopIndex;

    await bus.save();
    broadcast({ type: 'BUS_UPDATE', data: bus });
    res.status(200).json(bus);
  } catch (error) {
    console.error('Error updating route:', error);
    res.status(400).json({ message: error.message || 'Failed to update route' });
  }
};
