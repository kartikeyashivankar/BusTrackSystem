import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Trash2, Save, Repeat, Users, Navigation } from 'lucide-react';

const RouteEditor = () => {
  const { busNumber = 'MH-40-AA-1111' } = useParams();
  const [stops, setStops] = useState(['Manewada', 'TPoint', 'Ganeshpeth', 'Burdi', 'Besa']);
  const [newStop, setNewStop] = useState('');
  const [capacity, setCapacity] = useState(45);
  const [routeType, setRouteType] = useState('loop');

  const handleAddStop = (e) => {
    e.preventDefault();
    if (!newStop.trim()) return;
    setStops([...stops, newStop.trim()]);
    setNewStop('');
  };

  const handleRemoveStop = (index) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide">Route & Fleet Configuration</h2>
        <p className="text-xs text-textSecondary font-mono">Bus: {busNumber}</p>
      </div>

      <div className="bg-cardBg border border-borderMuted rounded-card p-6 space-y-6">
        {/* Capacity and Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-textSecondary mb-1.5 flex items-center space-x-2">
              <Users size={14} />
              <span>Passenger Capacity</span>
            </label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full bg-gray-900 border border-borderMuted rounded-btn px-3 py-2 text-sm text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-textSecondary mb-1.5 flex items-center space-x-2">
              <Repeat size={14} />
              <span>Route Mode</span>
            </label>
            <select
              value={routeType}
              onChange={(e) => setRouteType(e.target.value)}
              className="w-full bg-gray-900 border border-borderMuted rounded-btn px-3 py-2 text-sm text-white font-mono"
            >
              <option value="loop">Continuous Loop</option>
              <option value="oneway">One-Way Line</option>
            </select>
          </div>
        </div>

        {/* Add stop form */}
        <div>
          <label className="block text-xs font-mono uppercase text-textSecondary mb-1.5">
            Add New Stop
          </label>
          <form onSubmit={handleAddStop} className="flex gap-2">
            <input
              type="text"
              value={newStop}
              onChange={(e) => setNewStop(e.target.value)}
              placeholder="e.g. Chatrapati Square"
              className="flex-1 bg-gray-900 border border-borderMuted rounded-btn px-3 py-2 text-sm text-white"
            />
            <button
              type="submit"
              className="bg-safe/20 text-safe border border-safe/30 px-4 py-2 rounded-btn text-xs font-mono flex items-center space-x-1 hover:bg-safe/30 transition"
            >
              <Plus size={16} strokeWidth={1.5} />
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* Stops List */}
        <div>
          <h3 className="text-xs font-mono uppercase text-textSecondary mb-3">Active Stops Sequence</h3>
          <div className="space-y-2">
            {stops.map((stop, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-900 border border-borderMuted rounded-btn"
              >
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-xs text-textTertiary w-6">#{idx + 1}</span>
                  <span className="text-sm font-medium text-white">{stop}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveStop(idx)}
                  className="text-textSecondary hover:text-danger p-1 rounded transition"
                  title="Remove Stop"
                >
                  <Trash2 size={16} strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-borderMuted flex justify-end">
          <button
            type="button"
            className="bg-safe text-darkBg font-semibold px-6 py-2.5 rounded-btn text-sm flex items-center space-x-2 hover:bg-safe/90 transition"
          >
            <Save size={16} strokeWidth={1.5} />
            <span>Save Route Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouteEditor;
