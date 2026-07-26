import React, { useMemo, useState } from "react";
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Audio } from "expo-av";

import { theme } from "../theme";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { useTasks } from "../store/tasks/TaskContext";
import { requestMicrophonePermissionsAsync, startVoiceRecordingAsync, transcribeRecordingAsync } from "../services/voice";

type AddTaskScreenProps = NativeStackScreenProps<RootStackParamList, "AddTask">;

export function AddTaskScreen({ navigation, route }: AddTaskScreenProps) {
  const { addTask, addTasksFromTranscript } = useTasks();
  const [title, setTitle] = useState(route.params?.prefilledTitle ?? "");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isListening, setIsListening] = useState(Boolean(route.params?.voiceMode));
  const [transcriptPreview, setTranscriptPreview] = useState<string>(route.params?.prefilledTitle ?? "");
  const [isBusy, setIsBusy] = useState(false);

  const headerLabel = useMemo(() => (isListening ? "Listening" : "New Task"), [isListening]);

  async function handleSave() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert("Task title required", "Add a short title before saving.");
      return;
    }

    addTask({ title: trimmedTitle, description, dueDate }, "manual");
    navigation.goBack();
  }

  async function handleVoiceMode() {
    if (isListening) {
      return;
    }

    setIsBusy(true);
    const hasPermission = await requestMicrophonePermissionsAsync();
    if (!hasPermission) {
      setIsBusy(false);
      Alert.alert("Microphone access required", "Allow access to use voice input.");
      return;
    }

    let recording: Audio.Recording | null = null;
    try {
      recording = await startVoiceRecordingAsync();
      setIsListening(true);
      setTranscriptPreview("Listening for tasks...");

      const recordingRef = recording;
      setTimeout(async () => {
        try {
          await recordingRef.stopAndUnloadAsync();
          const recordingUri = recordingRef.getURI();
          if (!recordingUri) {
            throw new Error("No recording file was created.");
          }

          const transcript = await transcribeRecordingAsync(recordingUri);
          if (!transcript) {
            throw new Error("No transcript returned from the voice service.");
          }

          setTranscriptPreview(transcript);
          const splitTranscript = transcript
            .split(/(?:,|\.|!|\?| and then | then | and )/i)
            .map((segment) => segment.trim())
            .filter(Boolean);

          if (splitTranscript.length === 1) {
            setTitle(splitTranscript[0]);
          } else {
            addTasksFromTranscript(transcript);
            navigation.goBack();
          }
        } catch (error) {
          Alert.alert("Voice input failed", error instanceof Error ? error.message : "Try again.");
        } finally {
          setIsListening(false);
          setIsBusy(false);
        }
      }, 1800);
    } catch (error) {
      setIsListening(false);
      setIsBusy(false);
      Alert.alert("Voice input unavailable", error instanceof Error ? error.message : "Try again.");
      if (recording) {
        void recording.stopAndUnloadAsync();
      }
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.topRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Text style={styles.icon}>‹</Text>
          </Pressable>
          <Text style={styles.title}>{headerLabel}</Text>
          <Pressable onPress={handleVoiceMode} style={styles.iconButton} disabled={isBusy}>
            <Text style={styles.icon}>{isListening ? "■" : "🎤"}</Text>
          </Pressable>
        </View>

        <View style={styles.voicePanel}>
          <Text style={styles.caption}>Voice input</Text>
          <Text style={styles.panelTitle}>{isListening ? "Listening now" : "Tap the mic to dictate one or more tasks"}</Text>
          <Text style={styles.panelBody}>
            Natural dictation is split into separate tasks. Example: “Buy provisions and call mom.”
          </Text>
          <Text style={styles.transcript}>{transcriptPreview || "Your transcript will appear here."}</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Task title</Text>
          <TextInput
            placeholder="What needs to be done?"
            placeholderTextColor={theme.colors.textSubtle}
            style={styles.input}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            placeholder="Add context or details"
            placeholderTextColor={theme.colors.textSubtle}
            multiline
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Due date</Text>
          <TextInput
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.colors.textSubtle}
            style={styles.input}
            value={dueDate}
            onChangeText={setDueDate}
          />
        </View>

        <Pressable onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save task</Text>
        </Pressable>

        <Pressable onPress={() => navigation.goBack()} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: theme.spacing.pageMargin,
    paddingTop: theme.spacing.md,
    paddingBottom: 96,
    gap: theme.spacing.lg,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceSoft,
  },
  icon: {
    fontSize: 20,
    color: theme.colors.textMuted,
    fontWeight: "700",
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  voicePanel: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.cardPadding,
    gap: theme.spacing.sm,
  },
  caption: {
    color: theme.colors.textSubtle,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  panelTitle: {
    color: theme.colors.text,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "700",
  },
  panelBody: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  transcript: {
    color: theme.colors.primary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
  fieldGroup: {
    gap: theme.spacing.sm,
  },
  fieldLabel: {
    color: theme.colors.textSubtle,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  input: {
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 2,
    color: theme.colors.text,
    fontSize: 18,
    lineHeight: 26,
    paddingVertical: theme.spacing.md,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  saveButton: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 999,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  saveButtonText: {
    color: theme.colors.surface,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "700",
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: theme.spacing.md,
  },
  cancelButtonText: {
    color: theme.colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
});
