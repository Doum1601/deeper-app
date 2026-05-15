export const darkTheme = {
  mode: "dark" as const,
  baseBg: "#050505",
  surface: "#121212",
  surfaceElevated: "#1A1A1A",
  border: "rgba(255,255,255,0.10)",
  borderStrong: "rgba(255,255,255,0.18)",
  textPrimary: "#F3F4F6",
  textSecondary: "#9CA3AF",
  textMuted: "#6B7280",
  accentPrimary: "#00E5FF",
  accentSecondary: "#FFB300",
  statusSuccess: "#00FF66",
  statusError: "#FF3B30",
  statusWarning: "#FFB300",
  overlay: "rgba(0,0,0,0.7)",
};

export const lightTheme = {
  mode: "light" as const,
  baseBg: "#FAFAFA",
  surface: "#FFFFFF",
  surfaceElevated: "#F3F4F6",
  border: "rgba(0,0,0,0.10)",
  borderStrong: "rgba(0,0,0,0.18)",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  accentPrimary: "#0055FF",
  accentSecondary: "#D97706",
  statusSuccess: "#10B981",
  statusError: "#EF4444",
  statusWarning: "#F59E0B",
  overlay: "rgba(0,0,0,0.5)",
};

export type ThemeColors = typeof darkTheme;
