import React from 'react';
import { Wifi, WifiOff, LogOut, UserCog, Bell, BellOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isConnected, isMuted, toggleMute } = useWebSocket();

  return (
    <header className="h-16 bg-cardBg border-b border-borderMuted px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <img src="/logo.svg" alt="BusTrack System" className="h-10 w-10 rounded-lg object-contain" />
        <div className="hidden sm:block border-l border-borderMuted pl-3">
          <p className="text-[10px] text-textSecondary uppercase tracking-widest font-mono">Control Center</p>
        </div>
      </div>

      <div className="flex items-center space-x-5">
        {/* Real-time connection indicator */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          {isConnected ? (
            <>
              <Wifi size={16} className="text-safe" strokeWidth={1.5} />
              <span className="text-safe hidden sm:inline">LIVE</span>
            </>
          ) : (
            <>
              <WifiOff size={16} className="text-danger" strokeWidth={1.5} />
              <span className="text-danger hidden sm:inline">DISCONNECTED</span>
            </>
          )}
        </div>

        {/* Alarm audio toggle */}
        <button
          onClick={toggleMute}
          title={isMuted ? 'Unmute Full Alarm' : 'Mute Full Alarm'}
          className={`p-1.5 rounded transition ${
            isMuted ? 'text-textTertiary hover:text-white hover:bg-gray-800' : 'text-safe hover:bg-safe/10'
          }`}
        >
          {isMuted ? <BellOff size={18} strokeWidth={1.5} /> : <Bell size={18} strokeWidth={1.5} />}
        </button>

        {/* User profile & logout */}
        {user && (
          <div className="flex items-center space-x-3 pl-4 border-l border-borderMuted">
            <div className="flex items-center space-x-2 text-sm text-textSecondary">
              <UserCog size={18} strokeWidth={1.5} className="text-white" />
              <span className="text-white font-medium hidden md:inline">{user.name || user.email}</span>
              <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-gray-800 text-safe">
                {user.role}
              </span>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="text-textSecondary hover:text-danger p-1.5 rounded hover:bg-gray-800 transition"
            >
              <LogOut size={18} strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
