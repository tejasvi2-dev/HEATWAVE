const mongoose = require('mongoose');

const weatherDataSchema = new mongoose.Schema(
  {
    /** UTC timestamp for this weather observation or forecast point */
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },

    /** Air temperature in degrees Celsius */
    temperature: {
      type: Number,
    },

    /** Relative humidity as a percentage (0–100) */
    humidity: {
      type: Number,
    },

    /** Wind speed in km/h */
    windSpeed: {
      type: Number,
    },

    /** Shortwave (solar) radiation in W/m² */
    solarRadiation: {
      type: Number,
    },

    /** Precipitation in mm */
    precipitation: {
      type: Number,
    },

    /**
     * Heat Index (°C) — calculated using the Rothfusz regression equation.
     * See weatherService.js for the full formula and source reference.
     */
    heatIndex: {
      type: Number,
    },

    /**
     * Estimated Wet Bulb Globe Temperature (°C).
     * Uses the Liljegren simplified formula.
     * NOTE: This is an *estimate*, not a direct WBGT measurement.
     */
    wbgtEstimate: {
      type: Number,
    },

    /**
     * Thermal Stress Index (0–100 scale) combining heat index,
     * estimated WBGT, and wind speed into a single risk score.
     */
    thermalStressIndex: {
      type: Number,
    },

    /** Overall risk category derived from thermalStressIndex thresholds */
    riskCategory: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'Very High', 'Extreme'],
    },

    /** Data source identifier */
    source: {
      type: String,
      enum: ['open-meteo', 'simulated'],
      default: 'open-meteo',
    },

    /** Geographic location for this observation */
    location: {
      lat: { type: Number },
      lng: { type: Number },
      name: { type: String, default: 'Pune' },
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

// Compound index for efficient time-range queries
weatherDataSchema.index({ timestamp: -1, source: 1 });

module.exports = mongoose.model('WeatherData', weatherDataSchema);
