const FILE_NAME_CONTROL_CHARACTERS =
  /[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2060\ufeff]/g;

export const PROJECT_FILES_BUCKET = "project-files";
export const PROJECT_FILE_DEFAULT_MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
export const PROJECT_FILE_DEFAULT_SIGNED_URL_TTL_SECONDS = 120;
export const PROJECT_FILE_DEFAULT_WORKSPACE_QUOTA_BYTES = 1024 * 1024 * 1024;
export const PROJECT_FILE_MAX_FILES_PER_UPLOAD = 1;

export const PROJECT_FILE_DANGEROUS_EXTENSIONS = new Set([
  ".apk",
  ".app",
  ".bat",
  ".cmd",
  ".com",
  ".cjs",
  ".deb",
  ".dmg",
  ".exe",
  ".hta",
  ".htm",
  ".html",
  ".jar",
  ".js",
  ".jse",
  ".mjs",
  ".msi",
  ".php",
  ".pkg",
  ".ps1",
  ".rpm",
  ".scr",
  ".sh",
]);

type SupportedProjectFileExtension =
  | ".csv"
  | ".docx"
  | ".gif"
  | ".jpeg"
  | ".jpg"
  | ".pdf"
  | ".png"
  | ".txt"
  | ".webp"
  | ".xlsx"
  | ".zip";

type ProjectFileMagicType =
  | "gif"
  | "jpeg"
  | "pdf"
  | "png"
  | "text"
  | "unknown"
  | "webp"
  | "zip";

type ProjectFileRule = {
  defaultMimeType: string;
  label: string;
  mimeTypes: readonly string[];
  magicTypes: readonly ProjectFileMagicType[];
};

const PROJECT_FILE_RULES: Record<
  SupportedProjectFileExtension,
  ProjectFileRule
> = {
  ".csv": {
    defaultMimeType: "text/csv",
    label: "CSV",
    mimeTypes: [
      "application/csv",
      "application/vnd.ms-excel",
      "text/csv",
      "text/plain",
    ],
    magicTypes: ["text"],
  },
  ".docx": {
    defaultMimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    label: "DOCX",
    mimeTypes: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    magicTypes: ["zip"],
  },
  ".gif": {
    defaultMimeType: "image/gif",
    label: "GIF",
    mimeTypes: ["image/gif"],
    magicTypes: ["gif"],
  },
  ".jpeg": {
    defaultMimeType: "image/jpeg",
    label: "JPEG",
    mimeTypes: ["image/jpeg"],
    magicTypes: ["jpeg"],
  },
  ".jpg": {
    defaultMimeType: "image/jpeg",
    label: "JPG",
    mimeTypes: ["image/jpeg"],
    magicTypes: ["jpeg"],
  },
  ".pdf": {
    defaultMimeType: "application/pdf",
    label: "PDF",
    mimeTypes: ["application/pdf"],
    magicTypes: ["pdf"],
  },
  ".png": {
    defaultMimeType: "image/png",
    label: "PNG",
    mimeTypes: ["image/png"],
    magicTypes: ["png"],
  },
  ".txt": {
    defaultMimeType: "text/plain",
    label: "TXT",
    mimeTypes: ["text/plain"],
    magicTypes: ["text"],
  },
  ".webp": {
    defaultMimeType: "image/webp",
    label: "WEBP",
    mimeTypes: ["image/webp"],
    magicTypes: ["webp"],
  },
  ".xlsx": {
    defaultMimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    label: "XLSX",
    mimeTypes: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    magicTypes: ["zip"],
  },
  ".zip": {
    defaultMimeType: "application/zip",
    label: "ZIP",
    mimeTypes: ["application/x-zip-compressed", "application/zip"],
    magicTypes: ["zip"],
  },
};

const PROJECT_FILE_ALLOWED_EXTENSIONS = Object.keys(
  PROJECT_FILE_RULES,
) as SupportedProjectFileExtension[];

export const PROJECT_FILE_ACCEPT_ATTRIBUTE =
  PROJECT_FILE_ALLOWED_EXTENSIONS.join(",");

export const PROJECT_FILE_ALLOWED_TYPE_LABELS =
  PROJECT_FILE_ALLOWED_EXTENSIONS.map(
    (extension) => PROJECT_FILE_RULES[extension].label,
  );

export type ValidatedProjectFile = {
  displayFileName: string;
  extension: SupportedProjectFileExtension;
  magicType: ProjectFileMagicType;
  originalFileName: string;
  validatedMimeType: string;
};

export type ProjectFileValidationResult =
  | { ok: true; value: ValidatedProjectFile }
  | { ok: false; message: string };

