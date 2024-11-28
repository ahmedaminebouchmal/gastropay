import mongoose from 'mongoose';

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongoose: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

console.log('MongoDB URI configured:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // Hide credentials in logs

let cached = (global.mongoose as MongooseCache) || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
  if (cached.conn) {
    console.log('Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log('Creating new MongoDB connection...');
    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }
  
  try {
    console.log('Waiting for MongoDB connection...');
    cached.conn = await cached.promise;
    console.log('MongoDB connection established successfully');
    return cached.conn;
  } catch (e) {
    console.error('Error connecting to MongoDB:', e);
    cached.promise = null;
    throw e;
  }
}

export default connectDB;
