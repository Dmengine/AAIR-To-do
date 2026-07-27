import cors from "cors";
import express from "express";

import { env } from "./env.js";
import { taskRouter } from "./routes/tasks.js";
import { voiceRouter } from "./routes/voice.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.allowedOrigin === "*" ? true : env.allowedOrigin,
    }),
  );
  app.use(express.json({ limit: "2mb" }));

  app.get("/", (_request, response) => {
    response.json({
      name: "AAIR To-Do API",
      status: "ok",
      health: "/health",
      routes: ["/tasks", "/voice"],
    });
  });

  app.get("/health", (_request, response) => {
    response.json({ ok: true });
  });

  app.use("/tasks", taskRouter);
  app.use("/voice", voiceRouter);

  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    if (error instanceof Error && error.message === "TASK_NOT_FOUND") {
      response.status(404).json({ error: "Task not found." });
      return;
    }

    response.status(500).json({ error: error instanceof Error ? error.message : "Unexpected server error." });
  });

  return app;
}
