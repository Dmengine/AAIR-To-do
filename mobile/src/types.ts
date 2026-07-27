export type Task = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  source: "manual" | "voice";
};

export type TaskDraft = {
  title: string;
  description: string;
  dueDate: string;
};

export type VoiceResult = {
  transcript: string;
  segments: string[];
};