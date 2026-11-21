import mongoose from 'mongoose';
import { env } from './env.js';

let dbMode = 'local-store';

export async function connectDatabase() {
  if (!env.mongodbUri) {
    dbMode = 'local-store';
    console.log('[DB] MONGODB_URI not set — running with persistent local JSON store fallback.');
    return { connected: false, mode: dbMode };
  }

  try {
    await mongoose.connect(env.mongodbUri, {
      serverSelectionTimeoutMS: 8000,
    });
    dbMode = 'mongodb';
    console.log('[DB] Connected to MongoDB Atlas successfully.');
    return { connected: true, mode: dbMode };
  } catch (error) {
    dbMode = 'local-store';
    console.error('[DB] MongoDB connection failed, falling back to local store:', error.message);
    return { connected: false, mode: dbMode };
  }
}

export function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

export function getDatabaseMode() {
  return isMongoConnected() ? 'mongodb' : dbMode;
}
