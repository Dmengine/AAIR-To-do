import { Audio } from "expo-av";
import { getApiUrl } from "./api";

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
    const apiUrl = getApiUrl();
    response = await fetch(`${apiUrl}/voice/transcribe`, {
      method: "POST",
      body: formData,
    });
  } catch {
    const apiUrl = getApiUrl();
    throw new Error(`Unable to reach the transcription server at ${apiUrl}. If you are on a physical device, set EXPO_PUBLIC_API_URL to your computer's LAN IP, for example http://192.168.1.50:4000. On Android emulators, the app uses http://10.0.2.2:4000 automatically.`);
  }

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(errorPayload?.error ?? `Voice transcription failed with status ${response.status}`);
  }

  const payload = (await response.json()) as { transcript?: string };
  return payload.transcript?.trim() ?? "";
}
