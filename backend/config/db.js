const mongoose = require('mongoose');

/**
 * Connect to MongoDB with retry logic.
 * Retries up to MAX_RETRIES times with exponential backoff before giving up.
 */
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

let retryCount = 0;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/heatguard';

  while (retryCount < MAX_RETRIES) {
    try {
      const conn = await mongoose.connect(mongoURI, {
        // Mongoose 7+ uses these defaults, but we set them explicitly for clarity
        serverSelectionTimeoutMS: 5000,
        heartbeatFrequencyMS: 10000,
      });

      console.log(`✅ MongoDB connected: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);

      // Handle connection events after initial connection
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err.message);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected. Mongoose will attempt to reconnect automatically.');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected.');
      });

      // Reset retry count on successful connection
      retryCount = 0;
      return conn;
    } catch (error) {
      retryCount++;
      console.error(
        `❌ MongoDB connection attempt ${retryCount}/${MAX_RETRIES} failed: ${error.message}`
      );

      if (retryCount >= MAX_RETRIES) {
        console.error('❌ Max retries reached. Could not connect to MongoDB.');
        console.error('   The server will continue running but database features will be unavailable.');
        console.error('   Ensure MongoDB is running and MONGODB_URI is correct in your .env file.');
        return null;
      }

      const delay = RETRY_DELAY_MS * retryCount;
      console.log(`   Retrying in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

/**
 * Gracefully close the MongoDB connection.
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed gracefully.');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error.message);
  }
};

module.exports = connectDB;
module.exports.connectDB = connectDB;
module.exports.disconnectDB = disconnectDB;
