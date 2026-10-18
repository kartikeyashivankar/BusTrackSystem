const express = require('express');
const router = express.Router();
const { SerialPort } = require('serialport');
const { processHardwareMessage, getHardwareStatus, setHardwareStatus, setTargetBus, sendHardwareReset } = require('../serialHandler');

// GET /api/hardware/status - Get current hardware connection status & available ports
router.get('/status', async (req, res) => {
  try {
    const ports = await SerialPort.list();
    const status = getHardwareStatus();
    res.status(200).json({
      ...status,
      availablePorts: ports.map(p => ({ path: p.path, manufacturer: p.manufacturer }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/hardware/target - Switch the active monitored bus for hardware telemetry
router.post('/target', async (req, res) => {
  try {
    const { busNumber } = req.body;
    if (!busNumber) {
      return res.status(400).json({ message: 'busNumber is required' });
    }
    const updatedBus = await setTargetBus(busNumber);
    if (!updatedBus) {
      return res.status(404).json({ message: `Bus ${busNumber} not found` });
    }
    res.status(200).json({
      message: `Active hardware monitoring switched to ${busNumber}`,
      targetBus: busNumber,
      isConnected: getHardwareStatus().isConnected,
      bus: updatedBus
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/hardware/simulate - Trigger hardware sensor event (IR1->IR2 ENTRY, IR2->IR1 EXIT, RESET)
router.post('/simulate', async (req, res) => {
  try {
    const { event = 'ENTRY', busNumber = 'MH-40-AA-1111' } = req.body;
    const result = await processHardwareMessage(`${event}:${busNumber}`);
    if (!result) {
      return res.status(400).json({ message: 'Failed to process simulated hardware event' });
    }
    res.status(200).json({
      message: `Simulated ${event} event processed successfully`,
      data: result.bus
    });
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({ message: 'Simulation failed' });
  }
});

module.exports = router;
