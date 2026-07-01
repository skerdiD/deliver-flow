export const PROJECT_FILES_BUCKET = "project-files";

export function sanitizeProjectFileName(fileName: string) {
  const sanitized = fileName
    .trim()
    .replace(/[/\\]+/g, "-")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/-+\./g, ".")
    .replace(/^[.-]+|[.-]+$/g, "");

  return sanitized || "file";
}

export function buildProjectFileStoragePath(input: {
  projectId: string;
  fileName: string;
  timestamp?: number;
}) {
  const timestamp = input.timestamp ?? Date.now();
  const safeFileName = sanitizeProjectFileName(input.fileName);

  return `projects/${input.projectId}/${timestamp}-${safeFileName}`;
}
