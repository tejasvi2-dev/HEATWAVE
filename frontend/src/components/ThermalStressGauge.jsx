import React from 'react';
import { RiskBadge } from './RiskBadge';

export const ThermalStressGauge = ({
  value = 50,
  label = 'Human Thermal Stress Score',
  riskCategory = 'High',
  heatIndex,
  wbgtEstimate,
}) => {
  const clampedValue = Math.min(100, Math.max(0, Number(value) || 0));

  // Semicircle gauge metrics
  const radius = 80;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  const getColor = () => {
    if (clampedValue >= 80) return '#dc2626'; // Extreme red
    if (clampedValue >= 65) return '#f43f5e'; // Very high rose
    if (clampedValue >= 50) return '#f97316'; // High orange
    if (clampedValue >= 35) return '#f59e0b'; // Moderate amber
    return '#10b981'; // Low emerald
  };

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 shadow-xl flex flex-col items-center justify-between relative overflow-hidden">
      <div className="w-full flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">{label}</h3>
          <span className="text-xs text-gray-400">Scale: 0 (Benign) to 100 (Severe Hyperthermia)</span>
        </div>
        <RiskBadge level={riskCategory} size="md" />
      </div>

      {/* SVG Semicircle gauge */}
      <div className="relative flex flex-col items-center justify-center my-2">
        <svg width="220" height="130" className="overflow-visible">
          {/* Background Arc */}
          <path
            d="M 20 120 A 80 80 0 0 1 200 120"
            fill="none"
            stroke="#1f2937"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Active Colored Arc */}
          <path
            d="M 20 120 A 80 80 0 0 1 200 120"
            fill="none"
            stroke={getColor()}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center reading */}
        <div className="absolute bottom-2 flex flex-col items-center">
          <span className="text-4xl font-extrabold text-white font-mono">{Math.round(clampedValue)}</span>
          <span className="text-xs uppercase tracking-widest text-gray-400">Index Score</span>
        </div>
      </div>

      {/* Risk Range Reference */}
      <div className="w-full grid grid-cols-5 gap-1 mt-4 text-[10px] text-center font-medium">
        <div className="bg-emerald-950/40 text-emerald-400 py-1 rounded border border-emerald-800/40">
          <div>Low</div>
          <div className="text-gray-400">&lt;35</div>
        </div>
        <div className="bg-amber-950/40 text-amber-300 py-1 rounded border border-amber-800/40">
          <div>Mod</div>
          <div className="text-gray-400">35-50</div>
        </div>
        <div className="bg-orange-950/40 text-orange-400 py-1 rounded border border-orange-800/40">
          <div>High</div>
          <div className="text-gray-400">50-65</div>
        </div>
        <div className="bg-rose-950/40 text-rose-300 py-1 rounded border border-rose-800/40">
          <div>V.High</div>
          <div className="text-gray-400">65-80</div>
        </div>
        <div className="bg-red-950/50 text-red-400 py-1 rounded border border-red-800/50">
          <div>Extr</div>
          <div className="text-gray-400">&gt;80</div>
        </div>
      </div>

      {/* Secondary Biometeorological Metrics */}
      {(heatIndex !== undefined || wbgtEstimate !== undefined) && (
        <div className="w-full grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-gray-800 text-xs">
          <div className="bg-[#1a2332] p-2.5 rounded-lg border border-gray-800">
            <div className="text-gray-400">Heat Index (Rothfusz)</div>
            <div className="text-lg font-bold text-white font-mono">{heatIndex ?? '--'}°C</div>
          </div>
          <div className="bg-[#1a2332] p-2.5 rounded-lg border border-gray-800">
            <div className="flex items-center justify-between text-gray-400">
              <span>WBGT</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 rounded">ESTIMATED</span>
            </div>
            <div className="text-lg font-bold text-white font-mono">{wbgtEstimate ?? '--'}°C</div>
          </div>
        </div>
      )}
    </div>
  );
};
