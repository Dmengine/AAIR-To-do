import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";

import type { Task, TaskDraft } from "../../types";
import { splitDictation } from "../../utils/splitDictation";
import { loadStoredTasks, saveStoredTasks } from "./taskStorage";
import { sortTasks, taskReducer } from "./taskReducer";

type TaskContextValue = {
  tasks: Task[];
  isHydrated: boolean;
  addTask: (draft: TaskDraft, source?: Task["source"]) => void;
  addTasksFromTranscript: (transcript: string) => void;
  toggleTask: (taskId: string) => void;
  removeTask: (taskId: string) => void;
  updateTask: (taskId: string, changes: Partial<Pick<Task, "title" | "description" | "dueDate">>) => void;
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

    void loadStoredTasks().then((storedTasks) => {
      if (!mounted) {
        return;
      }

      dispatch({ type: "hydrate", tasks: storedTasks });
      setIsHydrated(true);
    });

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
    function addTask(draft: TaskDraft, source: Task["source"] = "manual") {
      const title = draft.title.trim();
      if (!title) {
        return;
      }

      const now = new Date().toISOString();
      dispatch({
        type: "add-one",
        task: {
          id: createTaskId(),
          title,
          description: draft.description.trim() || undefined,
          dueDate: draft.dueDate.trim() || undefined,
          completed: false,
          createdAt: now,
          updatedAt: now,
          source,
        },
      });
    }

    function addTasksFromTranscript(transcript: string) {
      const segments = splitDictation(transcript);
      const nextTasks = segments
        .map((segment) => segment.trim())
        .filter(Boolean)
        .map((title) => {
          const now = new Date().toISOString();
          return {
            id: createTaskId(),
            title,
            completed: false,
            createdAt: now,
            updatedAt: now,
            source: "voice" as const,
          } satisfies Task;
        });

      if (nextTasks.length > 0) {
        dispatch({ type: "add-many", tasks: nextTasks.sort(sortTasks) });
      }
    }

    function toggleTask(taskId: string) {
      dispatch({ type: "toggle", taskId });
    }

    function removeTask(taskId: string) {
      dispatch({ type: "remove", taskId });
    }

    function updateTask(taskId: string, changes: Partial<Pick<Task, "title" | "description" | "dueDate">>) {
      const sanitizedChanges = Object.fromEntries(
        Object.entries(changes).filter(([, value]) => typeof value === "string" && value.trim().length > 0),
      ) as Partial<Pick<Task, "title" | "description" | "dueDate">>;

      dispatch({ type: "update", taskId, changes: sanitizedChanges });
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
