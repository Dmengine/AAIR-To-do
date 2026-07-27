import React, { useMemo, useRef, useState } from "react";
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Audio } from "expo-av";
import { MaterialIcons } from "@expo/vector-icons";

import { theme } from "../theme";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { useTasks } from "../store/tasks/TaskContext";
import { requestMicrophonePermissionsAsync, startVoiceRecordingAsync, transcribeRecordingAsync } from "../services/voice";
import { splitDictation } from "../utils/splitDictation";
import { parseVoiceTaskTranscript } from "../utils/voiceTaskParser";

type AddTaskScreenProps = NativeStackScreenProps<RootStackParamList, "AddTask">;

export function AddTaskScreen({ navigation, route }: AddTaskScreenProps) {
  const { tasks, addTask, addTasksFromTranscript, updateTask } = useTasks();
  const editingTask = route.params?.taskId ? tasks.find((task) => task.id === route.params.taskId) : undefined;
  const isEditing = Boolean(editingTask);
  const [title, setTitle] = useState(editingTask?.title ?? route.params?.prefilledTitle ?? "");
  const [description, setDescription] = useState(editingTask?.description ?? "");
  const [dueDate, setDueDate] = useState(editingTask?.dueDate ?? "");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcriptPreview, setTranscriptPreview] = useState<string>(route.params?.prefilledTitle ?? editingTask?.title ?? "");
  const [isBusy, setIsBusy] = useState(false);
  const [audioLevel, setAudioLevel] = useState(-160);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const headerLabel = useMemo(() => {
    if (isListening) {
      return "Recording";
    }

    return isEditing ? "Edit Task" : "New Task";
  }, [isEditing, isListening]);

  function resetRecordingState() {
    setIsListening(false);
    setIsBusy(false);
    setAudioLevel(-160);
  }

  async function stopAndTranscribeRecording() {
    const activeRecording = recordingRef.current;
    if (!activeRecording) {
      resetRecordingState();
      return;
    }

    try {
      await activeRecording.stopAndUnloadAsync();
      const recordingUri = activeRecording.getURI();
      recordingRef.current = null;

      if (!recordingUri) {
        throw new Error("No recording file was created.");
      }

      const transcript = await transcribeRecordingAsync(recordingUri);
      if (!transcript) {
        throw new Error("No transcript returned from the voice service.");
      }

      setTranscriptPreview(transcript);
      const structuredTask = parseVoiceTaskTranscript(transcript);

      if (structuredTask.hasStructuredFields) {
        if (structuredTask.title) {
          setTitle(structuredTask.title);
        }

        if (structuredTask.description) {
          setDescription(structuredTask.description);
        }

        return;
      }

      const splitTranscript = splitDictation(transcript);

      if (splitTranscript.length === 1) {
        setTitle(splitTranscript[0]);
      } else {
        await addTasksFromTranscript(transcript);
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert("Voice input failed", error instanceof Error ? error.message : "Try again.");
    } finally {
      resetRecordingState();
    }
  }

  async function handleSave() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert("Task title required", "Add a short title before saving.");
      return;
    }

    try {
      if (isEditing && editingTask) {
        await updateTask(editingTask.id, {
          title: trimmedTitle,
          description,
          dueDate,
        });
      } else {
        await addTask({ title: trimmedTitle, description, dueDate }, "manual");
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert("Save failed", error instanceof Error ? error.message : "Unable to save task.");
    }
  }

  function handleDateChange(event: unknown, selectedDate?: Date) {
    setShowDatePicker(false);

    if (!selectedDate) {
      return;
    }

    const formattedDate = selectedDate.toISOString().slice(0, 10);
    setDueDate(formattedDate);
  }

  async function handleVoiceMode() {
    if (isListening) {
      await stopAndTranscribeRecording();
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
      recording = await startVoiceRecordingAsync((status) => {
        if (!status.isRecording) {
          return;
        }

        if (typeof status.metering === "number") {
          setAudioLevel(status.metering);
        }
      });
      recordingRef.current = recording;
      setIsListening(true);
      setTranscriptPreview("Listening for tasks...");
    } catch (error) {
      resetRecordingState();
      Alert.alert("Voice input unavailable", error instanceof Error ? error.message : "Try again.");
      if (recording) {
        recordingRef.current = null;
        void recording.stopAndUnloadAsync();
      }
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.topRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
            <MaterialIcons name="arrow-back" size={20} color={isListening ? theme.colors.surface : theme.colors.textMuted} />
          </Pressable>
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>{headerLabel}</Text>
            <Text style={styles.subtitle}>Capture your next task in seconds</Text>
          </View>
          <Pressable
            onPress={handleVoiceMode}
            style={[styles.iconButton, isListening && styles.iconButtonListening]}
            disabled={isBusy}
          >
            <MaterialIcons
              name={isListening ? "stop" : "mic"}
              size={20}
              color={isListening ? theme.colors.surface : theme.colors.textMuted}
            />
          </Pressable>
        </View>

        <View style={styles.voicePanel}>
          <View style={styles.voicePanelHeader}>
            <Text style={styles.caption}>Voice input</Text>
            <View style={styles.voiceBadge}>
              <Text style={styles.voiceBadgeText}>AI assisted</Text>
            </View>
          </View>
          {isListening ? (
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Recording now</Text>
            </View>
          ) : null}
          <Text style={styles.panelTitle}>{isListening ? "Listening now" : isEditing ? "Edit the task details below" : "Tap the mic to dictate one or more tasks"}</Text>
          <Text style={styles.panelBody}>
            {isListening
              ? "Speak naturally. Tap stop when you finish and the app will transcribe your voice into text, then try to map title and description from phrases like 'the title is' and 'the description is'."
              : isEditing
                ? "Update the fields below, then save your changes."
                : "Natural dictation is split into separate tasks. Example: “Buy provisions and call mom.”"}
          </Text>
          {isListening ? (
            <View style={styles.levelWrap}>
              <View style={[styles.levelBar, styles.levelBarQuiet, { opacity: audioLevel > -50 ? 0.35 : 1 }]} />
              <View style={[styles.levelBar, styles.levelBarMedium, { opacity: audioLevel > -35 ? 1 : 0.35 }]} />
              <View style={[styles.levelBar, styles.levelBarTall, { opacity: audioLevel > -25 ? 1 : 0.35 }]} />
              <View style={[styles.levelBar, styles.levelBarMedium, { opacity: audioLevel > -35 ? 1 : 0.35 }]} />
              <View style={[styles.levelBar, styles.levelBarQuiet, { opacity: audioLevel > -50 ? 0.35 : 1 }]} />
            </View>
          ) : null}
          <Text style={styles.transcript}>{transcriptPreview || "Your transcript will appear here."}</Text>
          {isListening ? (
            <Pressable onPress={stopAndTranscribeRecording} style={styles.stopButton}>
              <MaterialIcons name="stop" size={18} color={theme.colors.surface} />
              <Text style={styles.stopButtonText}>Stop & transcribe</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.formCard}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Task title</Text>
            <TextInput
              placeholder="Remind me to review the quarterly budget..."
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
            <Pressable onPress={() => setShowDatePicker(true)} style={styles.input}>
              <Text style={[styles.dateText, !dueDate && styles.datePlaceholder]}>
                {dueDate || "Select a date"}
              </Text>
            </Pressable>
            {showDatePicker ? (
              <DateTimePicker
                value={dueDate ? new Date(`${dueDate}T12:00:00`) : new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            ) : null}
          </View>
        </View>

        <Pressable onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>{isEditing ? "Save changes" : "Save task"}</Text>
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
    gap: theme.spacing.sm,
  },
  headerTextWrap: {
    flex: 1,
    alignItems: "center",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceSoft,
  },
  iconButtonListening: {
    backgroundColor: theme.colors.destructive,
  },
  icon: {
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "700",
    color: theme.colors.primary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  voicePanel: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.cardPadding,
    gap: theme.spacing.sm,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  voicePanelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.destructive,
  },
  statusText: {
    color: theme.colors.destructive,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  voiceBadge: {
    backgroundColor: theme.colors.primaryTint,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
  },
  voiceBadgeText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
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
  levelWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 6,
    height: 28,
    marginTop: 4,
  },
  levelBar: {
    width: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.destructive,
  },
  levelBarQuiet: {
    height: 10,
  },
  levelBarMedium: {
    height: 16,
  },
  levelBarTall: {
    height: 24,
  },
  stopButton: {
    marginTop: theme.spacing.sm,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.colors.destructive,
    borderRadius: theme.radius.full,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  stopButtonText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: "700",
  },
  formCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.cardPadding,
    gap: theme.spacing.lg,
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
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.lg,
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  dateText: {
    color: theme.colors.text,
    fontSize: 16,
  },
  datePlaceholder: {
    color: theme.colors.textSubtle,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  saveButton: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.full,
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
