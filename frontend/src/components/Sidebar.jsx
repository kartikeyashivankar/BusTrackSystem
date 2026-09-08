import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, History, BarChart2, Settings, Navigation } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Trip History', path: '/history', icon: History },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Public Tracker', path: '/track', icon: Navigation }
  ];

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-cardBg border-r border-borderMuted p-4 min-h-[calc(100vh-4rem)]">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-btn text-sm font-medium transition ${
                    isActive
                      ? 'bg-safe/10 text-safe border-l-2 border-safe'
                      : 'text-textSecondary hover:bg-gray-800/60 hover:text-white'
                  }`
                }
              >
                <Icon size={18} strokeWidth={1.5} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-cardBg border-t border-borderMuted flex items-center justify-around px-2 z-40">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 text-[11px] font-medium transition ${
                  isActive ? 'text-safe' : 'text-textSecondary'
                }`
              }
            >
              <Icon size={18} strokeWidth={1.5} />
              <span className="mt-1">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};

export default Sidebar;
