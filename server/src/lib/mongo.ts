import mongoose from "mongoose";

import { env } from "../env.js";

let isConnected = false;

export async function connectMongo(): Promise<void> {
  if (isConnected) {
    return;
  }

  if (!env.mongoUri || env.mongoUri.includes("YOUR_USER") || env.mongoUri.includes("YOUR_PASSWORD") || env.mongoUri.includes("YOUR_CLUSTER")) {
    console.warn("MONGODB_URI is not set; Mongo-backed sync is disabled.");
    return;
  }
  
  try {
    console.info(`Connecting to MongoDB database ${env.mongoDbName}...`);

    await mongoose.connect(env.mongoUri, {
      dbName: env.mongoDbName,
    });

    isConnected = true;
    console.info(`MongoDB connected to database ${env.mongoDbName}.`);
  } catch (error) {
    console.warn(
      `MongoDB connection failed; continuing without database sync. ${error instanceof Error ? error.message : "Unknown error."}`,
    );
  }
}

export function isMongoConnected(): boolean {
  return isConnected;
}
