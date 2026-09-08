import React from 'react';

const PassengerGauge = ({ currentCount = 0, capacity = 40 }) => {
  const percentage = capacity > 0 ? Math.min(100, Math.round((currentCount / capacity) * 100)) : 0;
  const radius = 70;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let strokeColor = '#00f5a0';
  if (percentage >= 90) {
    strokeColor = '#ff4d6d';
  } else if (percentage >= 70) {
    strokeColor = '#fbbf24';
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle
            stroke="rgba(255, 255, 255, 0.1)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={strokeColor}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="font-mono text-3xl font-bold text-white">{currentCount}</span>
          <span className="text-[11px] text-textSecondary font-mono">/ {capacity}</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <span className="font-mono text-sm font-semibold text-white">{percentage}% Occupancy</span>
      </div>
    </div>
  );
};

export default PassengerGauge;
