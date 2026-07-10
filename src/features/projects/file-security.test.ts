import { describe, expect, it } from "vitest";

import {
  PROJECT_FILE_DEFAULT_MAX_UPLOAD_BYTES,
  validateProjectFileSelection,
} from "@/features/projects/file-security";

const textEncoder = new TextEncoder();

function toArrayBuffer(bytes: number[]) {
  return Uint8Array.from(bytes).buffer;
}

describe("project file validation", () => {
  it("accepts an allowed PDF upload", () => {
    const result = validateProjectFileSelection({
      bytes: textEncoder.encode("%PDF-1.7 DeliverFlow").buffer,
      declaredMimeType: "application/pdf",
      maxUploadBytes: PROJECT_FILE_DEFAULT_MAX_UPLOAD_BYTES,
      originalFileName: "Final Brief.pdf",
      sizeBytes: 32,
    });

    expect(result.ok).toBe(true);
  });

  it("accepts an allowed image upload", () => {
    const result = validateProjectFileSelection({
      bytes: toArrayBuffer([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      declaredMimeType: "image/png",
      maxUploadBytes: PROJECT_FILE_DEFAULT_MAX_UPLOAD_BYTES,
      originalFileName: "Preview.png",
      sizeBytes: 8,
    });

    expect(result.ok).toBe(true);
  });

  it("rejects oversized uploads", () => {
    const result = validateProjectFileSelection({
      bytes: textEncoder.encode("%PDF-1.7").buffer,
      declaredMimeType: "application/pdf",
      maxUploadBytes: PROJECT_FILE_DEFAULT_MAX_UPLOAD_BYTES,
      originalFileName: "Big.pdf",
      sizeBytes: PROJECT_FILE_DEFAULT_MAX_UPLOAD_BYTES + 1,
    });

    expect(result).toEqual({
      ok: false,
      message: "File is too large. Upload files up to 25 MB.",
    });
  });

  it("blocks dangerous executable extensions", () => {
    const result = validateProjectFileSelection({
      bytes: textEncoder.encode("@echo off").buffer,
      declaredMimeType: "text/plain",
      maxUploadBytes: PROJECT_FILE_DEFAULT_MAX_UPLOAD_BYTES,
      originalFileName: "invoice.EXE",
      sizeBytes: 9,
    });

    expect(result).toEqual({
      ok: false,
      message: "This file type is blocked for security reasons.",
    });
  });

  it("blocks dangerous double extensions", () => {
    const result = validateProjectFileSelection({
      bytes: textEncoder.encode("%PDF-1.7").buffer,
      declaredMimeType: "application/pdf",
      maxUploadBytes: PROJECT_FILE_DEFAULT_MAX_UPLOAD_BYTES,
      originalFileName: "invoice.exe.pdf",
      sizeBytes: 8,
    });

    expect(result).toEqual({
      ok: false,
      message: "This file name uses a blocked double extension.",
    });
  });

  it("rejects MIME and extension mismatches", () => {
    const result = validateProjectFileSelection({
      bytes: textEncoder.encode("%PDF-1.7").buffer,
      declaredMimeType: "image/png",
      maxUploadBytes: PROJECT_FILE_DEFAULT_MAX_UPLOAD_BYTES,
      originalFileName: "brief.pdf",
      sizeBytes: 8,
    });

    expect(result).toEqual({
      ok: false,
      message:
        "The uploaded file MIME type does not match the allowed file type.",
    });
  });

  it("rejects path traversal names", () => {
    const result = validateProjectFileSelection({
      bytes: textEncoder.encode("%PDF-1.7").buffer,
      declaredMimeType: "application/pdf",
      maxUploadBytes: PROJECT_FILE_DEFAULT_MAX_UPLOAD_BYTES,
      originalFileName: "../brief.pdf",
      sizeBytes: 8,
    });

    expect(result).toEqual({
      ok: false,
      message: "File name is invalid.",
    });
  });

  it("rejects SVG uploads to keep downloads attachment-safe", () => {
    const result = validateProjectFileSelection({
      bytes: textEncoder.encode("<svg></svg>").buffer,
      declaredMimeType: "image/svg+xml",
      maxUploadBytes: PROJECT_FILE_DEFAULT_MAX_UPLOAD_BYTES,
      originalFileName: "graphic.svg",
      sizeBytes: 11,
    });

    expect(result).toEqual({
      ok: false,
      message:
        "Unsupported file type. Upload PDF, image, document, text, or ZIP files only.",
    });
  });

  it("rejects files whose contents do not match the claimed extension", () => {
    const result = validateProjectFileSelection({
      bytes: textEncoder.encode("not really a pdf").buffer,
      declaredMimeType: "application/pdf",
      maxUploadBytes: PROJECT_FILE_DEFAULT_MAX_UPLOAD_BYTES,
      originalFileName: "final.pdf",
      sizeBytes: 16,
    });

    expect(result).toEqual({
      ok: false,
      message: "The uploaded file contents do not match its extension.",
    });
  });
});
