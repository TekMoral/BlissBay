import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Check if MongoDB is enabled
    const MONGODB_ENABLED = process.env.MONGODB_ENABLED !== 'false';

    if (!MONGODB_ENABLED) {
      console.log('MongoDB is disabled. Running without database connection.');
      return null;
    }

    // Set mongoose options
    mongoose.set('strictQuery', false);

    // Get MongoDB URI from environment variables or use default
    const mongoURI = process.env.MONGODB_URI || 'mongodb://mongo1_test:27017,mongo2_test:27017,mongo3_test:27017/blissbay?replicaSet=rs0';

    console.log(`Attempting to connect to MongoDB at ${mongoURI}`);

    // Connect to MongoDB with timeouts
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      heartbeatFrequencyMS: 5000,
      retryWrites: true,
      w: 'majority',
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected to ${conn.connection.host}`);

    // Connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    console.error('MongoDB connection failed:', error);

    if (process.env.NODE_ENV !== 'production') {
      console.warn('Running in development/test mode without MongoDB connection');
      return null;
    }

    console.error('Exiting application due to database connection failure');
    setTimeout(() => process.exit(1), 1000);
    return null;
  }
};

export default connectDB;
