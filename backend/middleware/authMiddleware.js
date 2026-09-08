const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bustrack_jwt_secret_key_2026_secure');
      req.user = decoded;
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: Admin only' });
};

const conductorOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'conductor' || req.user.role === 'admin')) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: Conductor only' });
};

// Conductor specific middleware — can only access / update their own assigned bus
const checkBusAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  // Admins can manage any bus
  if (req.user.role === 'admin') {
    return next();
  }

  // Conductors can only update their assigned bus
  if (req.user.role === 'conductor') {
    const requestedBus = req.params.busNumber;
    if (req.user.assignedBus && req.user.assignedBus === requestedBus) {
      return next();
    }
    return res.status(403).json({
      message: `Access denied: Conductor is only authorized to operate assigned bus ${req.user.assignedBus || 'none'}`
    });
  }

  return res.status(403).json({ message: 'Forbidden' });
};

module.exports = {
  protect,
  adminOnly,
  conductorOnly,
  checkBusAccess
};
