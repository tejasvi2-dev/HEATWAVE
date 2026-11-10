import React from 'react';

export const RiskBadge = ({ level = 'Low', size = 'md' }) => {
  const normLevel = String(level).trim();

  const getStyle = () => {
    switch (normLevel.toLowerCase()) {
      case 'extreme':
        return 'bg-red-600/20 text-red-400 border-red-500/60 animate-pulse';
      case 'very high':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'moderate':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'low':
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  const getSize = () => {
    switch (size) {
      case 'sm': return 'text-xs px-2 py-0.5';
      case 'lg': return 'text-sm px-3.5 py-1.5 font-bold';
      default: return 'text-xs px-2.5 py-1 font-semibold';
    }
  };

  return (
    <span className={`inline-flex items-center rounded-full border ${getStyle()} ${getSize()} uppercase tracking-wider`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      {normLevel}
    </span>
  );
};
