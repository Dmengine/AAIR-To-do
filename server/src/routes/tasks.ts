import { Router } from "express";
import { z } from "zod";

import { TaskModel } from "../models/Task.js";
import { isMongoConnected } from "../lib/mongo.js";
import { withTransaction } from "../lib/withTransaction.js";

const taskDraftSchema = z.object({
  title: z.string().trim().min(1).max(240),
  description: z.string().trim().optional().or(z.literal("")),
  dueDate: z.string().trim().optional().or(z.literal("")),
  source: z.enum(["manual", "voice"]).optional(),
});

const patchSchema = taskDraftSchema.partial();

export const taskRouter = Router();

taskRouter.get("/", async (_request, response, next) => {
  try {
    if (!isMongoConnected()) {
      response.status(503).json({ error: "MongoDB is not configured." });
      return;
    }

    const tasks = await TaskModel.find().sort({ completed: 1, dueDate: 1, createdAt: 1 }).lean();
    response.json({ tasks });
  } catch (error) {
    next(error);
  }
});

taskRouter.post("/", async (request, response, next) => {
  try {
    if (!isMongoConnected()) {
      response.status(503).json({ error: "MongoDB is not configured." });
      return;
    }

    const payload = taskDraftSchema.parse(request.body);

    const task = await withTransaction(async (session) => {
      const [createdTask] = await TaskModel.create(
        [
          {
            title: payload.title,
            description: payload.description ?? "",
            dueDate: payload.dueDate ?? "",
            source: payload.source ?? "manual",
          },
        ],
        { session },
      );

      return createdTask;
    });

    response.status(201).json({ task });
  } catch (error) {
    next(error);
  }
});

taskRouter.patch("/:taskId", async (request, response, next) => {
  try {
    if (!isMongoConnected()) {
      response.status(503).json({ error: "MongoDB is not configured." });
      return;
    }

    const { taskId } = z.object({ taskId: z.string().min(1) }).parse(request.params);
    const patch = patchSchema.parse(request.body);

    const task = await withTransaction(async (session) => {
      const updatedTask = await TaskModel.findByIdAndUpdate(
        taskId,
        {
          $set: {
            ...Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined)),
          },
        },
        { new: true, session },
      ).lean();

      if (!updatedTask) {
        throw new Error("TASK_NOT_FOUND");
      }

      return updatedTask;
    });

    response.json({ task });
  } catch (error) {
    next(error);
  }
});

taskRouter.delete("/:taskId", async (request, response, next) => {
  try {
    if (!isMongoConnected()) {
      response.status(503).json({ error: "MongoDB is not configured." });
      return;
    }

    const { taskId } = z.object({ taskId: z.string().min(1) }).parse(request.params);

    await withTransaction(async (session) => {
      const deletion = await TaskModel.findByIdAndDelete(taskId, { session });
      if (!deletion) {
        throw new Error("TASK_NOT_FOUND");
      }
    });

    response.status(204).send();
  } catch (error) {
    next(error);
  }
});
