import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const sourceExtensions = new Set([".ts", ".tsx"]);

export function getClientModuleFiles(root: string): string[] {
  const files: string[] = [];

  walk(root, files);

  return files.filter((filePath) => {
    const source = readFileSync(filePath, "utf8");
    return source.startsWith('"use client";') || source.startsWith("'use client';");
  });
}

function walk(directory: string, files: string[]) {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    const stat = statSync(path);

    if (stat.isDirectory()) {
      walk(path, files);
      continue;
    }

    if (sourceExtensions.has(getExtension(path))) {
      files.push(path);
    }
  }
}

function getExtension(path: string) {
  const lastDotIndex = path.lastIndexOf(".");

  if (lastDotIndex === -1) {
    return "";
  }

  return path.slice(lastDotIndex);
}
