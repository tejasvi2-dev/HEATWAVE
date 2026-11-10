import React, { useState } from 'react';
import { useWeatherData } from '../hooks/useWeatherData';
import { ThermalStressGauge } from '../components/ThermalStressGauge';
import { HeatIndexBreakdown } from '../components/HeatIndexBreakdown';
import { DemoDataBanner } from '../components/DemoDataBanner';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Thermometer, ShieldAlert, BookOpen, Layers, Sliders } from 'lucide-react';

export default function ThermalStressAnalyzer() {
  const { data: weather, loading, isDemo } = useWeatherData();

  // Interactive sandbox sliders for exploring thermal stress
  const [customTemp, setCustomTemp] = useState(38);
  const [customHumidity, setCustomHumidity] = useState(50);
  const [customWind, setCustomWind] = useState(10);
  const [customSolar, setCustomSolar] = useState(700);

  // Quick interactive thermal formula
  const computeInteractiveStress = (T, RH, W, S) => {
    // Steadman / Rothfusz Heat Index
    const T_F = (T * 9) / 5 + 32;
    const HI_F =
      -42.379 +
      2.04901523 * T_F +
      10.14333127 * RH -
      0.22475541 * T_F * RH -
      0.00683783 * T_F * T_F -
      0.05481717 * RH * RH +
      0.00122874 * T_F * T_F * RH +
      0.00085282 * T_F * RH * RH -
      0.00000199 * T_F * T_F * RH * RH;
    const HI_C = Math.round(((HI_F - 32) * 5) / 9);

    // Stull (2011) wet-bulb
    const Tw =
      T * Math.atan(0.151977 * Math.sqrt(RH + 8.313659)) +
      Math.atan(T + RH) -
      Math.atan(RH - 1.676331) +
      0.00391838 * Math.pow(RH, 1.5) * Math.atan(0.023101 * RH) -
      4.686035;
    const Tg = 1.006 * T + 0.004 * S - 0.3;
    const wbgt = Math.round((0.7 * Tw + 0.2 * Tg + 0.1 * T) * 10) / 10;

    const hiNorm = Math.min(100, Math.max(0, ((HI_C - 25) / 30) * 100));
    const wbgtNorm = Math.min(100, Math.max(0, ((wbgt - 20) / 20) * 100));
    const windBenefit = Math.min(15, (W / 50) * 15);
    const score = Math.min(100, Math.max(0, Math.round(0.45 * hiNorm + 0.40 * wbgtNorm - windBenefit)));

    let cat = 'Low';
    if (score >= 80) cat = 'Extreme';
    else if (score >= 65) cat = 'Very High';
    else if (score >= 50) cat = 'High';
    else if (score >= 35) cat = 'Moderate';

    return { heatIndex: HI_C, wbgt, score, cat };
  };

  const simResult = computeInteractiveStress(customTemp, customHumidity, customWind, customSolar);

  if (loading && !weather) {
    return <LoadingSpinner message="Calculating biometeorological matrices..." />;
  }

  return (
    <div className="space-y-6">
      <DemoDataBanner isDemo={isDemo} />

      {/* Header */}
      <div className="pb-2 border-b border-gray-800">
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
          <Thermometer className="w-6 h-6 text-orange-500" />
          <span>THERMAL STRESS ANALYZER</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Quantitative physiological heat stress modeling combining Rothfusz Heat Index, empirical Liljegren WBGT estimation, and environmental boundary layers.
        </p>
      </div>

      {/* Main Diagnostic Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <ThermalStressGauge
            value={weather?.thermalStressIndex ?? 50}
            riskCategory={weather?.riskCategory ?? 'Moderate'}
            label="Observed Pune Thermal Stress"
            heatIndex={weather?.heatIndex}
            wbgtEstimate={weather?.wbgtEstimate}
          />
        </div>
        <div className="lg:col-span-6">
          <HeatIndexBreakdown
            temperature={weather?.temperature}
            humidity={weather?.humidity}
            solarRadiation={weather?.solarRadiation}
            windSpeed={weather?.windSpeed}
            heatIndex={weather?.heatIndex}
            wbgt={weather?.wbgtEstimate}
          />
        </div>
      </div>

      {/* Interactive Biometeorological Simulation Sandbox */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 pb-4 border-b border-gray-800 mb-6">
          <Sliders className="w-5 h-5 text-orange-400" />
          <div>
            <h2 className="text-base font-bold text-white">Interactive Microclimate Sensitivity Sandbox</h2>
            <p className="text-xs text-gray-400">Simulate how varying atmospheric humidity, temperature, or insolation alters physiological strain.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-gray-300">Dry-Bulb Temperature (°C)</span>
                <span className="text-orange-400 font-mono text-sm">{customTemp}°C</span>
              </div>
              <input
                type="range"
                min="25"
                max="48"
                step="0.5"
                value={customTemp}
                onChange={(e) => setCustomTemp(parseFloat(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-gray-300">Relative Humidity (%)</span>
                <span className="text-blue-400 font-mono text-sm">{customHumidity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="95"
                step="1"
                value={customHumidity}
                onChange={(e) => setCustomHumidity(parseInt(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-gray-300">Direct Solar Radiation (W/m²)</span>
                <span className="text-amber-400 font-mono text-sm">{customSolar} W/m²</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="25"
                value={customSolar}
                onChange={(e) => setCustomSolar(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-gray-300">Wind Velocity (km/h)</span>
                <span className="text-emerald-400 font-mono text-sm">{customWind} km/h</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="1"
                value={customWind}
                onChange={(e) => setCustomWind(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Real-time simulation feedback */}
          <div className="lg:col-span-5 bg-[#1a2332] p-5 rounded-xl border border-gray-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Simulated Physiological Output</span>
              <div className="text-4xl font-extrabold text-white font-mono mt-2 flex items-baseline space-x-2">
                <span>{simResult.score}</span>
                <span className="text-xs font-normal text-gray-400">/ 100 Index</span>
              </div>
              <div className="mt-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  {simResult.cat} Risk Level
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Equivalent Heat Index:</span>
                <span className="font-mono text-white font-bold">{simResult.heatIndex}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Estimated WBGT:</span>
                <span className="font-mono text-white font-bold">{simResult.wbgt}°C</span>
              </div>
              <div className="text-[11px] text-gray-400 mt-2">
                Simulated response indicates {simResult.score >= 65 ? 'critical risk of exertional hyperthermia within 30 minutes.' : 'tolerable conditions under continuous hydration.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reference Methodology Table */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 pb-4 border-b border-gray-800 mb-4">
          <BookOpen className="w-5 h-5 text-orange-400" />
          <h2 className="text-base font-bold text-white">Biometeorological Methodology & Reference Standards</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="text-[11px] uppercase bg-gray-900/80 text-gray-400 border-b border-gray-800">
              <tr>
                <th className="py-2.5 px-3">Metric</th>
                <th className="py-2.5 px-3">Formulation / Source</th>
                <th className="py-2.5 px-3">Measurement Status</th>
                <th className="py-2.5 px-3">Operational Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-sans">
              <tr>
                <td className="py-3 px-3 font-semibold text-white">Heat Index (HI)</td>
                <td className="py-3 px-3">Rothfusz regression (NWS 1990)</td>
                <td className="py-3 px-3 text-emerald-400">Directly Computed</td>
                <td className="py-3 px-3">Shaded apparent temperature for sedentary adults.</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-white">WBGT Estimate</td>
                <td className="py-3 px-3">Liljegren (2008) + Stull (2011) Psychrometric</td>
                <td className="py-3 px-3 text-amber-300 font-semibold">Empirical Estimate</td>
                <td className="py-3 px-3">Occupational limits for outdoor labor and military standards.</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-white">Thermal Stress Score</td>
                <td className="py-3 px-3">Weighted Multi-attribute Index (0-100)</td>
                <td className="py-3 px-3 text-emerald-400">Composite Model</td>
                <td className="py-3 px-3">Integrated urban early warning and ward vulnerability dispatch.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
