import mongoose from "mongoose";

import { env } from "../env.js";

let isConnected = false;

export async function connectMongo(): Promise<void> {
  if (isConnected) {
    return;
  }

  if (!env.mongoUri) {
    console.warn("MONGODB_URI is not set; Mongo-backed sync is disabled.");
    return;
  }

  await mongoose.connect(env.mongoUri, {
    dbName: env.mongoDbName,
  });

  isConnected = true;
}

export function isMongoConnected(): boolean {
  return isConnected;
}
