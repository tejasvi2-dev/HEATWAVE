import React from 'react';
import { Calendar, Sun, CloudSun, ArrowUp, ArrowDown } from 'lucide-react';
import { RiskBadge } from './RiskBadge';

export const DailyForecastCards = ({ days = [] }) => {
  if (!days || days.length === 0) return null;

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 shadow-xl">
      <div className="flex items-center space-x-2 pb-4 border-b border-gray-800 mb-4">
        <Calendar className="w-5 h-5 text-orange-400" />
        <h3 className="text-base font-bold text-white">5-Day Heat-Health Outlook</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {days.map((day, idx) => {
          const dateStr = day.date ? new Date(day.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) : `Day ${idx + 1}`;
          const isToday = idx === 0;

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                isToday
                  ? 'bg-[#1a2332] border-orange-500/60 shadow-lg shadow-orange-950/20'
                  : 'bg-[#111827] border-gray-800 hover:border-gray-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isToday ? 'text-orange-400' : 'text-gray-400'}`}>
                    {isToday ? 'Today' : day.dayName || dateStr.split(',')[0]}
                  </span>
                  <RiskBadge level={day.riskCategory || 'Moderate'} size="sm" />
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">{dateStr}</div>

                <div className="flex items-center space-x-2 my-4">
                  {day.tempMax >= 38 ? (
                    <Sun className="w-8 h-8 text-orange-400 animate-pulse" />
                  ) : (
                    <CloudSun className="w-8 h-8 text-amber-400" />
                  )}
                  <div>
                    <div className="text-2xl font-extrabold text-white font-mono">
                      {day.tempMax ?? day.temperatureMax ?? '--'}°
                    </div>
                    <div className="text-[11px] text-gray-400">High</div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-800/80 space-y-1.5 text-xs text-gray-400">
                <div className="flex justify-between items-center">
                  <span className="flex items-center text-blue-400">
                    <ArrowDown className="w-3 h-3 mr-1" /> Low:
                  </span>
                  <span className="font-mono text-gray-200">{day.tempMin ?? day.temperatureMin ?? '--'}°C</span>
                </div>
                {day.thermalStressIndex !== undefined && (
                  <div className="flex justify-between items-center">
                    <span>Stress Score:</span>
                    <span className="font-mono font-bold text-orange-400">{Math.round(day.thermalStressIndex)}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
