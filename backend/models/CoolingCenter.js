const mongoose = require('mongoose');

const coolingCenterSchema = new mongoose.Schema(
  {
    /** Name of the cooling center / facility */
    name: {
      type: String,
      required: true,
    },

    /** Street address */
    address: {
      type: String,
    },

    /** Geographic coordinates */
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },

    /** Available facilities (e.g., "Drinking Water", "AC Hall", "First Aid") */
    facilities: {
      type: [String],
      default: [],
    },

    /** Maximum capacity (number of people) */
    capacity: {
      type: Number,
    },

    /**
     * Current occupancy count.
     * NOTE: This value is SIMULATED unless isOccupancyVerified is true.
     */
    currentOccupancy: {
      type: Number,
      default: 0,
    },

    /**
     * Whether currentOccupancy has been verified by a real data source.
     * Set to false for all sample / demo data.
     */
    isOccupancyVerified: {
      type: Boolean,
      default: false,
    },

    /** Human-readable operating hours, e.g. "9:00 AM – 6:00 PM" */
    operatingHours: {
      type: String,
    },

    /** Contact phone number */
    contactNumber: {
      type: String,
    },

    /** Whether this center is currently open and active */
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CoolingCenter', coolingCenterSchema);
