import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  trendValue,
  accentColor = 'orange',
  subtitle,
}) => {
  const getAccentBorder = () => {
    switch (accentColor) {
      case 'red': return 'border-red-500/40 hover:border-red-500';
      case 'amber': return 'border-amber-500/40 hover:border-amber-500';
      case 'green': return 'border-emerald-500/40 hover:border-emerald-500';
      case 'blue': return 'border-blue-500/40 hover:border-blue-500';
      default: return 'border-orange-500/40 hover:border-orange-500';
    }
  };

  const getIconBg = () => {
    switch (accentColor) {
      case 'red': return 'bg-red-500/10 text-red-400';
      case 'amber': return 'bg-amber-500/10 text-amber-400';
      case 'green': return 'bg-emerald-500/10 text-emerald-400';
      case 'blue': return 'bg-blue-500/10 text-blue-400';
      default: return 'bg-orange-500/10 text-orange-400';
    }
  };

  return (
    <div className={`bg-[#111827] border ${getAccentBorder()} rounded-xl p-5 shadow-lg transition-all duration-200 flex flex-col justify-between`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-lg ${getIconBg()}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline space-x-2">
        <span className="text-3xl font-extrabold text-white tracking-tight font-mono">{value ?? '--'}</span>
        {unit && <span className="text-sm font-medium text-gray-400">{unit}</span>}
      </div>

      {(trendValue || subtitle) && (
        <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-gray-800">
          {subtitle && <span className="text-gray-400">{subtitle}</span>}
          {trendValue && (
            <div className={`flex items-center space-x-1 font-medium ${
              trend === 'up' ? 'text-red-400' : trend === 'down' ? 'text-emerald-400' : 'text-gray-400'
            }`}>
              {trend === 'up' && <ArrowUp className="w-3.5 h-3.5" />}
              {trend === 'down' && <ArrowDown className="w-3.5 h-3.5" />}
              {trend === 'neutral' && <Minus className="w-3.5 h-3.5" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
