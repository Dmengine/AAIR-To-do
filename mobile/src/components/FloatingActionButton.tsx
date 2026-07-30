import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { useTheme } from "../theme";

type FloatingActionButtonProps = {
  onPress: () => void;
  listening?: boolean;
  iconName?: "add" | "mic" | "stop";
};

export function FloatingActionButton({ onPress, listening = false, iconName }: FloatingActionButtonProps) {
  const { theme } = useTheme();
  const resolvedIconName = iconName ?? (listening ? "stop" : "mic");
  const accessibilityLabel =
    resolvedIconName === "add" ? "Add task" : listening ? "Stop voice input" : "Start voice input";

  return (
    <View pointerEvents="box-none" style={styles(theme).container}>
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        onPress={onPress}
        style={[styles(theme).fab, listening && styles(theme).fabListening]}
      >
        <MaterialIcons name={resolvedIconName} size={24} color={theme.colors.surface} />
      </Pressable>
    </View>
  );
}

function styles(theme: ReturnType<typeof useTheme>["theme"]) {
  return StyleSheet.create({
  container: {
    position: "absolute",
    right: 24,
    bottom: 24,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primarySoft,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 8,
  },
  fabListening: {
    backgroundColor: theme.colors.destructive,
  },
});
}
