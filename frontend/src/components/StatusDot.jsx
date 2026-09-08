import React from 'react';

const StatusDot = ({ status = 'online' }) => {
  const dotClass = `dot dot-${status}`;
  return <span className={dotClass} aria-label={`Status: ${status}`} />;
};

export default StatusDot;
