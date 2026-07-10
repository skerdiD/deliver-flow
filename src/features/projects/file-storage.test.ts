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
        extension: ".pdf",
        objectId: "f0f0f0f0-0000-4000-8000-000000000001",
        projectId: "70000000-0000-4000-8000-000000000002",
        workspaceId: "60000000-0000-4000-8000-000000000001",
      }),
    ).toBe(
      "workspaces/60000000-0000-4000-8000-000000000001/projects/70000000-0000-4000-8000-000000000002/f0f0f0f0-0000-4000-8000-000000000001/file.pdf",
    );
  });
});
