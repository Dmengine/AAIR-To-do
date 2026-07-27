import { Audio } from "expo-av";
import Constants from "expo-constants";

const DEFAULT_API_URL = "http://localhost:4000";

export async function requestMicrophonePermissionsAsync(): Promise<boolean> {
  const permission = await Audio.requestPermissionsAsync();
  return permission.status === "granted";
}

export async function startVoiceRecordingAsync(onStatusUpdate?: (status: Audio.RecordingStatus) => void) {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
    interruptionModeIOS: 1,
    interruptionModeAndroid: 1,
    shouldDuckAndroid: true,
    staysActiveInBackground: false,
  });

  const recording = new Audio.Recording();
  recording.setOnRecordingStatusUpdate((status) => {
    onStatusUpdate?.(status);
  });
  recording.setProgressUpdateInterval(100);
  await recording.prepareToRecordAsync({
    ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  });
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

  let response: Response;
  try {
    response = await fetch(`${getApiUrl()}/voice/transcribe`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new Error(
      `Unable to reach the transcription server at ${getApiUrl()}. Make sure the API is running and your mobile device can reach your computer on port 4000.`,
    );
  }

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(errorPayload?.error ?? `Voice transcription failed with status ${response.status}`);
  }

  const payload = (await response.json()) as { transcript?: string };
  return payload.transcript?.trim() ?? "";
}

export function getApiUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (envUrl) {
    return envUrl;
  }

  const hostUrl = getDevelopmentHostUrl();
  if (hostUrl) {
    return hostUrl;
  }

  return DEFAULT_API_URL;
}

function getDevelopmentHostUrl(): string | null {
  const hostUri = Constants.expoConfig?.hostUri?.trim();
  if (!hostUri) {
    return null;
  }

  const hostWithoutScheme = hostUri.replace(/^https?:\/\//, "").replace(/^exp:\/\//, "");
  const hostName = hostWithoutScheme.split(":")[0]?.trim();
  if (!hostName) {
    return null;
  }

  return `http://${hostName}:4000`;
}
