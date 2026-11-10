import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, MapPin, RefreshCw, Bell, AlertTriangle } from 'lucide-react';
import { useWeatherData } from '../hooks/useWeatherData';

export const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: weather, refetch, loading } = useWeatherData();

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-gray-100 flex flex-col lg:flex-row font-sans antialiased">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-[#0a0f1e]/90 backdrop-blur border-b border-gray-800 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-xs">
              <span className="flex items-center text-gray-300 font-semibold bg-gray-900 border border-gray-800 px-2.5 py-1 rounded-md">
                <MapPin className="w-3.5 h-3.5 mr-1 text-orange-400" />
                Pune, MH (18.52° N, 73.85° E)
              </span>
              <span className="hidden md:inline-block text-gray-400">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {weather && (
              <div className="hidden sm:flex items-center space-x-2 text-xs bg-gray-900 border border-gray-800 px-3 py-1 rounded-lg">
                <span className="text-gray-400">Current Temp:</span>
                <span className="font-mono font-bold text-orange-400">{weather.temperature ?? '--'}°C</span>
                <span className="text-gray-400">|</span>
                <span className="text-gray-400">Heat Index:</span>
                <span className="font-mono font-bold text-red-400">{weather.heatIndex ?? '--'}°C</span>
              </div>
            )}

            <button
              onClick={() => refetch()}
              disabled={loading}
              title="Refresh weather data"
              className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-400' : ''}`} />
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Platform Footer */}
        <footer className="border-t border-gray-800/60 bg-[#0a0f1e] py-6 px-4 sm:px-8 text-center text-xs text-gray-400">
          <p>
            HEATGUARD AI • Built for Climate-Resilient Urban Pune • Integrates Open-Meteo API & NWS Biometeorology
          </p>
        </footer>
      </div>
    </div>
  );
};
