import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const DemoDataBanner = ({ isDemo = false }) => {
  const [dismissed, setDismissed] = useState(false);

  if (!isDemo || dismissed) return null;

  return (
    <div className="bg-amber-950/40 border border-amber-500/40 px-4 py-2.5 rounded-lg flex items-center justify-between text-xs text-amber-200 mb-6 shadow-md">
      <div className="flex items-center space-x-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong className="font-semibold text-amber-300">DEMO MODE ACTIVE:</strong> Serving calibrated fallback simulation data for Pune. Start the Express backend on port 5000 to stream live Open-Meteo telemetry.
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 rounded text-amber-400 hover:text-amber-200 hover:bg-amber-900/40 transition"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
