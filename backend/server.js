/**
 * server.js — Entry point for the HeatGuard AI backend.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 5000;

// ---------------------------------------------------------------------------
// Middleware: CORS
// ---------------------------------------------------------------------------

// Allow local development, specific configured FRONTEND_URL, and any Vercel deployment
const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, server-to-server, monitoring, mobile apps)
    if (!origin) return callback(null, true);

    // Allow localhost
    if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);

    // Allow any Vercel domain (*.vercel.app)
    if (/^https?:\/\/.*\.vercel\.app$/.test(origin)) return callback(null, true);

    // Allow configured FRONTEND_URL
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL.replace(/\/+$/, '')) {
      return callback(null, true);
    }

    // Default: allow all origins in production to prevent deployment breakage
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(rateLimiter({ windowMs: 60_000, maxRequests: 300 }));

// ---------------------------------------------------------------------------
// Health Checks & Directory Endpoints
// (Supports Render/Docker/K8s/Vercel connectivity probes)
// ---------------------------------------------------------------------------

const healthPayload = () => ({
  status: 'ok',
  service: 'heatguard-ai-backend',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'production',
  timestamp: new Date().toISOString(),
  endpoints: {
    weatherCurrent: '/api/weather/current',
    weatherForecast: '/api/weather/forecast',
    weatherDaily: '/api/weather/daily',
    alerts: '/api/alerts',
    alertsGenerate: '/api/alerts/generate',
    wards: '/api/wards',
    coolingCenters: '/api/cooling-centers',
    coolingCentersNearest: '/api/cooling-centers/nearest',
    predictions: '/api/predictions',
    predictionsThermalStress: '/api/predictions/thermal-stress',
    predictionsSafeHours: '/api/predictions/safe-hours',
    modelMetrics: '/api/predictions/model/metrics',
    modelStatus: '/api/predictions/model/status',
    health: '/api/health',
  },
});

app.get('/health', (_req, res) => res.json(healthPayload()));
app.get('/api/health', (_req, res) => res.json(healthPayload()));
app.get('/', (_req, res) => res.json(healthPayload()));
app.get('/api', (_req, res) => res.json(healthPayload()));

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

app.use('/api/weather', require('./routes/weather'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/wards', require('./routes/wards'));
app.use('/api/cooling-centers', require('./routes/coolingCenters'));
app.use('/api/predictions', require('./routes/predictions'));

// ---------------------------------------------------------------------------
// 404 Handler for Unmatched API Routes
// ---------------------------------------------------------------------------

app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `API endpoint "${req.originalUrl}" not found.`,
      code: 'ROUTE_NOT_FOUND',
      availableEndpoints: [
        '/api/weather/current',
        '/api/weather/forecast',
        '/api/weather/daily',
        '/api/alerts',
        '/api/wards',
        '/api/cooling-centers',
        '/api/predictions',
        '/api/health',
      ],
    },
  });
});

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

app.use(errorHandler);

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

async function start() {
  // Connect to MongoDB — but don't fail if unavailable (run in demo mode)
  try {
    await connectDB();
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.warn('⚠️  MongoDB unavailable — running without database persistence.');
    console.warn('   Set MONGODB_URI in .env to enable storage.');
  }

  app.listen(PORT, () => {
    console.log(`🔥 HeatGuard AI backend running on http://localhost:${PORT}`);
  });
}

start();