function removeUnsafeFileNameCharacters(value: string) {
  return value
    .normalize("NFKC")
    .replace(FILE_NAME_CONTROL_CHARACTERS, "")
    .replace(/\.+/g, ".")
    .replace(/\s+/g, " ")
    .trim();
}

function hasPathTraversalInput(value: string) {
  return (
    value.includes("/") ||
    value.includes("\\") ||
    value.includes("..") ||
    value.includes("%00")
  );
}

function hasDangerousCompoundExtension(fileName: string) {
  const segments = fileName
    .toLowerCase()
    .split(".")
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length <= 1) {
    return false;
  }

  return segments
    .slice(0, -1)
    .some((segment) => PROJECT_FILE_DANGEROUS_EXTENSIONS.has(`.${segment}`));
}

function sanitizeDisplaySegment(value: string) {
  return value
    .replace(/[^a-zA-Z0-9._ -]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/-+\./g, ".")
    .replace(/^[.-]+|[.-]+$/g, "")
    .slice(0, 255);
}

function sanitizeExtension(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[^.a-z0-9]+/g, "")
    .replace(/\.{2,}/g, ".")
    .replace(/^\.+/, ".")
    .replace(/\.+$/, "");

  return normalized.startsWith(".")
    ? normalized
    : normalized
      ? `.${normalized}`
      : "";
}

function getLastDotIndex(fileName: string) {
  return fileName.lastIndexOf(".");
}

export function normalizeProjectFileExtension(fileName: string) {
  const normalizedFileName = removeUnsafeFileNameCharacters(fileName);
  const lastDotIndex = getLastDotIndex(normalizedFileName);

  if (lastDotIndex <= 0 || lastDotIndex === normalizedFileName.length - 1) {
    return null;
  }

  return normalizedFileName
    .slice(lastDotIndex)
    .toLowerCase() as SupportedProjectFileExtension;
}

export function sanitizeProjectFileName(fileName: string) {
  const normalizedFileName = removeUnsafeFileNameCharacters(fileName);
  const lastDotIndex = getLastDotIndex(normalizedFileName);
  const rawBaseName =
    lastDotIndex > 0
      ? normalizedFileName.slice(0, lastDotIndex)
      : normalizedFileName;
  const rawExtension =
    lastDotIndex > 0
      ? normalizedFileName.slice(lastDotIndex).toLowerCase()
      : "";

  const safeBaseName = sanitizeDisplaySegment(rawBaseName);
  const safeExtension = sanitizeExtension(rawExtension);
  const safeFileName = `${safeBaseName}${safeExtension}`;

  return safeFileName || "file";
}

export function buildProjectFileDisplayName(
  originalFileName: string,
  labelValue: string | null | undefined,
) {
  if (!labelValue || !labelValue.trim()) {
    return sanitizeProjectFileName(originalFileName);
  }

  const originalExtension =
    normalizeProjectFileExtension(originalFileName) ?? "";
  const normalizedLabel = removeUnsafeFileNameCharacters(labelValue);

  if (!normalizedLabel) {
    return sanitizeProjectFileName(originalFileName);
  }

  if (normalizedLabel.includes(".")) {
    return sanitizeProjectFileName(normalizedLabel);
  }

  return sanitizeProjectFileName(`${normalizedLabel}${originalExtension}`);
}

export function formatProjectFileSize(sizeBytes: number) {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  const units = ["KB", "MB", "GB"];
  let value = sizeBytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const rounded = value >= 10 ? Math.round(value) : Number(value.toFixed(1));
  return `${rounded} ${units[unitIndex]}`;
}

export function getProjectFileAllowedRule(
  extension: SupportedProjectFileExtension,
) {
  return PROJECT_FILE_RULES[extension];
}

export function getProjectFileAllowedExtensions() {
  return [...PROJECT_FILE_ALLOWED_EXTENSIONS];
}

export function getProjectFileAllowedTypeLabels() {
  return [...PROJECT_FILE_ALLOWED_TYPE_LABELS];
}

function startsWithSignature(bytes: Uint8Array, signature: number[]) {
  if (bytes.length < signature.length) {
    return false;
  }

  return signature.every((value, index) => bytes[index] === value);
}

