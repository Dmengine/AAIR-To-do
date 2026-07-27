import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI ?? process.env.MONGODB_URL ?? "",
  mongoDbName: process.env.MONGODB_DB_NAME ?? "aair_todo",
  assemblyAiApiKey: process.env.ASSEMBLYAI_API_KEY?.trim() ?? "",
  allowedOrigin: process.env.ALLOWED_ORIGIN ?? "*",
};
