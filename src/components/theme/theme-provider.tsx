"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

import { themeProviderConfig } from "@/lib/theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider {...themeProviderConfig}>{children}</NextThemesProvider>
  );
}
