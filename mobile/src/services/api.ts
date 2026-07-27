import Constants from "expo-constants";
import { Platform } from "react-native";

const DEFAULT_API_URL = "http://localhost:4000";

export function getApiUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (envUrl && !isLoopbackUrl(envUrl)) {
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
    return getPlatformFallbackUrl();
  }

  const hostWithoutScheme = hostUri.replace(/^https?:\/\//, "").replace(/^exp:\/\//, "");
  const hostName = hostWithoutScheme.split(":")[0]?.trim();
  if (!hostName) {
    return getPlatformFallbackUrl();
  }

  return `http://${hostName}:4000`;
}

function getPlatformFallbackUrl(): string {
  if (Platform.OS === "android") {
    return "http://10.0.2.2:4000";
  }

  return DEFAULT_API_URL;
}

function isLoopbackUrl(value: string): boolean {
  return /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(value);
}