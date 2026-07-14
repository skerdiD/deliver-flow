"use client";

import { useDocumentTheme } from "@/components/theme/use-document-theme";

export function DashboardTheme({ children }: { children: React.ReactNode }) {
  const theme = useDocumentTheme();

  return (
    <div
      className={theme === "dark" ? "dashboard-theme dark" : "dashboard-theme"}
      data-dashboard-theme={theme}
    >
      {children}
    </div>
  );
}
