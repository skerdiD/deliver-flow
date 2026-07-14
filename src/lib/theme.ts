export const themeProviderConfig = {
  attribute: "class",
  defaultTheme: "light",
  disableTransitionOnChange: true,
  enableSystem: false,
} as const;

export type AppTheme = "light" | "dark";

export function getThemeToggleState(theme: string | undefined) {
  const isDark = theme === "dark";

  return {
    icon: isDark ? "sun" : "moon",
    label: isDark ? "Switch to light mode" : "Switch to dark mode",
    nextTheme: isDark ? "light" : "dark",
  } as const;
}
