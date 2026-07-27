import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

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
        {task.completed ? (
          <MaterialIcons name="check" size={14} color={theme.colors.secondary} />
        ) : null}
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

        <View style={styles.metaRow}>
          {task.dueDate ? <Text style={styles.meta}>Due {formatDate(task.dueDate)}</Text> : null}
          <Pressable accessibilityRole="button" onPress={() => onDelete(task.id)} style={styles.deleteButton}>
            <MaterialIcons name="delete" size={18} color={theme.colors.destructive} />
          </Pressable>
        </View>
      </View>
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
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
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
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
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
    paddingVertical: 4,
  },
});
