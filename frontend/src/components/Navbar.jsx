import React from 'react';
import { Bus, Wifi, WifiOff, LogOut, UserCog } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isConnected } = useWebSocket();

  return (
    <header className="h-16 bg-cardBg border-b border-borderMuted px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <div className="bg-safe/10 text-safe p-2 rounded-btn">
          <Bus size={22} strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-wide">BusTrack<span className="text-safe">System</span></h1>
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
