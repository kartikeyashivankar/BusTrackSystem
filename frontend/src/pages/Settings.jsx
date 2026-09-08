import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Bell,
  Save,
  Volume2,
  ShieldCheck,
  Activity,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Sliders,
  Radio,
  HardDrive,
  RefreshCw
} from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import api from '../utils/api';

const DEFAULT_SETTINGS = {
  comPort: 'COM3',
  baudRate: '115200',
  fullThreshold: 90,
  warningThreshold: 70,
  alarmVolume: 80,
  defaultCapacity: 50,
  refreshInterval: 5
};

const Settings = () => {
  const { isConnected: isWsConnected } = useWebSocket();

  // Load from localStorage or defaults
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('bustrack_system_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [hardwareStatus, setHardwareStatus] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [testingAlarm, setTestingAlarm] = useState(false);

  // Query hardware and health status
  const fetchDiagnostics = async () => {
    try {
      const [hwRes, healthRes] = await Promise.all([
        api.get('/hardware/status').catch(() => ({ data: { isConnected: false, mode: 'simulation' } })),
        api.get('/health').catch(() => ({ data: { status: 'offline' } }))
      ]);
      setHardwareStatus(hwRes.data);
      setHealthStatus(healthRes.data);
    } catch (err) {
      console.warn('Diagnostics fetch error:', err);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value
    }));
    setSavedSuccess(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      localStorage.setItem('bustrack_system_settings', JSON.stringify(settings));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to persist settings:', err);
    } finally {
      setTimeout(() => setSaving(false), 300);
    }
  };

  const handleResetDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem('bustrack_system_settings', JSON.stringify(DEFAULT_SETTINGS));
    setShowResetModal(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Web Audio API alarm playback test
  const testAlarmTone = () => {
    setTestingAlarm(true);
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const volumeFraction = Math.max(0.01, (settings.alarmVolume / 100) * 0.2);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(volumeFraction, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (err) {
      console.warn('Audio playback error:', err);
    } finally {
      setTimeout(() => setTestingAlarm(false), 450);
    }
  };

  return (
    <div className="max-w-4xl space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Control Center Settings</h2>
          <p className="text-xs text-textSecondary font-mono mt-0.5">
            Hardware Interface, Alarm Calibration & Fleet Telemetry Configurations
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center space-x-2 bg-safe/10 border border-safe/30 text-safe px-3 py-1.5 rounded-btn text-xs font-mono animate-fadeIn">
            <CheckCircle size={14} />
            <span>Settings saved successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: ESP32 Hardware Interface */}
        <div className="bg-cardBg border border-borderMuted rounded-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-borderMuted">
            <div className="flex items-center space-x-2 text-safe">
              <Cpu size={18} strokeWidth={1.5} />
              <h3 className="text-sm font-bold text-white font-mono">ESP32 Hardware Telemetry</h3>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className={`dot ${hardwareStatus?.isConnected ? 'dot-online' : 'dot-offline'}`} />
              <span className="text-textSecondary">
                {hardwareStatus?.isConnected ? 'Hardware Online' : 'Simulation Mode'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-textSecondary mb-1.5">
                Serial Port Designation
              </label>
              <input
                type="text"
                value={settings.comPort}
                onChange={(e) => handleChange('comPort', e.target.value)}
                placeholder="COM3 or /dev/ttyUSB0"
                className="w-full bg-gray-900 border border-borderMuted rounded-btn px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-safe"
              />
              <p className="text-[11px] text-textTertiary mt-1 font-mono">
                Host COM port connected to the ESP32 bidirectional IR receiver.
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-textSecondary mb-1.5">
                Baud Rate Frequency
              </label>
              <select
                value={settings.baudRate}
                onChange={(e) => handleChange('baudRate', e.target.value)}
                className="w-full bg-gray-900 border border-borderMuted rounded-btn px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-safe"
              >
                <option value="9600">9600 Baud</option>
                <option value="19200">19200 Baud</option>
                <option value="57600">57600 Baud</option>
                <option value="115200">115200 Baud (Recommended)</option>
              </select>
              <p className="text-[11px] text-textTertiary mt-1 font-mono">
                Telemetry transmission baud rate specified in ESP32 firmware.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Audio Alarm & Threshold Calibration */}
        <div className="bg-cardBg border border-borderMuted rounded-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-borderMuted">
            <div className="flex items-center space-x-2 text-warning">
              <Bell size={18} strokeWidth={1.5} />
              <h3 className="text-sm font-bold text-white font-mono">Audio Alarms & Crowd Thresholds</h3>
            </div>
            <button
              type="button"
              onClick={testAlarmTone}
              disabled={testingAlarm}
              className="flex items-center space-x-1.5 text-xs font-mono text-warning hover:text-white bg-warning/10 hover:bg-warning/20 border border-warning/30 px-3 py-1.5 rounded-btn transition active:scale-95 disabled:opacity-50"
            >
              <Volume2 size={14} className={testingAlarm ? 'animate-bounce' : ''} />
              <span>{testingAlarm ? 'Playing...' : 'Test Alarm Audio'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-textSecondary mb-1.5">
                Bus Full Threshold (%)
              </label>
              <input
                type="number"
                min="50"
                max="100"
                value={settings.fullThreshold}
                onChange={(e) => handleChange('fullThreshold', parseInt(e.target.value) || 90)}
                className="w-full bg-gray-900 border border-borderMuted rounded-btn px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-danger"
              />
              <p className="text-[11px] text-textTertiary mt-1 font-mono">
                Capacity level that fires the auditory "Bus Full" alarm.
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-textSecondary mb-1.5">
                Warning Threshold (%)
              </label>
              <input
                type="number"
                min="30"
                max="89"
                value={settings.warningThreshold}
                onChange={(e) => handleChange('warningThreshold', parseInt(e.target.value) || 70)}
                className="w-full bg-gray-900 border border-borderMuted rounded-btn px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-warning"
              />
              <p className="text-[11px] text-textTertiary mt-1 font-mono">
                Shifts vehicle status badge from safe green to amber warning.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono uppercase text-textSecondary">
                  Alarm Volume ({settings.alarmVolume}%)
                </label>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.alarmVolume}
                onChange={(e) => handleChange('alarmVolume', parseInt(e.target.value) || 0)}
                className="w-full accent-safe h-2 bg-gray-800 rounded-lg cursor-pointer mt-2"
              />
              <p className="text-[11px] text-textTertiary mt-2 font-mono">
                Controls browser synthesized Web Audio buzzer volume.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Fleet Defaults */}
        <div className="bg-cardBg border border-borderMuted rounded-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center space-x-2 text-safe pb-3 border-b border-borderMuted">
            <Sliders size={18} strokeWidth={1.5} />
            <h3 className="text-sm font-bold text-white font-mono">Transit Fleet Operational Defaults</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-textSecondary mb-1.5">
                Default Bus Capacity
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={settings.defaultCapacity}
                onChange={(e) => handleChange('defaultCapacity', parseInt(e.target.value) || 50)}
                className="w-full bg-gray-900 border border-borderMuted rounded-btn px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-safe"
              />
              <p className="text-[11px] text-textTertiary mt-1 font-mono">
                Standard passenger capacity applied to new fleet vehicles.
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-textSecondary mb-1.5">
                Public Tracker Telemetry Polling (Seconds)
              </label>
              <input
                type="number"
                min="2"
                max="30"
                value={settings.refreshInterval}
                onChange={(e) => handleChange('refreshInterval', parseInt(e.target.value) || 5)}
                className="w-full bg-gray-900 border border-borderMuted rounded-btn px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-safe"
              />
              <p className="text-[11px] text-textTertiary mt-1 font-mono">
                Interval frequency for public passenger view live telemetry refresh.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: System Health & Environment Diagnostics */}
        <div className="bg-cardBg border border-borderMuted rounded-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-borderMuted">
            <div className="flex items-center space-x-2 text-textPrimary">
              <HardDrive size={18} strokeWidth={1.5} className="text-safe" />
              <h3 className="text-sm font-bold text-white font-mono">System Health & Core Services</h3>
            </div>
            <button
              type="button"
              onClick={fetchDiagnostics}
              className="text-textSecondary hover:text-white transition flex items-center space-x-1 text-xs font-mono"
              title="Refresh health diagnostics"
            >
              <RefreshCw size={12} />
              <span>Query Health</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 bg-gray-900 border border-borderMuted/60 rounded-btn space-y-1">
              <span className="text-textTertiary text-[10px] uppercase">API Gateway</span>
              <div className="flex items-center space-x-2">
                <span className="dot dot-online" />
                <span className="text-white font-bold">Node.js Express (Port 5000)</span>
              </div>
            </div>

            <div className="p-3 bg-gray-900 border border-borderMuted/60 rounded-btn space-y-1">
              <span className="text-textTertiary text-[10px] uppercase">WebSocket Stream</span>
              <div className="flex items-center space-x-2">
                <span className={`dot ${isWsConnected ? 'dot-online' : 'dot-danger'}`} />
                <span className="text-white font-bold">{isWsConnected ? 'Active Connection' : 'Offline'}</span>
              </div>
            </div>

            <div className="p-3 bg-gray-900 border border-borderMuted/60 rounded-btn space-y-1">
              <span className="text-textTertiary text-[10px] uppercase">Telemetry Database</span>
              <div className="flex items-center space-x-2">
                <span className="dot dot-online" />
                <span className="text-white font-bold">MongoDB Local (bustrack)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="flex items-center space-x-1.5 text-xs font-mono text-textSecondary hover:text-danger px-3 py-2 rounded-btn transition"
          >
            <RotateCcw size={14} />
            <span>Reset Factory Defaults</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="bg-safe text-darkBg font-bold px-6 py-2.5 rounded-btn text-xs font-mono uppercase tracking-wider hover:bg-safe/90 transition shadow-glowSafe flex items-center space-x-2 active:scale-95 disabled:opacity-50 w-full sm:w-auto justify-center"
          >
            <Save size={16} strokeWidth={2} />
            <span>{saving ? 'Saving...' : 'Save Configurations'}</span>
          </button>
        </div>
      </form>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-cardBg border border-borderMuted p-6 rounded-card max-w-sm w-full space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto">
              <AlertTriangle size={24} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">Reset System Settings?</h3>
              <p className="text-xs text-textSecondary mt-1 leading-relaxed font-mono">
                This will revert all telemetry thresholds, audio volume, and serial port designations to factory default values.
              </p>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white rounded-btn text-xs font-mono py-2.5 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="flex-1 bg-danger hover:bg-danger/90 text-white font-bold rounded-btn text-xs font-mono py-2.5 transition shadow-glowDanger"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
