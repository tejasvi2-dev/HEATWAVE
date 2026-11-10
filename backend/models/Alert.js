const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    /** Alert classification */
    type: {
      type: String,
      required: true,
      enum: ['heat-advisory', 'heat-warning', 'extreme-heat-emergency'],
    },

    /** Severity level */
    severity: {
      type: String,
      required: true,
      enum: ['low', 'moderate', 'high', 'very-high', 'extreme'],
    },

    /** Short human-readable title */
    title: {
      type: String,
      required: true,
    },

    /** Detailed description of the alert */
    description: {
      type: String,
    },

    /** Pune ward names affected by this alert */
    affectedWards: {
      type: [String],
      default: [],
    },

    /** Action recommendations for the public */
    recommendations: {
      type: [String],
      default: [],
    },

    /** Whether this alert is currently active */
    isActive: {
      type: Boolean,
      default: true,
    },

    /**
     * Whether this alert was generated from simulated / demo data.
     * Always check this flag before presenting alerts as real warnings.
     */
    isSimulated: {
      type: Boolean,
      default: false,
    },

    /** When the alert was created */
    createdAt: {
      type: Date,
      default: Date.now,
    },

    /** When the alert automatically expires */
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: false, // we manage createdAt ourselves
  }
);

// Index for querying active, non-expired alerts
alertSchema.index({ isActive: 1, expiresAt: 1 });

module.exports = mongoose.model('Alert', alertSchema);
