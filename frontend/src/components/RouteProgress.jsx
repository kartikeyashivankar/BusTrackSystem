import React from 'react';

const RouteProgress = ({ stops = [], currentStopIndex = 0 }) => {
  if (!stops || stops.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto py-2">
      <div className="flex items-center min-w-max space-x-2">
        {stops.map((stop, index) => {
          const isPast = index < currentStopIndex;
          const isCurrent = index === currentStopIndex;
          const isFuture = index > currentStopIndex;

          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono transition-all ${
                    isCurrent
                      ? 'bg-white text-black ring-4 ring-safe/40 scale-110'
                      : isPast
                      ? 'bg-safe text-black'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {isCurrent ? '◆' : isPast ? '●' : '○'}
                </div>
                <span
                  className={`text-[11px] mt-1 truncate max-w-[70px] ${
                    isCurrent
                      ? 'text-white font-semibold'
                      : isPast
                      ? 'text-safe'
                      : 'text-gray-500'
                  }`}
                  title={stop}
                >
                  {stop}
                </span>
                {isCurrent && (
                  <span className="text-[9px] text-safe uppercase font-mono tracking-wider">
                    Current
                  </span>
                )}
              </div>
              {index < stops.length - 1 && (
                <div
                  className={`h-0.5 flex-1 min-w-[24px] mb-4 ${
                    index < currentStopIndex ? 'bg-safe' : 'bg-gray-700'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default RouteProgress;
