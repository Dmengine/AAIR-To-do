import React, { createContext, useContext, useMemo, useState } from "react";

export const lightTheme = {
  colors: {
    background: "#f7f9fb",
    surface: "#ffffff",
    surfaceSoft: "#f2f4f6",
    border: "#c7c4d8",
    borderStrong: "#e0e3e5",
    text: "#191c1e",
    textMuted: "#464555",
    textSubtle: "#777587",
    primary: "#3525cd",
    primarySoft: "#4f46e5",
    primaryTint: "#dad7ff",
    secondary: "#006c49",
    secondaryTint: "#6cf8bb",
    destructive: "#ba1a1a",
    destructiveTint: "#ffdad6",
    success: "#006c49",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    pageMargin: 20,
    cardPadding: 16,
  },
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },
  fonts: {
    display: "System",
    headline: "System",
    body: "System",
    mono: "System",
  },
} as const;

export const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: "#0f172a",
    surface: "#111827",
    surfaceSoft: "#1f2937",
    border: "#374151",
    borderStrong: "#4b5563",
    text: "#f9fafb",
    textMuted: "#d1d5db",
    textSubtle: "#9ca3af",
    primary: "#8b5cf6",
    primarySoft: "#7c3aed",
    primaryTint: "#312e81",
    secondary: "#34d399",
    secondaryTint: "#14532d",
    destructive: "#fb7185",
    destructiveTint: "#7f1d1d",
    success: "#34d399",
  },
} as const;

export type AppTheme = typeof lightTheme | typeof darkTheme;

type ThemeContextValue = {
  theme: typeof lightTheme | typeof darkTheme;
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const value = useMemo(
    () => ({
      theme: isDarkMode ? darkTheme : lightTheme,
      isDarkMode,
      toggleTheme: () => setIsDarkMode((current) => !current),
    }),
    [isDarkMode],
  );

  return React.createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}

export const theme = lightTheme;
