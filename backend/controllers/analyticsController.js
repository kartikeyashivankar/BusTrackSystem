// Analytics Controller Skeleton
exports.getOverview = async (req, res) => {
  res.status(200).json({ totalTripsToday: 0, totalPassengersToday: 0, mostCrowdedBus: null });
};

exports.getBusiestHours = async (req, res) => {
  res.status(200).json([]);
};

exports.getBusAnalytics = async (req, res) => {
  res.status(200).json({});
};
