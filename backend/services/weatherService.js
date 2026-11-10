/**
 * weatherService.js — Core weather data service for HeatGuard AI.
 *
 * Uses the Open-Meteo API (https://open-meteo.com/) which requires NO API key.
 * All thermal-stress formulas are documented inline with academic references.
 *
 * Pune coordinates: 18.5204° N, 73.8567° E
 */

const axios = require('axios');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PUNE_LAT = 18.5204;
const PUNE_LNG = 73.8567;
const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

// ---------------------------------------------------------------------------
// Heat Index — Rothfusz regression  (NWS / NOAA)
// ---------------------------------------------------------------------------

/**
 * Calculate the Heat Index using the Rothfusz regression equation.
 *
 * Source: National Weather Service (NWS) / NOAA
 * Reference: Rothfusz, L.P., 1990: The Heat Index "Equation" (or, More Than You
 *            Ever Wanted to Know About Heat Index). NWS Technical Attachment SR 90-23.
 *
 * The formula operates on Fahrenheit internally; this function accepts and
 * returns Celsius values.
 *
 * @param {number} tempC  — Air temperature in °C
 * @param {number} rh     — Relative humidity in % (0–100)
 * @returns {number}      — Heat Index in °C
 */
function calculateHeatIndex(tempC, rh) {
  if (tempC == null || rh == null) return null;

  // Convert °C → °F for the Rothfusz equation
  const T = (tempC * 9) / 5 + 32;
  const R = rh;

  // Simple formula for low heat-index situations (Steadman, 1979)
  let HI = 0.5 * (T + 61.0 + (T - 68.0) * 1.2 + R * 0.094);

  // If the simple average exceeds 80 °F, apply the full Rothfusz regression
  if ((HI + T) / 2 > 80) {
    HI =
      -42.379 +
      2.04901523 * T +
      10.14333127 * R -
      0.22475541 * T * R -
      6.83783e-3 * T * T -
      5.481717e-2 * R * R +
      1.22874e-3 * T * T * R +
      8.5282e-4 * T * R * R -
      1.99e-6 * T * T * R * R;

    // Adjustments for low / high humidity edge cases
    if (R < 13 && T >= 80 && T <= 112) {
      HI -= ((13 - R) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
    } else if (R > 85 && T >= 80 && T <= 87) {
      HI += ((R - 85) / 10) * ((87 - T) / 5);
    }
  }

  // Convert °F → °C and round to one decimal
  return Math.round(((HI - 32) * 5) / 9 * 10) / 10;
}

// ---------------------------------------------------------------------------
// Wet-Bulb Globe Temperature (WBGT) — simplified Liljegren estimate
// ---------------------------------------------------------------------------

/**
 * Estimate the Wet-Bulb Globe Temperature (WBGT) using a simplified
 * version of the Liljegren method.
 *
 * WBGT = 0.7 × Tw  +  0.2 × Tg  +  0.1 × Ta
 *
 * Where:
 *   Tw = Natural Wet-Bulb Temperature (estimated from T and RH using the
 *        Stull (2011) approximation)
 *   Tg = Globe Temperature (estimated from T and solar radiation using a
 *        simple empirical relationship)
 *   Ta = Ambient dry-bulb temperature
 *
 * References:
 *   - Liljegren, J.C., et al., 2008: "Modeling the Wet Bulb Globe Temperature
 *     Using Standard Meteorological Measurements." JAMC, 47, 2680–2699.
 *   - Stull, R., 2011: "Wet-Bulb Temperature from Relative Humidity and Air
 *     Temperature." JAMC, 50, 2267–2269.
 *
 * ⚠️  This is an ESTIMATE. True WBGT requires direct globe-thermometer
 *     measurements. The returned object includes an `isEstimate` flag.
 *
 * @param {number} tempC          — Air temperature in °C
 * @param {number} rh             — Relative humidity in % (0–100)
 * @param {number} solarRadiation — Shortwave radiation in W/m² (can be 0 at night)
 * @returns {{ value: number, isEstimate: boolean }}
 */
function estimateWBGT(tempC, rh, solarRadiation = 0) {
  if (tempC == null || rh == null) return { value: null, isEstimate: true };

  const T = tempC;
  const R = rh;
  const S = solarRadiation || 0;

  // --- Estimate Tw (natural wet-bulb) using Stull (2011) approximation ---
  // Tw = T × arctan[0.151977 × (RH + 8.313659)^0.5]
  //    + arctan(T + RH) − arctan(RH − 1.676331)
  //    + 0.00391838 × RH^1.5 × arctan(0.023101 × RH)
  //    − 4.686035
  const Tw =
    T * Math.atan(0.151977 * Math.sqrt(R + 8.313659)) +
    Math.atan(T + R) -
    Math.atan(R - 1.676331) +
    0.00391838 * Math.pow(R, 1.5) * Math.atan(0.023101 * R) -
    4.686035;

  // --- Estimate Tg (globe temperature) ---
  // Simplified empirical relation:
  //   Tg ≈ 1.006 × T + 0.004 × S − 0.3
  // This is a rough fit; a full radiative balance model is more accurate.
  const Tg = 1.006 * T + 0.004 * S - 0.3;

  // --- WBGT (outdoors, Liljegren formula) ---
  const WBGT = 0.7 * Tw + 0.2 * Tg + 0.1 * T;

  return {
    value: Math.round(WBGT * 10) / 10,
    isEstimate: true, // Always true — we don't have a real globe thermometer
  };
}

// ---------------------------------------------------------------------------
// Thermal Stress Index (0 – 100)
// ---------------------------------------------------------------------------

/**
 * Calculate a composite Thermal Stress Index on a 0–100 scale.
 *
 * The index combines three normalised components:
 *   1. Heat Index contribution     (weight 0.45)
 *   2. Estimated WBGT contribution (weight 0.40)
 *   3. Wind chill offset           (weight 0.15, negative = cooling benefit)
 *
 * Normalisation reference ranges (for Pune summer climate):
 *   - Heat Index : 25 °C (baseline)  →  55 °C (extreme)
 *   - WBGT       : 20 °C (baseline)  →  40 °C (extreme)
 *   - Wind speed : 0 km/h → 50 km/h  (higher wind → lower stress)
 *
 * @param {number} heatIndexC    — Heat Index in °C
 * @param {number} wbgtC         — Estimated WBGT in °C
 * @param {number} windSpeedKmh  — Wind speed in km/h
 * @returns {{ index: number, category: string }}
 */
function calculateThermalStress(heatIndexC, wbgtC, windSpeedKmh = 0) {
  if (heatIndexC == null && wbgtC == null) {
    return { index: 0, category: 'Low' };
  }

  // Normalise Heat Index to 0–100
  const hiNorm = heatIndexC != null
    ? Math.min(100, Math.max(0, ((heatIndexC - 25) / 30) * 100))
    : 0;

  // Normalise WBGT to 0–100
  const wbgtNorm = wbgtC != null
    ? Math.min(100, Math.max(0, ((wbgtC - 20) / 20) * 100))
    : 0;

  // Wind cooling benefit (inverse): more wind → lower stress
  const windBenefit = Math.min(15, (windSpeedKmh / 50) * 15);

  // Weighted composite with wind cooling mitigation
  let index = 0.45 * hiNorm + 0.40 * wbgtNorm - windBenefit;

  // Clamp to 0–100
  index = Math.min(100, Math.max(0, Math.round(index * 10) / 10));

  const category = getRiskCategory(index);

  return { index, category };
}

/**
 * Map a thermal stress index value (0–100) to a risk category.
 *
 * Thresholds:
 *   0–35   → Low
 *   35–50  → Moderate
 *   50–65  → High
 *   65–80  → Very High
 *   80–100 → Extreme
 *
 * @param {number} index
 * @returns {string}
 */
function getRiskCategory(index) {
  if (index >= 80) return 'Extreme';
  if (index >= 65) return 'Very High';
  if (index >= 50) return 'High';
  if (index >= 35) return 'Moderate';
  return 'Low';
}

// ---------------------------------------------------------------------------
// Enrich a raw weather data point with thermal-stress fields
// ---------------------------------------------------------------------------

/**
 * Take a raw weather data object and add heatIndex, wbgtEstimate,
 * thermalStressIndex, and riskCategory fields.
 *
 * @param {Object} data - must include temperature, humidity, windSpeed, solarRadiation
 * @returns {Object} enriched data
 */
function enrichWeatherData(data) {
  const heatIndex = calculateHeatIndex(data.temperature, data.humidity);
  const wbgt = estimateWBGT(data.temperature, data.humidity, data.solarRadiation);
  const thermalStress = calculateThermalStress(heatIndex, wbgt.value, data.windSpeed);

  return {
    ...data,
    heatIndex,
    wbgtEstimate: wbgt.value,
    wbgtIsEstimate: wbgt.isEstimate,
    thermalStressIndex: thermalStress.index,
    riskCategory: thermalStress.category,
  };
}

// ---------------------------------------------------------------------------
// Open-Meteo API calls
// ---------------------------------------------------------------------------

/**
 * Fetch current weather for Pune from Open-Meteo.
 * Returns an enriched weather data object with thermal-stress calculations.
 */
async function fetchCurrentWeather() {
  const params = new URLSearchParams({
    latitude: PUNE_LAT,
    longitude: PUNE_LNG,
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'wind_speed_10m',
      'shortwave_radiation',
      'precipitation',
    ].join(','),
    timezone: 'Asia/Kolkata',
  });

  const url = `${OPEN_METEO_BASE}?${params}`;
  const { data } = await axios.get(url, { timeout: 10000 });

  const current = data.current;

  const raw = {
    timestamp: new Date(current.time),
    temperature: current.temperature_2m,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    solarRadiation: current.shortwave_radiation,
    precipitation: current.precipitation,
    source: 'open-meteo',
    location: { lat: PUNE_LAT, lng: PUNE_LNG, name: 'Pune' },
  };

  return enrichWeatherData(raw);
}

