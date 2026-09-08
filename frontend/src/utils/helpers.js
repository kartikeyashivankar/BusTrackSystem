// Helpers for BusTrackSystem

export const getStatusType = (currentCount, capacity, isHardwareConnected) => {
  if (!isHardwareConnected) return 'offline';
  const ratio = capacity > 0 ? (currentCount / capacity) : 0;
  if (ratio >= 0.9) return 'danger';
  if (ratio >= 0.7) return 'warning';
  return 'online';
};

export const formatTime = (dateString) => {
  if (!dateString) return '--:--';
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
