import React from 'react';
import { CloudSun, Wind, Droplets, SunMedium, Compass } from 'lucide-react';
import { RiskBadge } from './RiskBadge';

export const WeatherCard = ({ weather }) => {
  if (!weather) return null;

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-36 h-36 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-800 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Pune, Maharashtra</h2>
            <span className="text-xs text-gray-400 px-2 py-0.5 rounded bg-gray-800">18.52° N, 73.85° E</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Observed via Open-Meteo • {weather.timestamp ? new Date(weather.timestamp).toLocaleTimeString() : 'Live'}
          </p>
        </div>
        <RiskBadge level={weather.riskCategory || 'Moderate'} size="lg" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="flex items-center space-x-3 bg-[#1a2332] p-3.5 rounded-lg border border-gray-800/80">
          <div className="p-2.5 rounded-md bg-orange-500/10 text-orange-400">
            <CloudSun className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase">Air Temp</div>
            <div className="text-2xl font-bold text-white font-mono">{weather.temperature ?? '--'}°C</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-[#1a2332] p-3.5 rounded-lg border border-gray-800/80">
          <div className="p-2.5 rounded-md bg-blue-500/10 text-blue-400">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase">Humidity</div>
            <div className="text-2xl font-bold text-white font-mono">{weather.humidity ?? '--'}%</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-[#1a2332] p-3.5 rounded-lg border border-gray-800/80">
          <div className="p-2.5 rounded-md bg-emerald-500/10 text-emerald-400">
            <Wind className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase">Wind Speed</div>
            <div className="text-2xl font-bold text-white font-mono">{weather.windSpeed ?? '--'} <span className="text-sm font-normal text-gray-400">km/h</span></div>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-[#1a2332] p-3.5 rounded-lg border border-gray-800/80">
          <div className="p-2.5 rounded-md bg-amber-500/10 text-amber-400">
            <SunMedium className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase">Solar Radiation</div>
            <div className="text-2xl font-bold text-white font-mono">{weather.solarRadiation ? Math.round(weather.solarRadiation) : '--'} <span className="text-sm font-normal text-gray-400">W/m²</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
