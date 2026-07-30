import "react-native-gesture-handler";

import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { AppNavigator } from "./src/navigation/AppNavigator";
import { ThemeProvider, useTheme } from "./src/theme";
import { TaskProvider, useTasks } from "./src/store/tasks/TaskContext";

function LoadingScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.loadingScreen, { backgroundColor: theme.colors.background }]}> 
      <ActivityIndicator color={theme.colors.primary} size="large" />
      <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>Loading tasks…</Text>
    </SafeAreaView>
  );
}

function AppContent() {
  const { isHydrated } = useTasks();
  const { theme, isDarkMode, toggleTheme } = useTheme();

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
      <AppNavigator toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      <StatusBar style={isDarkMode ? "light" : "dark"} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.flex}>
        <ThemeProvider>
          <TaskProvider>
            <AppContent />
          </TaskProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    lineHeight: 24,
  },
});
