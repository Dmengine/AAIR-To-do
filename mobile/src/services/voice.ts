import { Audio } from "expo-av";

const DEFAULT_API_URL = "http://localhost:4000";

export async function requestMicrophonePermissionsAsync(): Promise<boolean> {
  const permission = await Audio.requestPermissionsAsync();
  return permission.status === "granted";
}

export async function startVoiceRecordingAsync() {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
    interruptionModeIOS: 1,
    interruptionModeAndroid: 1,
    shouldDuckAndroid: true,
    staysActiveInBackground: false,
  });

  const recording = new Audio.Recording();
  await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
  await recording.startAsync();
  return recording;
}

export async function transcribeRecordingAsync(recordingUri: string): Promise<string> {
  const formData = new FormData();
  formData.append("audio", {
    uri: recordingUri,
    name: "voice.m4a",
    type: "audio/m4a",
  } as unknown as Blob);

  const response = await fetch(`${getApiUrl()}/voice/transcribe`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Voice transcription failed with status ${response.status}`);
  }

  const payload = (await response.json()) as { transcript?: string };
  return payload.transcript?.trim() ?? "";
}

export function getApiUrl(): string {
  return process.env.EXPO_PUBLIC_API_URL?.trim() || DEFAULT_API_URL;
}
