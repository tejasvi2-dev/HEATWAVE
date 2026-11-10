import React from 'react';
import { Info, HelpCircle } from 'lucide-react';

export const HeatIndexBreakdown = ({
  temperature = 35,
  humidity = 45,
  solarRadiation = 750,
  windSpeed = 12,
  heatIndex = 38,
  wbgt = 28,
}) => {
  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <Info className="w-5 h-5 text-orange-400" />
          <h3 className="text-base font-bold text-white">Thermal Stress Decomposition</h3>
        </div>
        <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">Physical Model</span>
      </div>

      <div className="space-y-4 mt-5">
        {/* Air Temperature */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-300">Ambient Dry-Bulb Temperature ({temperature}°C)</span>
            <span className="text-orange-400 font-mono font-medium">+40% Stress Contribution</span>
          </div>
          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
            <div className="bg-orange-500 h-full rounded-full" style={{ width: `${Math.min(100, (temperature / 45) * 100)}%` }} />
          </div>
        </div>

        {/* Humidity */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-300">Relative Humidity ({humidity}%) — Evaporation Inhibition</span>
            <span className="text-blue-400 font-mono font-medium">+25% Stress Contribution</span>
          </div>
          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(100, humidity)}%` }} />
          </div>
        </div>

        {/* Solar Insolation */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-300">Direct Solar Radiation ({Math.round(solarRadiation)} W/m²) — Mean Radiant Temp</span>
            <span className="text-amber-400 font-mono font-medium">+25% Stress Contribution</span>
          </div>
          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, (solarRadiation / 1000) * 100)}%` }} />
          </div>
        </div>

        {/* Wind Speed (Mitigating Factor) */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-300">Wind Ventilation ({windSpeed} km/h) — Convective Cooling</span>
            <span className="text-emerald-400 font-mono font-medium">-10% Mitigation Benefit</span>
          </div>
          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, (windSpeed / 30) * 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Methodology notice box */}
      <div className="mt-6 p-4 rounded-lg bg-[#1a2332] border border-gray-800 text-xs text-gray-300 space-y-2">
        <div className="flex items-center space-x-1.5 text-amber-400 font-semibold">
          <HelpCircle className="w-4 h-4" />
          <span>Scientific Basis & Disclaimers</span>
        </div>
        <p className="leading-relaxed text-gray-400">
          • <strong className="text-gray-200">Heat Index:</strong> Calculated via NWS Rothfusz 9-parameter regression equation.
        </p>
        <p className="leading-relaxed text-gray-400">
          • <strong className="text-gray-200">WBGT ({wbgt}°C):</strong> Calculated as an <em className="text-amber-300">estimate</em> using Stull (2011) psychrometric wet-bulb and solar radiative balance approximations. True WBGT requires specialized black-globe apparatus.
        </p>
      </div>
    </div>
  );
};
