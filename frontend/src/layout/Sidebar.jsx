import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Flame,
  Thermometer,
  Map,
  Brain,
  Bell,
  Clock,
  Building2,
  Activity,
  X,
  Zap,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Command Center', icon: LayoutDashboard, end: true },
  { path: '/thermal-stress', label: 'Thermal Stress Analyzer', icon: Thermometer },
  { path: '/ward-map', label: 'Ward Heat Risk Map', icon: Map },
  { path: '/predictions', label: 'AI Heat Prediction', icon: Brain },
  { path: '/alerts', label: 'Smart Alerts', icon: Bell },
  { path: '/safe-hours', label: 'Heat-Safe Time Advisory', icon: Clock },
  { path: '/cooling-centers', label: 'Cooling Centers', icon: Building2 },
];

export const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#060a16] border-r border-gray-800/80 z-50 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-gray-800/80">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-600/30 to-red-600/20 text-orange-500 border border-orange-500/30 shadow-lg shadow-orange-500/10">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-white text-sm tracking-tight block">HEATGUARD AI</span>
                <span className="text-[9px] text-gray-500 block font-medium tracking-widest uppercase">Pune Early Warning System</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-md text-gray-400 hover:text-white lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-3 space-y-0.5 mt-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-[12px] font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-600/15 to-orange-600/5 text-orange-400 border border-orange-500/30 shadow-sm shadow-orange-500/5'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40 border border-transparent'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800/60 bg-[#060a16]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 flex items-center">
              <Activity className="w-3 h-3 text-emerald-400 mr-1.5 animate-pulse" />
              <span className="text-gray-400">System Status</span>
            </span>
            <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-md font-mono font-semibold">
              ONLINE
            </span>
          </div>
          <div className="text-[9px] text-gray-600 mt-2 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Open-Meteo v1.0 • Pune Urban Biometeorology
          </div>
        </div>
      </aside>
    </>
  );
};
