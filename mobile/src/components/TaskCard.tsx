import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Task } from "../types";
import { theme } from "../theme";

type TaskCardProps = {
  task: Task;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
};

export function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  return (
    <View style={[styles.card, task.completed && styles.cardCompleted]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.completed }}
        onPress={() => onToggle(task.id)}
        style={[styles.checkbox, task.completed && styles.checkboxCompleted]}
      >
        <Text style={[styles.checkboxMark, task.completed && styles.checkboxMarkCompleted]}>✓</Text>
      </Pressable>

      <View style={styles.content}>
        <Text style={[styles.title, task.completed && styles.titleCompleted]} numberOfLines={2}>
          {task.title}
        </Text>

        {task.description ? (
          <Text style={[styles.description, task.completed && styles.descriptionCompleted]} numberOfLines={2}>
            {task.description}
          </Text>
        ) : null}

        {task.dueDate ? <Text style={styles.meta}>Due {formatDate(task.dueDate)}</Text> : null}
      </View>

      <Pressable accessibilityRole="button" onPress={() => onDelete(task.id)} style={styles.deleteButton}>
        <Text style={styles.deleteText}>Delete</Text>
      </Pressable>
    </View>
  );
}

function formatDate(value: string): string {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderStrong,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.cardPadding,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.md,
  },
  cardCompleted: {
    opacity: 0.82,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxCompleted: {
    backgroundColor: theme.colors.secondaryTint,
    borderColor: theme.colors.secondary,
  },
  checkboxMark: {
    color: "transparent",
    fontSize: 12,
    fontWeight: "700",
  },
  checkboxMarkCompleted: {
    color: theme.colors.secondary,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  titleCompleted: {
    color: theme.colors.textSubtle,
    textDecorationLine: "line-through",
    fontWeight: "400",
  },
  description: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  descriptionCompleted: {
    color: theme.colors.textSubtle,
  },
  meta: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  deleteText: {
    color: theme.colors.destructive,
    fontSize: 12,
    fontWeight: "700",
  },
});
