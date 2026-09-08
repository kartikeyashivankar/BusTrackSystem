import React, { useState } from 'react';
import { History, Calendar, Bus as BusIcon } from 'lucide-react';

const TripHistory = () => {
  const [trips] = useState([]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide">Trip Records & History</h2>
        <p className="text-xs text-textSecondary font-mono">Loop Completion and Passenger Audit Log</p>
      </div>

      {trips.length === 0 ? (
        <div className="bg-cardBg border border-borderMuted rounded-card p-12 text-center">
          <History size={36} className="mx-auto text-textTertiary mb-3" strokeWidth={1.5} />
          <h3 className="text-sm font-medium text-white mb-1">No trips recorded yet</h3>
          <p className="text-xs text-textSecondary">Completed route loops will appear here automatically.</p>
        </div>
      ) : (
        <div className="bg-cardBg border border-borderMuted rounded-card overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-900 border-b border-borderMuted text-textSecondary font-mono uppercase">
              <tr>
                <th className="p-3">Bus</th>
                <th className="p-3">Date</th>
                <th className="p-3">Loops</th>
                <th className="p-3">Total Boarded</th>
                <th className="p-3">Peak Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderMuted">
              {trips.map((trip, idx) => (
                <tr key={idx} className="hover:bg-gray-800/40">
                  <td className="p-3 font-mono font-bold text-white">{trip.busNumber}</td>
                  <td className="p-3 text-textSecondary">{new Date(trip.date).toLocaleDateString()}</td>
                  <td className="p-3 font-mono text-white">{trip.loopsCompleted}</td>
                  <td className="p-3 font-mono text-safe">+{trip.totalBoarded}</td>
                  <td className="p-3 font-mono text-warning">{trip.peakCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TripHistory;
