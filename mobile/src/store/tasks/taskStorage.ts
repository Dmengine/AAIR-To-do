import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Task } from "../../types";

const STORAGE_KEY = "aair.todo.tasks.v1";

export async function loadStoredTasks(): Promise<Task[]> {
  const rawValue = await AsyncStorage.getItem(STORAGE_KEY);
  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Task[];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

export async function saveStoredTasks(tasks: Task[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