function detectProjectFileMagicType(bytes: Uint8Array): ProjectFileMagicType {
  if (startsWithSignature(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) {
    return "pdf";
  }

  if (
    startsWithSignature(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  ) {
    return "png";
  }

  if (startsWithSignature(bytes, [0xff, 0xd8, 0xff])) {
    return "jpeg";
  }

  if (
    startsWithSignature(bytes, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) ||
    startsWithSignature(bytes, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
  ) {
    return "gif";
  }

  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "webp";
  }

  if (
    startsWithSignature(bytes, [0x50, 0x4b, 0x03, 0x04]) ||
    startsWithSignature(bytes, [0x50, 0x4b, 0x05, 0x06]) ||
    startsWithSignature(bytes, [0x50, 0x4b, 0x07, 0x08])
  ) {
    return "zip";
  }

  if (bytes.length === 0) {
    return "unknown";
  }

  for (const byte of bytes) {
    if (byte === 0) {
      return "unknown";
    }
  }

  return "text";
}

function isAllowedMimeType(
  declaredMimeType: string,
  rule: ProjectFileRule,
  magicType: ProjectFileMagicType,
) {
  if (!declaredMimeType) {
    return magicType !== "unknown";
  }

  if (
    declaredMimeType === "application/octet-stream" ||
    declaredMimeType === "binary/octet-stream"
  ) {
    return magicType !== "unknown";
  }

  return rule.mimeTypes.includes(declaredMimeType);
}

export function validateProjectFileSelection(input: {
  bytes: ArrayBuffer;
  declaredMimeType: string;
  displayLabel?: string | null;
  maxUploadBytes: number;
  originalFileName: string;
  sizeBytes: number;
}): ProjectFileValidationResult {
  if (input.sizeBytes <= 0) {
    return {
      ok: false,
      message: "Choose a file to upload.",
    };
  }

  if (input.sizeBytes > input.maxUploadBytes) {
    return {
      ok: false,
      message: `File is too large. Upload files up to ${formatProjectFileSize(
        input.maxUploadBytes,
      )}.`,
    };
  }

  const rawOriginalFileName = removeUnsafeFileNameCharacters(
    input.originalFileName,
  );

  if (!rawOriginalFileName || rawOriginalFileName.length > 255) {
    return {
      ok: false,
      message: "File name is invalid.",
    };
  }

  if (hasPathTraversalInput(input.originalFileName)) {
    return {
      ok: false,
      message: "File name is invalid.",
    };
  }

  if (/[. ]$/.test(rawOriginalFileName)) {
    return {
      ok: false,
      message: "File name cannot end with a dot or space.",
    };
  }

  if (hasDangerousCompoundExtension(rawOriginalFileName)) {
    return {
      ok: false,
      message: "This file name uses a blocked double extension.",
    };
  }

  const extension = normalizeProjectFileExtension(rawOriginalFileName);

  if (extension && PROJECT_FILE_DANGEROUS_EXTENSIONS.has(extension)) {
    return {
      ok: false,
      message: "This file type is blocked for security reasons.",
    };
  }

  if (!extension || !(extension in PROJECT_FILE_RULES)) {
    return {
      ok: false,
      message:
        "Unsupported file type. Upload PDF, image, document, text, or ZIP files only.",
    };
  }

  const sanitizedOriginalFileName =
    sanitizeProjectFileName(rawOriginalFileName);
  const displayFileName = buildProjectFileDisplayName(
    sanitizedOriginalFileName,
    input.displayLabel,
  );
  const declaredMimeType = input.declaredMimeType.trim().toLowerCase();
  const bytes = new Uint8Array(input.bytes);
  const magicType = detectProjectFileMagicType(bytes);
  const rule = PROJECT_FILE_RULES[extension];

  if (!rule.magicTypes.includes(magicType)) {
    return {
      ok: false,
      message: "The uploaded file contents do not match its extension.",
    };
  }

  if (!isAllowedMimeType(declaredMimeType, rule, magicType)) {
    return {
      ok: false,
      message:
        "The uploaded file MIME type does not match the allowed file type.",
    };
  }

  return {
    ok: true,
    value: {
      displayFileName,
      extension,
      magicType,
      originalFileName: sanitizedOriginalFileName,
      validatedMimeType: rule.mimeTypes.includes(declaredMimeType)
        ? declaredMimeType
        : rule.defaultMimeType,
    },
  };
}

export function buildProjectFileStoragePath(input: {
  extension: SupportedProjectFileExtension;
  objectId: string;
  projectId: string;
  workspaceId: string;
}) {
  const normalizedObjectId = input.objectId
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "")
    .slice(0, 64);

  return `workspaces/${input.workspaceId}/projects/${input.projectId}/${normalizedObjectId}/file${input.extension}`;
}

export function isManagedProjectFileStoragePath(input: {
  projectId: string;
  storagePath: string;
  workspaceId: string;
}) {
  const normalizedPath = input.storagePath.replace(/^\/+/, "").trim();
  const currentPrefix = `workspaces/${input.workspaceId}/projects/${input.projectId}/`;

  if (normalizedPath.startsWith(currentPrefix)) {
    return /\/[a-z0-9-]+\/file\.[a-z0-9]+$/i.test(normalizedPath);
  }

  return normalizedPath.startsWith(`projects/${input.projectId}/`);
}
