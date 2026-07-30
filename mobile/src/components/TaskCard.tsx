import React from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import type { Task } from "../types";
import { useTheme } from "../theme";

type TaskCardProps = {
  task: Task;
  onPress: (taskId: string) => void;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
};

export function TaskCard({ task, onPress, onToggle, onDelete }: TaskCardProps): React.JSX.Element {
  const { theme } = useTheme();
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: task.completed ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [animatedValue, task.completed]);

  const opacity = animatedValue.interpolate({ inputRange: [0, 1], outputRange: [1, 0.82] });

  return (
    <Animated.View style={{ opacity }}>
      <Pressable onPress={() => onPress(task.id)} style={({ pressed }) => [styles(theme).card, task.completed && styles(theme).cardCompleted, pressed && styles(theme).cardPressed]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.completed }}
        onPress={(event) => {
          event.stopPropagation();
          onToggle(task.id);
        }}
        style={[styles(theme).checkbox, task.completed && styles(theme).checkboxCompleted]}
      >
        {task.completed ? (
          <MaterialIcons name="check" size={14} color={theme.colors.secondary} />
        ) : null}
      </Pressable>

      <View style={styles(theme).content}>
        <Text style={[styles(theme).title, task.completed && styles(theme).titleCompleted]} numberOfLines={2}>
          {task.title}
        </Text>

        {task.description ? (
          <Text style={[styles(theme).description, task.completed && styles(theme).descriptionCompleted]} numberOfLines={2}>
            {task.description}
          </Text>
        ) : null}

        <View style={styles(theme).metaRow}>
          {task.dueDate ? <Text style={styles(theme).meta}>Due {formatDate(task.dueDate)}</Text> : null}
          <Pressable
            accessibilityRole="button"
            onPress={(event) => {
              event.stopPropagation();
              onDelete(task.id);
            }}
            style={styles(theme).deleteButton}
          >
            <MaterialIcons name="delete" size={18} color={theme.colors.destructive} />
          </Pressable>
        </View>
      </View>
      </Pressable>
    </Animated.View>
  );
}

function formatDate(value: string): string {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const styles = (theme: ReturnType<typeof useTheme>["theme"]) => StyleSheet.create({
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
  cardPressed: {
    opacity: 0.92,
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
    gap: theme.spacing.sm,
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
