import React from 'react';
import { Clock, ShieldAlert, ShieldCheck, Sun } from 'lucide-react';

export const SafeHourTimeline = ({ hours = [] }) => {
  const currentHour = new Date().getHours();

  const getSlotBg = (category) => {
    switch (String(category).toLowerCase()) {
      case 'dangerous':
      case 'avoid':
        return 'bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30';
      case 'caution':
        return 'bg-amber-500/20 border-amber-500 text-amber-300 hover:bg-amber-500/30';
      case 'safe':
      default:
        return 'bg-emerald-500/20 border-emerald-500 text-emerald-400 hover:bg-emerald-500/30';
    }
  };

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-800 gap-2">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-orange-400" />
          <h3 className="text-base font-bold text-white">24-Hour Diurnal Activity Advisory</h3>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5" /> Safe
          </span>
          <span className="flex items-center text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5" /> Caution
          </span>
          <span className="flex items-center text-red-400">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-1.5" /> Danger
          </span>
        </div>
      </div>

      {/* 24-Hour Segment Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
        {hours.map((slot) => {
          const isNow = slot.hour === currentHour;
          return (
            <div
              key={slot.hour}
              className={`border rounded-lg p-2.5 text-center flex flex-col justify-between transition-all relative ${getSlotBg(
                slot.category
              )} ${isNow ? 'ring-2 ring-orange-400 font-bold scale-105 shadow-lg' : ''}`}
            >
              {isNow && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                  NOW
                </span>
              )}
              <span className="text-xs font-mono font-semibold text-gray-200">{slot.label}</span>
              <span className="text-sm font-bold font-mono my-1">{slot.temperature ?? '--'}°</span>
              <span className="text-[10px] uppercase font-bold tracking-wider">{slot.category}</span>
            </div>
          );
        })}
      </div>

      {/* Actionable Rules & Timing Windows */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="bg-[#1a2332] p-3.5 rounded-lg border border-gray-800 space-y-1">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Optimal Work & Exercise</span>
          </div>
          <p className="text-gray-300">
            <strong>05:00 - 08:30 AM</strong> & <strong>07:00 - 10:00 PM</strong>
          </p>
          <p className="text-gray-400 text-[11px]">Best periods for heavy outdoor physical work, sports training, and walking.</p>
        </div>

        <div className="bg-[#1a2332] p-3.5 rounded-lg border border-gray-800 space-y-1">
          <div className="flex items-center space-x-1.5 text-amber-300 font-bold">
            <Sun className="w-4 h-4" />
            <span>Cautionary Window</span>
          </div>
          <p className="text-gray-300">
            <strong>09:00 - 11:00 AM</strong> & <strong>04:30 - 06:30 PM</strong>
          </p>
          <p className="text-gray-400 text-[11px]">Hydration required every 20 mins. Seek shaded pathways during transit.</p>
        </div>

        <div className="bg-[#1a2332] p-3.5 rounded-lg border border-gray-800 space-y-1">
          <div className="flex items-center space-x-1.5 text-red-400 font-bold">
            <ShieldAlert className="w-4 h-4" />
            <span>Hazardous Peak Window</span>
          </div>
          <p className="text-gray-300">
            <strong>11:30 AM - 04:00 PM</strong>
          </p>
          <p className="text-gray-400 text-[11px]">Strict stay-indoors advisory. Outdoor work ceases unless climate-controlled.</p>
        </div>
      </div>
    </div>
  );
};
