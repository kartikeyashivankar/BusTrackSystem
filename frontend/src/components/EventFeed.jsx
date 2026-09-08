import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const EventFeed = ({ events = [] }) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-6 text-textTertiary text-sm">
        No recent sensor events recorded
      </div>
    );
  }

  return (
    <div className="divide-y divide-borderMuted max-h-64 overflow-y-auto pr-1">
      {events.map((event, idx) => (
        <div key={idx} className="flex items-center justify-between py-2.5 text-xs">
          <div className="flex items-center space-x-2">
            {event.type === 'ENTRY' ? (
              <div className="p-1 rounded bg-safe/10 text-safe">
                <ArrowUp size={16} strokeWidth={1.5} />
              </div>
            ) : (
              <div className="p-1 rounded bg-danger/10 text-danger">
                <ArrowDown size={16} strokeWidth={1.5} />
              </div>
            )}
            <span className="text-textPrimary font-medium">
              {event.type === 'ENTRY' ? 'Passenger Entered' : 'Passenger Exited'}
            </span>
          </div>
          <span className="font-mono text-textSecondary text-[11px]">
            {event.time || new Date().toLocaleTimeString()}
          </span>
        </div>
      ))}
    </div>
  );
};

export default EventFeed;
