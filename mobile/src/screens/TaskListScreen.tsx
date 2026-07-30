import React, { useMemo, useState } from "react";
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { FloatingActionButton } from "../components/FloatingActionButton";
import { TaskCard } from "../components/TaskCard";
import { useTheme, type AppTheme } from "../theme";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { useTasks } from "../store/tasks/TaskContext";

type TaskListScreenProps = NativeStackScreenProps<RootStackParamList, "TaskList"> & {
  toggleTheme?: () => void;
  isDarkMode?: boolean;
};

export function TaskListScreen({ navigation, toggleTheme, isDarkMode }: TaskListScreenProps) {
  const { tasks, taskCounts, toggleTask, removeTask } = useTasks();
  const { theme } = useTheme();
  const [query, setQuery] = useState("");

  async function handleToggleTask(taskId: string) {
    try {
      await toggleTask(taskId);
    } catch (error) {
      Alert.alert("Sync failed", error instanceof Error ? error.message : "Unable to update the task.");
    }
  }

  async function handleDeleteTask(taskId: string) {
    try {
      await removeTask(taskId);
    } catch (error) {
      Alert.alert("Delete failed", error instanceof Error ? error.message : "Unable to delete the task.");
    }
  }

  const filteredTasks = useMemo(() => {
    const lowerCaseQuery = query.trim().toLowerCase();

    return tasks.filter((task) => {
      if (!lowerCaseQuery) {
        return true;
      }

      return [task.title, task.description ?? "", task.dueDate ?? ""].some((field) => field.toLowerCase().includes(lowerCaseQuery));
    });
  }, [query, tasks]);

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Tasks</Text>
            <Text style={styles.subtitle}>{taskCounts.active} tasks remaining</Text>
          </View>
          {toggleTheme ? (
            <Pressable onPress={toggleTheme} style={styles.toggleButton} accessibilityLabel="Toggle theme">
              <MaterialIcons name={isDarkMode ? "light-mode" : "dark-mode"} size={20} color={theme.colors.primary} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.searchWrap}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={18} color={theme.colors.textSubtle} />
            <TextInput
              placeholder="Search tasks"
              placeholderTextColor={theme.colors.textSubtle}
              value={query}
              onChangeText={setQuery}
              style={styles.searchInput}
            />
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Today's Focus</Text>
          <Text style={styles.summaryBody}>
            {taskCounts.active} tasks remaining
          </Text>
        </View>

        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="task-alt" size={54} color={theme.colors.border} />
            <Text style={styles.emptyTitle}>{tasks.length === 0 ? "All caught up!" : "No matching tasks"}</Text>
            <Text style={styles.emptyBody}>
              {tasks.length === 0
                ? "Enjoy your productivity. Tap the mic to record a new task."
                : "Try a different search term or clear the filter."}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filteredTasks.map((task) => (
              <View key={task.id} style={styles.taskCardWrap}>
                <TaskCard
                  onPress={(taskId) => navigation.navigate("TaskDetail", { taskId })}
                  onDelete={handleDeleteTask}
                  onToggle={handleToggleTask}
                  task={task}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <FloatingActionButton iconName="add" onPress={() => navigation.navigate("AddTask", {})} />
    </SafeAreaView>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.lg,
    alignItems: "center",
  },
  content: {
    width: "100%",
    maxWidth: 560,
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: theme.spacing.pageMargin,
    paddingBottom: 140,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceSoft,
  },
  title: {
    color: theme.colors.primary,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700",
    letterSpacing: -0.8,
    textAlign: "center",
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: theme.spacing.xs,
    textAlign: "center",
  },
  summaryCard: {
    width: "100%",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.cardPadding,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  summaryTitle: {
    color: theme.colors.text,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "700",
  },
  summaryBody: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  searchWrap: {
    width: "100%",
    marginBottom: theme.spacing.lg,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
    paddingVertical: 0,
  },
  list: {
    width: "100%",
    gap: theme.spacing.md,
  },
  taskCardWrap: {
    width: "100%",
  },
  emptyState: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
    paddingTop: 64,
    gap: theme.spacing.sm,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "700",
  },
  emptyBody: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  });
}
