import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const taskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 240 },
    description: { type: String, trim: true, default: "" },
    completed: { type: Boolean, default: false },
    dueDate: { type: String, default: "" },
    source: { type: String, enum: ["manual", "voice"], default: "manual" },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const TaskModel = models.Task ?? model("Task", taskSchema);
