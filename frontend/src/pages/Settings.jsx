import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Bell, Cpu, Shield } from 'lucide-react';

const Settings = () => {
  const [comPort, setComPort] = useState('COM3');
  const [baudRate, setBaudRate] = useState('115200');
  const [fullThreshold, setFullThreshold] = useState('90');

  const handleSave = (e) => {
    e.preventDefault();
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide">System Settings</h2>
        <p className="text-xs text-textSecondary font-mono">Hardware Telemetry & Global Fleet Configurations</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Hardware Settings */}
        <div className="bg-cardBg border border-borderMuted rounded-card p-6 space-y-4">
          <div className="flex items-center space-x-2 text-safe pb-2 border-b border-borderMuted">
            <Cpu size={18} strokeWidth={1.5} />
            <h3 className="text-sm font-semibold text-white">ESP32 Hardware Interface</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-textSecondary mb-1">
                Serial COM Port
              </label>
              <input
                type="text"
                value={comPort}
                onChange={(e) => setComPort(e.target.value)}
                className="w-full bg-gray-900 border border-borderMuted rounded-btn px-3 py-2 text-sm text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-textSecondary mb-1">
                Baud Rate
              </label>
              <input
                type="text"
                value={baudRate}
                onChange={(e) => setBaudRate(e.target.value)}
                className="w-full bg-gray-900 border border-borderMuted rounded-btn px-3 py-2 text-sm text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Alert Thresholds */}
        <div className="bg-cardBg border border-borderMuted rounded-card p-6 space-y-4">
          <div className="flex items-center space-x-2 text-warning pb-2 border-b border-borderMuted">
            <Bell size={18} strokeWidth={1.5} />
            <h3 className="text-sm font-semibold text-white">Alert Trigger Thresholds</h3>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-textSecondary mb-1">
              "Bus Full" Alarm Threshold (%)
            </label>
            <input
              type="number"
              value={fullThreshold}
              onChange={(e) => setFullThreshold(e.target.value)}
              className="w-full sm:w-1/2 bg-gray-900 border border-borderMuted rounded-btn px-3 py-2 text-sm text-white font-mono"
            />
            <p className="text-[11px] text-textTertiary mt-1 font-mono">
              Browser audio alarm triggers when bus capacity reaches or exceeds this percentage.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-safe text-darkBg font-semibold px-6 py-2.5 rounded-btn text-sm flex items-center space-x-2 hover:bg-safe/90 transition"
          >
            <Save size={16} strokeWidth={1.5} />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