/**
 * Fetch 5-day hourly forecast for Pune from Open-Meteo.
 * Returns an array of enriched weather data objects.
 */
async function fetchForecast() {
  const params = new URLSearchParams({
    latitude: PUNE_LAT,
    longitude: PUNE_LNG,
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'wind_speed_10m',
      'shortwave_radiation',
      'precipitation',
    ].join(','),
    forecast_days: '5',
    timezone: 'Asia/Kolkata',
  });

  const url = `${OPEN_METEO_BASE}?${params}`;
  const { data } = await axios.get(url, { timeout: 15000 });

  const hourly = data.hourly;
  const results = [];

  for (let i = 0; i < hourly.time.length; i++) {
    const raw = {
      timestamp: new Date(hourly.time[i]),
      temperature: hourly.temperature_2m[i],
      humidity: hourly.relative_humidity_2m[i],
      windSpeed: hourly.wind_speed_10m[i],
      solarRadiation: hourly.shortwave_radiation[i],
      precipitation: hourly.precipitation[i],
      source: 'open-meteo',
      location: { lat: PUNE_LAT, lng: PUNE_LNG, name: 'Pune' },
    };
    results.push(enrichWeatherData(raw));
  }

  return results;
}

/**
 * Fetch 5-day daily forecast summary for Pune from Open-Meteo.
 * Returns an array with one entry per day containing min/max/mean values.
 */
