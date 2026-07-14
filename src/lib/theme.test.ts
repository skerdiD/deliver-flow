import { describe, expect, it } from "vitest";

import { getThemeToggleState, themeProviderConfig } from "@/lib/theme";

describe("theme configuration", () => {
  it("defaults to light without following the operating system", () => {
    expect(themeProviderConfig).toMatchObject({
      attribute: "data-theme",
      defaultTheme: "light",
      disableTransitionOnChange: true,
      enableSystem: false,
    });
  });

  it("returns accessible, reversible toggle states", () => {
    expect(getThemeToggleState("light")).toEqual({
      icon: "moon",
      label: "Switch to dark mode",
      nextTheme: "dark",
    });
    expect(getThemeToggleState("dark")).toEqual({
      icon: "sun",
      label: "Switch to light mode",
      nextTheme: "light",
    });
  });
});
