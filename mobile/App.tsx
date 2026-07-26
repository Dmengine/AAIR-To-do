import "react-native-gesture-handler";

import React from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AppNavigator } from "./src/navigation/AppNavigator";
import { theme } from "./src/theme";
import { TaskProvider, useTasks } from "./src/store/tasks/TaskContext";

function LoadingScreen() {
  return (
    <SafeAreaView style={styles.loadingScreen}>
      <ActivityIndicator color={theme.colors.primary} size="large" />
      <Text style={styles.loadingText}>Loading tasks…</Text>
    </SafeAreaView>
  );
}

function AppContent() {
  const { isHydrated } = useTasks();

  if (!isHydrated) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: theme.colors.background,
          card: theme.colors.background,
          primary: theme.colors.primary,
          text: theme.colors.text,
          border: theme.colors.borderStrong,
          notification: theme.colors.destructive,
        },
      }}
    >
      <AppNavigator />
      <StatusBar style="dark" />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <TaskProvider>
        <AppContent />
      </TaskProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
    gap: 12,
  },
  loadingText: {
    color: theme.colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
});