async function fetchDailyForecast() {
  const params = new URLSearchParams({
    latitude: PUNE_LAT,
    longitude: PUNE_LNG,
    daily: [
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'wind_speed_10m_max',
      'shortwave_radiation_sum',
    ].join(','),
    forecast_days: '5',
    timezone: 'Asia/Kolkata',
  });

  const url = `${OPEN_METEO_BASE}?${params}`;
  const { data } = await axios.get(url, { timeout: 10000 });

  const daily = data.daily;
  const results = [];

  for (let i = 0; i < daily.time.length; i++) {
    const avgTemp = (daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2;
    // Estimate average humidity at ~50% for daily summary (Open-Meteo daily doesn't return humidity)
    const estimatedHumidity = 50;
    // Convert daily radiation sum (MJ/m²) to average W/m² over 12 daylight hours
    const avgSolarRadiation = daily.shortwave_radiation_sum[i]
      ? (daily.shortwave_radiation_sum[i] * 1e6) / (12 * 3600)
      : 0;

    const raw = {
      date: daily.time[i],
      temperatureMax: daily.temperature_2m_max[i],
      temperatureMin: daily.temperature_2m_min[i],
      temperatureAvg: Math.round(avgTemp * 10) / 10,
      precipitationSum: daily.precipitation_sum[i],
      windSpeedMax: daily.wind_speed_10m_max[i],
      solarRadiationSum: daily.shortwave_radiation_sum[i],
      source: 'open-meteo',
      location: { lat: PUNE_LAT, lng: PUNE_LNG, name: 'Pune' },
    };

    // Enrich using the max temperature (worst-case thermal stress for the day)
    const enriched = enrichWeatherData({
      temperature: daily.temperature_2m_max[i],
      humidity: estimatedHumidity,
      windSpeed: daily.wind_speed_10m_max[i],
      solarRadiation: avgSolarRadiation,
    });

    results.push({
      ...raw,
      heatIndex: enriched.heatIndex,
      wbgtEstimate: enriched.wbgtEstimate,
      wbgtIsEstimate: true,
      thermalStressIndex: enriched.thermalStressIndex,
      riskCategory: enriched.riskCategory,
      _note: 'Daily thermal stress is computed from max temperature and estimated humidity (~50%). Actual values may differ.',
    });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  calculateHeatIndex,
  estimateWBGT,
  calculateThermalStress,
  getRiskCategory,
  enrichWeatherData,
  fetchCurrentWeather,
  fetchForecast,
  fetchDailyForecast,
  PUNE_LAT,
  PUNE_LNG,
};
