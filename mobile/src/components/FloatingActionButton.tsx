import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "../theme";

type FloatingActionButtonProps = {
  onPress: () => void;
  listening?: boolean;
};

export function FloatingActionButton({ onPress, listening = false }: FloatingActionButtonProps) {
  return (
    <View pointerEvents="box-none" style={styles.container}>
      <Pressable
        accessibilityLabel={listening ? "Stop voice input" : "Start voice input"}
        accessibilityRole="button"
        onPress={onPress}
        style={[styles.fab, listening && styles.fabListening]}
      >
        <Text style={styles.icon}>{listening ? "■" : "🎤"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
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
  icon: {
    color: theme.colors.surface,
    fontSize: 22,
    lineHeight: 24,
    fontWeight: "700",
  },
});
