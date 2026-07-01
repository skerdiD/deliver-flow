import { describe, expect, it } from "vitest";

import {
  PROJECT_FILES_BUCKET,
  buildProjectFileStoragePath,
  sanitizeProjectFileName,
} from "@/features/projects/file-storage";

describe("project file storage helpers", () => {
  it("uses the private project files bucket convention", () => {
    expect(PROJECT_FILES_BUCKET).toBe("project-files");
  });

  it("sanitizes unsafe file names without trusting path input", () => {
    expect(sanitizeProjectFileName("../Final Brief (v2).pdf")).toBe(
      "Final-Brief-v2.pdf",
    );
    expect(sanitizeProjectFileName("///")).toBe("file");
  });

  it("builds a structured project storage path", () => {
    expect(
      buildProjectFileStoragePath({
        projectId: "70000000-0000-4000-8000-000000000002",
        fileName: "Final Brief.pdf",
        timestamp: 1_788_222_000_000,
      }),
    ).toBe(
      "projects/70000000-0000-4000-8000-000000000002/1788222000000-Final-Brief.pdf",
    );
  });
});
