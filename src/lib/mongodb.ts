// /src/lib/mongodb.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  console.error('⚠️ Missing MONGODB_URI environment variable!');
  console.error('Please set MONGODB_URI in .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

let cached: MongooseCache;

if (!global.mongoose) {
  cached = { conn: null, promise: null };
  global.mongoose = cached;
} else {
  cached = global.mongoose;
}

/**
 * Connect to MongoDB using Mongoose
 * Reuses existing connection if available
 */
async function connectMongoDB() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then(() => {
      console.log('✅ Connected to MongoDB');
      return mongoose;
    }) as Promise<typeof mongoose>;
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

/**
 * Check if MongoDB is properly configured
 */
export function isMongoDBConfigured(): boolean {
  return !!MONGODB_URI && !MONGODB_URI.includes('placeholder');
}

/**
 * Disconnect from MongoDB (useful for cleanup)
 */
export async function disconnectMongoDB() {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log('✅ Disconnected from MongoDB');
  }
}

export default connectMongoDB;

