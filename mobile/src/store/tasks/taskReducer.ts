import type { Task } from "../../types";

export type TaskAction =
  | { type: "hydrate"; tasks: Task[] }
  | { type: "add-many"; tasks: Task[] }
  | { type: "add-one"; task: Task }
  | { type: "toggle"; taskId: string }
  | { type: "remove"; taskId: string }
  | { type: "update"; taskId: string; changes: Partial<Pick<Task, "title" | "description" | "dueDate">> };

export function taskReducer(state: Task[], action: TaskAction): Task[] {
  switch (action.type) {
    case "hydrate":
      return [...action.tasks].sort(sortTasks);
    case "add-many":
      return [...action.tasks, ...state].sort(sortTasks);
    case "add-one":
      return [action.task, ...state].sort(sortTasks);
    case "toggle":
      return state.map((task) =>
        task.id === action.taskId
          ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() }
          : task,
      );
    case "remove":
      return state.filter((task) => task.id !== action.taskId);
    case "update":
      return state.map((task) =>
        task.id === action.taskId
          ? { ...task, ...action.changes, updatedAt: new Date().toISOString() }
          : task,
      );
    default:
      return state;
  }
}

export function sortTasks(leftTask: Task, rightTask: Task): number {
  if (leftTask.completed !== rightTask.completed) {
    return Number(leftTask.completed) - Number(rightTask.completed);
  }

  const leftDate = leftTask.dueDate ?? leftTask.createdAt;
  const rightDate = rightTask.dueDate ?? rightTask.createdAt;

  return leftDate.localeCompare(rightDate);
}
