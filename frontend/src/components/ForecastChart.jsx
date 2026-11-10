import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export const ForecastChart = ({ data = [] }) => {
  const [metric, setMetric] = useState('all');

  // Format data points for readable time labels
  const chartData = data.slice(0, 40).map((item) => {
    const d = item.timestamp ? new Date(item.timestamp) : new Date();
    const timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dayLabel = d.toLocaleDateString([], { weekday: 'short' });
    return {
      name: `${dayLabel} ${timeLabel}`,
      temperature: item.temperature ?? 0,
      heatIndex: item.heatIndex ?? item.temperature ?? 0,
      thermalStress: item.thermalStressIndex ?? 0,
      humidity: item.humidity ?? 0,
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0a0f1e] border border-gray-700 p-3 rounded-lg shadow-xl text-xs space-y-1">
          <p className="font-semibold text-gray-200 border-b border-gray-800 pb-1">{label}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex justify-between items-center space-x-4">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="font-mono font-bold text-white">
                {entry.value} {entry.name.includes('Stress') ? 'pts' : '°C'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-800 gap-2 mb-4">
        <div>
          <h3 className="text-base font-bold text-white">5-Day Thermal Trajectory & Heat Stress</h3>
          <p className="text-xs text-gray-400">Hourly resolution from Open-Meteo biometeorology</p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setMetric('all')}
            className={`px-2.5 py-1 rounded transition-colors ${
              metric === 'all' ? 'bg-orange-600 text-white font-semibold' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All Curves
          </button>
          <button
            onClick={() => setMetric('stress')}
            className={`px-2.5 py-1 rounded transition-colors ${
              metric === 'stress' ? 'bg-orange-600 text-white font-semibold' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Thermal Stress Only
          </button>
        </div>
      </div>

      <div className="h-72 w-full">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            No forecast points available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} interval={4} />
              <YAxis stroke="#6b7280" fontSize={10} tickLine={false} domain={[15, 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

              {/* Thermal stress risk shading */}
              <Area
                type="monotone"
                dataKey="thermalStress"
                name="Thermal Stress Score"
                fill="#ea580c"
                fillOpacity={0.15}
                stroke="#f97316"
                strokeWidth={2}
              />

              {metric === 'all' && (
                <>
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    name="Air Temp (°C)"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="heatIndex"
                    name="Heat Index (°C)"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
