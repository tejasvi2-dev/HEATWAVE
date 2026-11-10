import React from 'react';
import { X, Users, TreePine, Building, AlertCircle, Thermometer, Droplets, Wind } from 'lucide-react';
import { RiskBadge } from './RiskBadge';

export const WardInfoPanel = ({ ward, onClose }) => {
  if (!ward) return null;

  const riskScore = ward.riskScore ?? ward.ward_tsi ?? 50;

  // Risk score bar color
  const getBarColor = (score) => {
    if (score >= 80) return 'bg-red-500';
    if (score >= 65) return 'bg-rose-500';
    if (score >= 50) return 'bg-orange-500';
    if (score >= 35) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="bg-[#111827] border border-gray-700 rounded-xl p-5 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-800">
        <div>
          <h3 className="text-base font-bold text-white">{ward.name || ward.wardName}</h3>
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">PMC Ward Vulnerability Profile</span>
        </div>
        <div className="flex items-center space-x-2">
          <RiskBadge level={ward.riskCategory || 'Moderate'} size="md" />
          {onClose && (
            <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Risk Score Bar */}
      <div className="bg-[#1a2332] p-4 rounded-lg border border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-gray-400 uppercase font-semibold">Composite Risk Index</span>
          <span className="text-xl font-extrabold text-orange-400 font-mono">{riskScore}<span className="text-sm text-gray-500">/100</span></span>
        </div>
        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${getBarColor(riskScore)}`} style={{ width: `${riskScore}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-gray-500">
          <span>Low</span>
          <span>Moderate</span>
          <span>High</span>
          <span>Extreme</span>
        </div>
      </div>

      {/* Microclimate Conditions */}
      {(ward.temperature || ward.heatIndex) && (
        <div className="space-y-2">
          <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center">
            <Thermometer className="w-3.5 h-3.5 mr-1.5 text-orange-400" /> Ward Microclimate
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {ward.temperature && (
              <div className="bg-gray-800/60 p-2.5 rounded-lg text-center">
                <span className="text-[9px] text-gray-400 block">Temperature</span>
                <span className="text-sm font-mono font-bold text-orange-400">{ward.temperature}°C</span>
              </div>
            )}
            {ward.humidity && (
              <div className="bg-gray-800/60 p-2.5 rounded-lg text-center">
                <span className="text-[9px] text-gray-400 block">Humidity</span>
                <span className="text-sm font-mono font-bold text-blue-400">{ward.humidity}%</span>
              </div>
            )}
            {ward.heatIndex && (
              <div className="bg-gray-800/60 p-2.5 rounded-lg text-center">
                <span className="text-[9px] text-gray-400 block">Heat Index</span>
                <span className="text-sm font-mono font-bold text-red-400">{ward.heatIndex}°C</span>
              </div>
            )}
            {ward.wbgtEstimate && (
              <div className="bg-gray-800/60 p-2.5 rounded-lg text-center">
                <span className="text-[9px] text-gray-400 block">WBGT Est.</span>
                <span className="text-sm font-mono font-bold text-amber-400">{ward.wbgtEstimate}°C</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vulnerable Demographics */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center">
          <Users className="w-3.5 h-3.5 mr-1.5 text-blue-400" /> Vulnerability Metrics
        </h4>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-gray-800/50 p-2 rounded-lg">
            <span className="text-gray-500 block text-[9px]">Population</span>
            <span className="font-mono font-bold text-white text-sm">{ward.population ? (ward.population / 1000).toFixed(0) + 'k' : '--'}</span>
          </div>
          <div className="bg-gray-800/50 p-2 rounded-lg">
            <span className="text-gray-500 block text-[9px]">Vuln. Index</span>
            <span className="font-mono font-bold text-orange-400 text-sm">{ward.vulnerabilityIndex ?? ward.vulnerability ?? '--'}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-800/50 p-2 rounded-lg">
            <span className="text-gray-500 block text-[9px]">Elderly 65+</span>
            <span className="font-mono font-bold text-white text-xs">{ward.elderlyPercent ?? '--'}%</span>
          </div>
          <div className="bg-gray-800/50 p-2 rounded-lg">
            <span className="text-gray-500 block text-[9px]">Outdoor Workers</span>
            <span className="font-mono font-bold text-orange-400 text-xs">{ward.outdoorWorkerPercent ?? '--'}%</span>
          </div>
          <div className="bg-gray-800/50 p-2 rounded-lg">
            <span className="text-gray-500 block text-[9px]">Children</span>
            <span className="font-mono font-bold text-white text-xs">{ward.childrenPercent ?? '--'}%</span>
          </div>
        </div>
      </div>

      {/* Environmental */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center">
          <TreePine className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Environmental Modifiers
        </h4>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-gray-800/80">
            <span className="text-gray-400">Tree Canopy & Green Cover</span>
            <div className="flex items-center gap-2">
              <div className="w-16 bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${ward.greenCoverPercent ?? 15}%` }} />
              </div>
              <span className="text-emerald-400 font-mono font-semibold w-8 text-right">{ward.greenCoverPercent ?? '--'}%</span>
            </div>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-gray-800/80">
            <span className="text-gray-400">Avg Infrastructure Age</span>
            <span className="text-gray-200 font-mono font-semibold">{ward.avgBuildingAge ?? '--'} yrs</span>
          </div>
        </div>
      </div>

      {/* Risk Drivers */}
      {ward.factors && ward.factors.length > 0 && (
        <div className="text-xs space-y-1.5">
          <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Key Local Drivers</h4>
          {ward.factors.map((factor, i) => (
            <div key={i} className="flex items-start text-gray-300 gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>{typeof factor === 'string' ? factor : JSON.stringify(factor)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Data source */}
      {ward.isSimulated && (
        <div className="text-[10px] text-gray-600 text-center pt-2 border-t border-gray-800">
          Ward vulnerability profile computed from simulated demographic & land-use parameters
        </div>
      )}
    </div>
  );
};
