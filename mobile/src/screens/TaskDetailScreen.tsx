import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme, type AppTheme } from "../theme";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { useTasks } from "../store/tasks/TaskContext";

type TaskDetailScreenProps = NativeStackScreenProps<RootStackParamList, "TaskDetail">;

export function TaskDetailScreen({ navigation, route }: TaskDetailScreenProps) {
  const { tasks } = useTasks();
  const { theme } = useTheme();
  const task = useMemo(() => tasks.find((item) => item.id === route.params.taskId), [route.params.taskId, tasks]);

  const styles = createStyles(theme);

  if (!task) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.content}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={20} color={theme.colors.textMuted} />
          </Pressable>
          <View style={styles.emptyState}>
            <MaterialIcons name="task-alt" size={56} color={theme.colors.border} />
            <Text style={styles.title}>Task not found</Text>
            <Text style={styles.body}>This task may have been deleted.</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={20} color={theme.colors.textMuted} />
          </Pressable>
          <View style={styles.headerTextWrap}>
            <Text style={styles.kicker}>Task details</Text>
            <Text style={styles.screenTitle}>Details</Text>
          </View>
          <Pressable onPress={() => navigation.navigate("AddTask", { taskId: task.id })} style={styles.editButton}>
            <MaterialIcons name="edit" size={18} color={theme.colors.primary} />
          </Pressable>
        </View>

        <View style={styles.detailCard}>
          <View style={styles.statusRow}>
            <View style={[styles.statusPill, task.completed ? styles.statusPillDone : styles.statusPillActive]}>
              <Text style={[styles.statusText, task.completed ? styles.statusTextDone : styles.statusTextActive]}>
                {task.completed ? "Completed" : "Active"}
              </Text>
            </View>
            <Text style={styles.sourceText}>{task.source}</Text>
          </View>

          <Text style={styles.taskTitle}>{task.title}</Text>

          {task.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Description</Text>
              <Text style={styles.sectionBody}>{task.description}</Text>
            </View>
          ) : null}

          {task.dueDate ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Due date</Text>
              <Text style={styles.sectionBody}>{formatDate(task.dueDate)}</Text>
            </View>
          ) : null}

          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Text style={styles.sectionLabel}>Created</Text>
              <Text style={styles.sectionBody}>{formatDateTime(task.createdAt)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.sectionLabel}>Updated</Text>
              <Text style={styles.sectionBody}>{formatDateTime(task.updatedAt)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDate(value: string): string {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

function formatDateTime(value: string): string {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.pageMargin,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceSoft,
  },
  backButtonSpacer: {
    width: 40,
    height: 40,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceSoft,
  },
  headerTextWrap: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
  },
  kicker: {
    color: theme.colors.textMuted,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  screenTitle: {
    color: theme.colors.primary,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700",
    marginTop: 2,
  },
  detailCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.cardPadding,
    gap: theme.spacing.lg,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusPillDone: {
    backgroundColor: theme.colors.secondaryTint,
  },
  statusPillActive: {
    backgroundColor: theme.colors.primarySoft,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  statusTextDone: {
    color: theme.colors.secondary,
  },
  statusTextActive: {
    color: theme.colors.primary,
  },
  sourceText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  taskTitle: {
    color: theme.colors.text,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "700",
  },
  section: {
    gap: 6,
  },
  sectionLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  sectionBody: {
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 24,
  },
  metaGrid: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  metaItem: {
    flex: 1,
    gap: 6,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: 32,
  },
  title: {
    color: theme.colors.text,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "700",
  },
  body: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  });
}
