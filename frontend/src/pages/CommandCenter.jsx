import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useWeatherData } from '../hooks/useWeatherData';
import { useForecast } from '../hooks/useForecast';
import { alertAPI } from '../services/api';
import { StatCard } from '../components/StatCard';
import { WeatherCard } from '../components/WeatherCard';
import { ThermalStressGauge } from '../components/ThermalStressGauge';
import { ForecastChart } from '../components/ForecastChart';
import { DailyForecastCards } from '../components/DailyForecastCards';
import { AlertList } from '../components/AlertList';
import { DemoDataBanner } from '../components/DemoDataBanner';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorDisplay } from '../components/ErrorDisplay';
import {
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Bell,
  AlertOctagon,
  Map,
  Building2,
  ShieldAlert,
  ArrowRight,
  Activity,
} from 'lucide-react';

export default function CommandCenter() {
  const { data: weather, loading: weatherLoading, error: weatherError, isDemo, refetch } = useWeatherData();
  const { forecast, dailyForecast, loading: forecastLoading } = useForecast();
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    alertAPI
      .getAll()
      .then((res) => {
        const data = res.data?.data || res.data || [];
        setAlerts(Array.isArray(data) ? data : []);
      })
      .catch(() => setAlerts([]));
  }, []);

  // Compute dynamic trends comparing current conditions with daily forecast
  const trends = useMemo(() => {
    if (!weather || !dailyForecast || dailyForecast.length === 0) {
      return {
        tempTrend: 'neutral',
        tempValue: 'Ambient 2m dry-bulb',
        humidityTrend: 'neutral',
        humidityValue: 'Relative ambient',
        windValue: weather?.windDirection ? `${weather.windDirection} ${weather?.windSpeed || 0} km/h` : 'Surface wind',
        solarValue: weather?.uvIndex ? `UV Index: ${weather.uvIndex}` : 'Direct insolation',
      };
    }
    const todayForecast = dailyForecast[0];
    const avgTemp = todayForecast?.tempAvg ?? 35;
    const tempDiff = weather.temperature - avgTemp;
    const tempTrend = tempDiff > 0.5 ? 'up' : tempDiff < -0.5 ? 'down' : 'neutral';
    const tempValue = `${tempDiff >= 0 ? '+' : ''}${tempDiff.toFixed(1)}° vs daily mean`;

    const humidityTrend = weather.humidity > 60 ? 'up' : weather.humidity < 40 ? 'down' : 'neutral';
    const humidityValue = weather.dewPoint ? `Dew point ${weather.dewPoint}°C` : `${weather.humidity}% RH`;

    return {
      tempTrend,
      tempValue,
      humidityTrend,
      humidityValue,
      windValue: weather?.windDirection ? `${weather.windDirection} ${weather.windSpeed || 0} km/h` : `${weather.windSpeed || 0} km/h`,
      solarValue: weather?.uvIndex ? `UV Index: ${weather.uvIndex}` : 'Direct shortwave',
    };
  }, [weather, dailyForecast]);

  if (weatherLoading && !weather) {
    return <LoadingSpinner message="Connecting to Pune biometeorological network..." />;
  }

  if (weatherError && !weather) {
    return <ErrorDisplay message={weatherError} onRetry={refetch} />;
  }

  const activeAlertsCount = alerts.length;
  const isElevatedStress = (weather?.thermalStressIndex ?? 0) >= 50;

  return (
    <div className="space-y-6">
      {/* Demo notice if fallback */}
      <DemoDataBanner isDemo={isDemo} />

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-gray-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-white tracking-tight">COMMAND CENTER</h1>
            <span className="text-[10px] bg-orange-500/15 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full font-mono font-semibold">
              LIVE METRICS
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Real-time urban thermal stress monitoring and heat-health surveillance for Pune metropolitan area.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeAlertsCount > 0 && (
            <Link
              to="/alerts"
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-600/20 text-red-400 border border-red-500/40 rounded-full text-xs font-bold hover:bg-red-600/30 transition animate-pulse"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>{activeAlertsCount} ACTIVE HEAT ALERTS</span>
            </Link>
          )}

          <Link
            to="/ward-map"
            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white rounded-lg text-xs font-semibold transition"
          >
            <Map className="w-3.5 h-3.5 text-orange-400" />
            <span>Ward Map</span>
          </Link>

          <Link
            to="/cooling-centers"
            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white rounded-lg text-xs font-semibold transition"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Cooling Shelters</span>
          </Link>
        </div>
      </div>

      {/* Emergency Advisory Callout (when stress is High or above) */}
      {isElevatedStress && (
        <div className="bg-gradient-to-r from-red-950/40 via-orange-950/30 to-gray-900 border border-red-500/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/20 rounded-lg text-red-400 shrink-0">
              <ShieldAlert className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Elevated Thermal Stress Condition Active in Pune
                <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30">
                  {weather?.riskCategory?.toUpperCase()}
                </span>
              </h3>
              <p className="text-xs text-gray-300 mt-0.5">
                Thermal Stress Index is at <span className="text-orange-400 font-mono font-bold">{weather?.thermalStressIndex}</span>/100. Vulnerable populations and outdoor laborers should seek shaded or air-conditioned relief centers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/safe-hours"
              className="text-xs bg-orange-600 hover:bg-orange-500 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1 transition shadow-md"
            >
              <span>Safe Hours Advisory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Row 1: 4 Meteorological Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Air Temperature"
          value={weather?.temperature}
          unit="°C"
          icon={Thermometer}
          accentColor="orange"
          subtitle="Ambient 2m dry-bulb"
          trend={trends.tempTrend}
          trendValue={trends.tempValue}
        />
        <StatCard
          title="Relative Humidity"
          value={weather?.humidity}
          unit="%"
          icon={Droplets}
          accentColor="blue"
          subtitle="Atmospheric moisture"
          trend={trends.humidityTrend}
          trendValue={trends.humidityValue}
        />
        <StatCard
          title="Wind Velocity"
          value={weather?.windSpeed}
          unit="km/h"
          icon={Wind}
          accentColor="green"
          subtitle="Convective ventilation"
          trend="neutral"
          trendValue={trends.windValue}
        />
        <StatCard
          title="Solar Insolation"
          value={weather?.solarRadiation ? Math.round(weather.solarRadiation) : '--'}
          unit="W/m²"
          icon={Sun}
          accentColor="amber"
          subtitle="Shortwave direct flux"
          trend="up"
          trendValue={trends.solarValue}
        />
      </div>

      {/* Row 2: Weather Card + Thermal Stress Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <WeatherCard weather={weather} />
        </div>
        <div className="lg:col-span-5">
          <ThermalStressGauge
            value={weather?.thermalStressIndex ?? 50}
            riskCategory={weather?.riskCategory ?? 'Moderate'}
            heatIndex={weather?.heatIndex}
            wbgtEstimate={weather?.wbgtEstimate}
          />
        </div>
      </div>

      {/* Row 3: 5-Day Forecast Chart */}
      <div>
        <ForecastChart data={forecast} />
      </div>

      {/* Row 4: Daily Outlook Cards */}
      <div>
        <DailyForecastCards days={dailyForecast} />
      </div>

      {/* Row 5: Active Heat Alerts Section */}
      <div className="pt-4 border-t border-gray-800">
        <div className="flex items-center space-x-2 mb-4">
          <Bell className="w-5 h-5 text-orange-400" />
          <h2 className="text-lg font-bold text-white">Active Early-Warning Advisories</h2>
          <span className="text-xs text-gray-500 font-mono">({activeAlertsCount} issued)</span>
        </div>
        <AlertList alerts={alerts} />
      </div>
    </div>
  );
}
