import axios from 'axios';
import {
  mockCurrentWeather,
  mockForecast,
  mockDailyForecast,
  mockAlerts,
  mockWards,
  mockCoolingCenters,
  mockPredictions,
  mockSafeHours,
  mockThermalStress,
} from './mockData';

// ============================================================
// Axios Instance
// ============================================================
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Request Interceptor ---
api.interceptors.request.use(
  (config) => {
    // Could add auth tokens here in the future
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`API Error [${error.response.status}]:`, error.response.data);
    } else if (error.request) {
      console.warn('API unreachable — backend may be offline. Falling back to demo data.');
    } else {
      console.error('API request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

// ============================================================
// Helper: wrap API call with fallback to mock data
// ============================================================
const withFallback = async (apiCall, fallbackData) => {
  try {
    const response = await apiCall();
    const rawData = response.data;
    const unwrapped = rawData?.data !== undefined ? rawData.data : rawData;
    return { data: unwrapped, raw: rawData, isDemo: false };
  } catch (err) {
    console.warn('API call failed, using demo data fallback:', err?.message || err);
    return { data: fallbackData, raw: fallbackData, isDemo: true };
  }
};

// ============================================================
// Weather API
// ============================================================
export const weatherAPI = {
  getCurrent: () => withFallback(() => api.get('/weather/current'), mockCurrentWeather),
  getForecast: () => withFallback(() => api.get('/weather/forecast'), mockForecast),
  getDaily: () => withFallback(() => api.get('/weather/daily'), mockDailyForecast),
};

// ============================================================
// Alert API
// ============================================================
export const alertAPI = {
  getAll: () => withFallback(() => api.get('/alerts'), mockAlerts),
  generate: () => withFallback(() => api.get('/alerts/generate'), mockAlerts),
};

// ============================================================
// Ward API
// ============================================================
export const wardAPI = {
  getAll: () => withFallback(() => api.get('/wards'), mockWards),
  getByName: (name) =>
    withFallback(
      () => api.get(`/wards/${encodeURIComponent(name)}`),
      mockWards.find((w) => w.name === name) || mockWards[0]
    ),
};

// ============================================================
// Cooling Center API
// ============================================================
export const coolingCenterAPI = {
  getAll: () => withFallback(() => api.get('/cooling-centers'), mockCoolingCenters),
  getNearest: (lat, lng) =>
    withFallback(
      () => api.get('/cooling-centers/nearest', { params: { lat, lng } }),
      mockCoolingCenters.slice(0, 3)
    ),
};

// ============================================================
// Prediction API
// ============================================================
export const predictionAPI = {
  getAll: () => withFallback(() => api.get('/predictions'), mockPredictions),
  getThermalStress: () => withFallback(() => api.get('/predictions/thermal-stress'), mockThermalStress),
  getSafeHours: () => withFallback(() => api.get('/predictions/safe-hours'), mockSafeHours),
  getModelMetrics: () =>
    withFallback(() => api.get('/predictions/model/metrics'), {
      accuracy: 0.884,
      macro_f1: 0.862,
      weighted_f1: 0.879,
      cv_folds: 5,
      test_samples: 365,
      model_type: 'XGBoost Multi-Class Classifier',
      is_simulated: true,
    }),
  getModelStatus: () =>
    withFallback(() => api.get('/predictions/model/status'), {
      ml_active: false,
      model_type: 'Thermodynamic Biometeorology (Rule-based Fallback)',
    }),
};

export default api;
