import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { RiskBadge } from './RiskBadge';

export const AlertCard = ({ alert }) => {
  const [expanded, setExpanded] = useState(false);
  if (!alert) return null;

  const getBorderColor = () => {
    switch (String(alert.severity).toLowerCase()) {
      case 'extreme': return 'border-l-red-600 bg-red-950/10';
      case 'very-high':
      case 'very high': return 'border-l-rose-500 bg-rose-950/10';
      case 'high': return 'border-l-orange-500 bg-orange-950/10';
      case 'moderate': return 'border-l-amber-500 bg-amber-950/10';
      default: return 'border-l-emerald-500 bg-emerald-950/10';
    }
  };

  return (
    <div className={`border border-gray-800 border-l-4 ${getBorderColor()} rounded-xl p-5 shadow-lg transition-all`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-base font-bold text-white">{alert.title}</h4>
              {alert.isSimulated && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold">
                  SIMULATED
                </span>
              )}
            </div>
            <p className="text-xs text-gray-300 mt-1">{alert.description}</p>
          </div>
        </div>
        <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
          <RiskBadge level={alert.severity || 'High'} size="sm" />
          <span className="text-[11px] text-gray-400 mt-1 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {alert.issuedAt ? new Date(alert.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'}
          </span>
        </div>
      </div>

      {alert.affectedWards && alert.affectedWards.length > 0 && (
        <div className="mt-3 flex items-center flex-wrap gap-1.5 text-xs">
          <span className="text-gray-400 flex items-center mr-1">
            <MapPin className="w-3 h-3 mr-1 text-gray-400" /> Affected Wards:
          </span>
          {alert.affectedWards.map((ward, i) => (
            <span key={i} className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-[11px]">
              {ward}
            </span>
          ))}
        </div>
      )}

      {alert.recommendations && alert.recommendations.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-800/60">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center text-xs font-semibold text-orange-400 hover:text-orange-300 focus:outline-none"
          >
            <span>{expanded ? 'Hide Safety Actions' : `View ${alert.recommendations.length} Safety Actions`}</span>
            {expanded ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
          </button>

          {expanded && (
            <ul className="mt-3 space-y-2 text-xs text-gray-300 pl-1">
              {alert.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
