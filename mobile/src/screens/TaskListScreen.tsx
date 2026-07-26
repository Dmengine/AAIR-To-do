import React, { useMemo, useState } from "react";
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { FloatingActionButton } from "../components/FloatingActionButton";
import { TaskCard } from "../components/TaskCard";
import { theme } from "../theme";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { useTasks } from "../store/tasks/TaskContext";

type TaskListScreenProps = NativeStackScreenProps<RootStackParamList, "TaskList">;

export function TaskListScreen({ navigation }: TaskListScreenProps) {
  const { tasks, taskCounts, toggleTask, removeTask } = useTasks();
  const [query, setQuery] = useState("");

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
      <View style={styles.header}>
        <View>
          <Text style={styles.screenLabel}>Today</Text>
          <Text style={styles.title}>Tasks</Text>
        </View>

        <Pressable onPress={() => navigation.navigate("AddTask", {})} style={styles.addShortcut}>
          <Text style={styles.addShortcutText}>+</Text>
        </Pressable>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Productive, clean, and synced locally.</Text>
        <Text style={styles.summaryBody}>{taskCounts.active} active, {taskCounts.completed} complete, {taskCounts.total} total</Text>
      </View>

      <View style={styles.searchWrap}>
        <Text style={styles.searchLabel}>Search</Text>
        <TextInput
          placeholder="Filter tasks"
          placeholderTextColor={theme.colors.textSubtle}
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
      </View>

      {filteredTasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>○</Text>
          <Text style={styles.emptyTitle}>{tasks.length === 0 ? "All caught up" : "No matching tasks"}</Text>
          <Text style={styles.emptyBody}>
            {tasks.length === 0
              ? "Tap the mic to dictate a task or use the add screen for manual entry."
              : "Try a different search term or clear the filter."}
          </Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={filteredTasks}
          keyExtractor={(task) => task.id}
          renderItem={({ item }) => <TaskCard onDelete={removeTask} onToggle={toggleTask} task={item} />}
          ItemSeparatorComponent={() => <View style={{ height: theme.spacing.md }} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FloatingActionButton onPress={() => navigation.navigate("AddTask", { voiceMode: true })} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.pageMargin,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  screenLabel: {
    color: theme.colors.textSubtle,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: theme.colors.primary,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700",
    letterSpacing: -0.8,
  },
  addShortcut: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  addShortcutText: {
    fontSize: 24,
    color: theme.colors.primary,
    fontWeight: "700",
    marginTop: -2,
  },
  summaryCard: {
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
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  searchLabel: {
    color: theme.colors.textSubtle,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  searchInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 16,
  },
  list: {
    paddingBottom: 120,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
    paddingTop: 64,
    gap: theme.spacing.sm,
  },
  emptyIcon: {
    fontSize: 54,
    color: theme.colors.border,
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
