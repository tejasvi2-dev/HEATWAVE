import React, { useState } from 'react';
import { AlertCard } from './AlertCard';
import { BellOff, Filter } from 'lucide-react';

export const AlertList = ({ alerts = [] }) => {
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const filtered = alerts.filter((alert) => {
    if (filterSeverity === 'ALL') return true;
    return String(alert.severity).toUpperCase() === filterSeverity;
  });

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-800">
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <Filter className="w-4 h-4" />
          <span>Filter by Severity:</span>
        </div>
        <div className="flex space-x-1 text-xs">
          {['ALL', 'EXTREME', 'HIGH', 'MODERATE'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterSeverity === sev
                  ? 'bg-orange-600 text-white font-semibold'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-8 text-center text-gray-400">
          <BellOff className="w-10 h-10 mx-auto mb-2 text-gray-500" />
          <h4 className="text-sm font-semibold text-gray-300">No Active Heat Alerts</h4>
          <p className="text-xs mt-1">There are currently no alerts matching this severity filter.</p>
        </div>
      ) : (
        filtered.map((alert, idx) => <AlertCard key={alert.id || idx} alert={alert} />)
      )}
    </div>
  );
};
