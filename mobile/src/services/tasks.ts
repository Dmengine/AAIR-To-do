import type { Task, TaskDraft } from "../types";
import { getApiUrl } from "./api";

type ServerTask = {
  _id: string;
  title: string;
  description?: string;
  completed?: boolean;
  createdAt?: string;
  updatedAt?: string;
  dueDate?: string;
  source?: Task["source"];
};

type TaskResponse = {
  task: ServerTask;
};

type TasksResponse = {
  tasks: ServerTask[];
};

export async function fetchTasksFromServer(): Promise<Task[]> {
  const response = await fetch(`${getApiUrl()}/tasks`);

  if (!response.ok) {
    throw new Error(await getServerErrorMessage(response, "Unable to load tasks from the server."));
  }

  const payload = (await response.json()) as TasksResponse;
  return Array.isArray(payload.tasks) ? payload.tasks.map(normalizeServerTask) : [];
}

export async function createTaskOnServer(draft: TaskDraft, source: Task["source"]): Promise<Task> {
  const response = await fetch(`${getApiUrl()}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: draft.title.trim(),
      description: draft.description.trim(),
      dueDate: draft.dueDate.trim(),
      source,
    }),
  });

  if (!response.ok) {
    throw new Error(await getServerErrorMessage(response, "Unable to save the task to the server."));
  }

  const payload = (await response.json()) as TaskResponse;
  return normalizeServerTask(payload.task);
}

export async function updateTaskOnServer(
  taskId: string,
  changes: Partial<Pick<Task, "title" | "description" | "dueDate" | "completed">>,
): Promise<Task> {
  const response = await fetch(`${getApiUrl()}/tasks/${taskId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(changes),
  });

  if (!response.ok) {
    throw new Error(await getServerErrorMessage(response, "Unable to update the task on the server."));
  }

  const payload = (await response.json()) as TaskResponse;
  return normalizeServerTask(payload.task);
}

export async function deleteTaskOnServer(taskId: string): Promise<void> {
  const response = await fetch(`${getApiUrl()}/tasks/${taskId}`, {
    method: "DELETE",
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(await getServerErrorMessage(response, "Unable to delete the task from the server."));
  }
}

function normalizeServerTask(task: ServerTask): Task {
  return {
    id: task._id,
    title: task.title,
    description: task.description?.trim() || undefined,
    completed: Boolean(task.completed),
    createdAt: task.createdAt ?? new Date().toISOString(),
    updatedAt: task.updatedAt ?? task.createdAt ?? new Date().toISOString(),
    dueDate: task.dueDate?.trim() || undefined,
    source: task.source ?? "manual",
  };
}

async function getServerErrorMessage(response: Response, fallbackMessage: string): Promise<string> {
  const payload = (await response.json().catch(() => null)) as { error?: string } | null;
  return payload?.error ?? `${fallbackMessage} (${response.status})`;
}