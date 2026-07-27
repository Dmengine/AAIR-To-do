import React, { useMemo, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { FloatingActionButton } from "../components/FloatingActionButton";
import { TaskCard } from "../components/TaskCard";
import { theme } from "../theme";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { useTasks } from "../store/tasks/TaskContext";

type TaskListScreenProps = NativeStackScreenProps<RootStackParamList, "TaskList">;

export function TaskListScreen({ navigation }: TaskListScreenProps) {
  const { tasks, taskCounts, toggleTask, removeTask } = useTasks();
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

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Tasks</Text>
            <Text style={styles.subtitle}>{taskCounts.active} tasks remaining</Text>
          </View>
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
          <FlatList
            style={styles.list}
            contentContainerStyle={styles.list}
            data={filteredTasks}
            keyExtractor={(task) => task.id}
            renderItem={({ item }) => (
              <TaskCard
                onPress={(taskId) => navigation.navigate("TaskDetail", { taskId })}
                onDelete={handleDeleteTask}
                onToggle={handleToggleTask}
                task={item}
              />
            )}
            ItemSeparatorComponent={() => <View style={{ height: theme.spacing.md }} />}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <FloatingActionButton iconName="add" onPress={() => navigation.navigate("AddTask", {})} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    paddingHorizontal: theme.spacing.pageMargin,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  headerContent: {
    alignItems: "center",
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
    flex: 1,
    paddingBottom: 120,
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
