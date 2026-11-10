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
// Middleware
// ---------------------------------------------------------------------------

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(rateLimiter({ windowMs: 60_000, maxRequests: 300 }));

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

app.use('/api/weather', require('./routes/weather'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/wards', require('./routes/wards'));
app.use('/api/cooling-centers', require('./routes/coolingCenters'));
app.use('/api/predictions', require('./routes/predictions'));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'heatguard-ai-backend', timestamp: new Date().toISOString() });
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
