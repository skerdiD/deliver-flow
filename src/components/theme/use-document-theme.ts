"use client";

import { useSyncExternalStore } from "react";

function getDocumentTheme(): "light" | "dark" {
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

function subscribeToDocumentTheme(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  return () => observer.disconnect();
}

export function useDocumentTheme() {
  return useSyncExternalStore(
    subscribeToDocumentTheme,
    getDocumentTheme,
    () => "light",
  );
}
