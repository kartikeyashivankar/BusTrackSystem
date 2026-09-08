import React from 'react';
import { BarChart2, TrendingUp, Users, Clock } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const mockHourData = [
  { hour: '08:00', passengers: 120 },
  { hour: '10:00', passengers: 210 },
  { hour: '12:00', passengers: 150 },
  { hour: '14:00', passengers: 180 },
  { hour: '16:00', passengers: 290 },
  { hour: '18:00', passengers: 340 },
  { hour: '20:00', passengers: 160 },
];

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide">Ridership Analytics</h2>
        <p className="text-xs text-textSecondary font-mono">Fleet Utilization and Peak Demand Insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-cardBg border border-borderMuted rounded-card p-4 flex items-center space-x-3">
          <TrendingUp className="text-safe" size={24} strokeWidth={1.5} />
          <div>
            <p className="text-[10px] text-textSecondary uppercase font-mono">Daily Volume</p>
            <p className="font-mono text-xl font-bold text-white">1,450</p>
          </div>
        </div>

        <div className="bg-cardBg border border-borderMuted rounded-card p-4 flex items-center space-x-3">
          <Clock className="text-warning" size={24} strokeWidth={1.5} />
          <div>
            <p className="text-[10px] text-textSecondary uppercase font-mono">Peak Period</p>
            <p className="font-mono text-xl font-bold text-white">17:00 - 19:00</p>
          </div>
        </div>

        <div className="bg-cardBg border border-borderMuted rounded-card p-4 flex items-center space-x-3">
          <Users className="text-safe" size={24} strokeWidth={1.5} />
          <div>
            <p className="text-[10px] text-textSecondary uppercase font-mono">Avg Fleet Occupancy</p>
            <p className="font-mono text-xl font-bold text-white">68%</p>
          </div>
        </div>
      </div>

      <div className="bg-cardBg border border-borderMuted rounded-card p-6">
        <h3 className="text-xs font-mono uppercase text-textSecondary mb-4">Passenger Flow by Time of Day</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockHourData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hour" stroke="#9ca3af" fontSize={11} />
              <YAxis stroke="#9ca3af" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
              />
              <Bar dataKey="passengers" fill="#00f5a0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
