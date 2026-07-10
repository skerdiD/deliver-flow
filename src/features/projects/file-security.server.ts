import "server-only";

import { createHash } from "node:crypto";

import {
  PROJECT_FILE_ACCEPT_ATTRIBUTE,
  PROJECT_FILE_ALLOWED_TYPE_LABELS,
  PROJECT_FILE_DEFAULT_MAX_UPLOAD_BYTES,
  PROJECT_FILE_DEFAULT_SIGNED_URL_TTL_SECONDS,
  PROJECT_FILE_DEFAULT_WORKSPACE_QUOTA_BYTES,
  PROJECT_FILE_MAX_FILES_PER_UPLOAD,
} from "@/features/projects/file-security";

type ProjectFileScanMode = "development-noop" | "quarantine";

export type ProjectFileSecurityConfig = {
  maxFilesPerUpload: number;
  maxUploadBytes: number;
  scanMode: ProjectFileScanMode;
  signedUrlExpiresInSeconds: number;
  workspaceQuotaBytes: number;
};

function readPositiveIntegerEnv(
  key: string,
  fallback: number,
  options?: {
    max?: number;
    min?: number;
  },
) {
  const rawValue = process.env[key];

  if (!rawValue) {
    return fallback;
  }

  const parsed = Number.parseInt(rawValue, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Environment variable ${key} must be a positive integer.`);
  }

  if (options?.min && parsed < options.min) {
    throw new Error(
      `Environment variable ${key} must be at least ${options.min}.`,
    );
  }

  if (options?.max && parsed > options.max) {
    throw new Error(
      `Environment variable ${key} must be at most ${options.max}.`,
    );
  }

  return parsed;
}

function getProjectFileScanMode(): ProjectFileScanMode {
  const rawValue = process.env.PROJECT_FILE_SCAN_MODE?.trim().toLowerCase();

  if (!rawValue) {
    return process.env.NODE_ENV === "production"
      ? "quarantine"
      : "development-noop";
  }

  if (rawValue === "development-noop" || rawValue === "quarantine") {
    return rawValue;
  }

  throw new Error(
    "Environment variable PROJECT_FILE_SCAN_MODE must be development-noop or quarantine.",
  );
}

export function getProjectFileSecurityConfig(): ProjectFileSecurityConfig {
  return {
    maxFilesPerUpload: PROJECT_FILE_MAX_FILES_PER_UPLOAD,
    maxUploadBytes: readPositiveIntegerEnv(
      "PROJECT_FILE_MAX_UPLOAD_BYTES",
      PROJECT_FILE_DEFAULT_MAX_UPLOAD_BYTES,
    ),
    scanMode: getProjectFileScanMode(),
    signedUrlExpiresInSeconds: readPositiveIntegerEnv(
      "PROJECT_FILE_SIGNED_URL_TTL_SECONDS",
      PROJECT_FILE_DEFAULT_SIGNED_URL_TTL_SECONDS,
      {
        min: 60,
        max: 300,
      },
    ),
    workspaceQuotaBytes: readPositiveIntegerEnv(
      "PROJECT_FILE_WORKSPACE_QUOTA_BYTES",
      PROJECT_FILE_DEFAULT_WORKSPACE_QUOTA_BYTES,
    ),
  };
}

export function getProjectFileScannerWebhookSecret() {
  const value = process.env.PROJECT_FILE_SCAN_WEBHOOK_SECRET?.trim();
  return value && value.length > 0 ? value : null;
}

export function getProjectFileClientPolicy() {
  const config = getProjectFileSecurityConfig();

  return {
    accept: PROJECT_FILE_ACCEPT_ATTRIBUTE,
    allowedTypeLabels: PROJECT_FILE_ALLOWED_TYPE_LABELS,
    maxUploadBytes: config.maxUploadBytes,
    maxUploadLabel: `${Math.round(config.maxUploadBytes / (1024 * 1024))} MB`,
  };
}

export async function createProjectFileChecksum(bytes: ArrayBuffer) {
  return createHash("sha256").update(Buffer.from(bytes)).digest("hex");
}
