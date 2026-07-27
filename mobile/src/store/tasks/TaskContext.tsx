import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";

import type { Task, TaskDraft } from "../../types";
import { splitDictation } from "../../utils/splitDictation";
import { loadStoredTasks, saveStoredTasks } from "./taskStorage";
import { sortTasks, taskReducer } from "./taskReducer";
import {
  createTaskOnServer,
  deleteTaskOnServer,
  fetchTasksFromServer,
  updateTaskOnServer,
} from "../../services/tasks";

type TaskContextValue = {
  tasks: Task[];
  isHydrated: boolean;
  addTask: (draft: TaskDraft, source?: Task["source"]) => Promise<void>;
  addTasksFromTranscript: (transcript: string) => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
  removeTask: (taskId: string) => Promise<void>;
  updateTask: (taskId: string, changes: Partial<Pick<Task, "title" | "description" | "dueDate">>) => Promise<void>;
  taskCounts: { total: number; completed: number; active: number };
};

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

function createTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, dispatch] = useReducer(taskReducer, [] as Task[]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      try {
        const serverTasks = await fetchTasksFromServer();

        if (!mounted) {
          return;
        }

        dispatch({ type: "hydrate", tasks: serverTasks });
        await saveStoredTasks(serverTasks);
      } catch {
        const storedTasks = await loadStoredTasks();

        if (!mounted) {
          return;
        }

        dispatch({ type: "hydrate", tasks: storedTasks });
      } finally {
        if (mounted) {
          setIsHydrated(true);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    void saveStoredTasks(tasks);
  }, [isHydrated, tasks]);

  const apiValue = useMemo<TaskContextValue>(() => {
    async function addTask(draft: TaskDraft, source: Task["source"] = "manual") {
      const title = draft.title.trim();
      if (!title) {
        return;
      }

      const task = await createTaskOnServer({ ...draft, title }, source);
      dispatch({ type: "add-one", task });
    }

    async function addTasksFromTranscript(transcript: string) {
      const segments = splitDictation(transcript);
      const nextTasks = [] as Task[];

      for (const segment of segments.map((piece) => piece.trim()).filter(Boolean)) {
        nextTasks.push(await createTaskOnServer({ title: segment, description: "", dueDate: "" }, "voice"));
      }

      if (nextTasks.length > 0) {
        dispatch({ type: "add-many", tasks: nextTasks.sort(sortTasks) });
      }
    }

    async function toggleTask(taskId: string) {
      const currentTask = tasks.find((task) => task.id === taskId);
      if (!currentTask) {
        return;
      }

      const updatedTask = await updateTaskOnServer(taskId, {
        completed: !currentTask.completed,
      });

      dispatch({ type: "replace-one", task: updatedTask });
    }

    async function removeTask(taskId: string) {
      await deleteTaskOnServer(taskId);
      dispatch({ type: "remove", taskId });
    }

    async function updateTask(taskId: string, changes: Partial<Pick<Task, "title" | "description" | "dueDate">>) {
      const sanitizedChanges = Object.fromEntries(
        Object.entries(changes).filter(([, value]) => typeof value === "string"),
      ) as Partial<Pick<Task, "title" | "description" | "dueDate">>;

      const updatedTask = await updateTaskOnServer(taskId, sanitizedChanges);
      dispatch({ type: "replace-one", task: updatedTask });
    }

    return {
      tasks,
      isHydrated,
      addTask,
      addTasksFromTranscript,
      toggleTask,
      removeTask,
      updateTask,
      taskCounts: {
        total: tasks.length,
        completed: tasks.filter((task) => task.completed).length,
        active: tasks.filter((task) => !task.completed).length,
      },
    };
  }, [isHydrated, tasks]);

  return <TaskContext.Provider value={apiValue}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const contextValue = useContext(TaskContext);
  if (!contextValue) {
    throw new Error("useTasks must be used within a TaskProvider");
  }

  return contextValue;
}
