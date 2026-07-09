import type { UserRole } from "@/types/database";

type FileDownloadAccessInput = {
  isAuthenticated: boolean;
  role?: UserRole;
  fileIdIsValid: boolean;
  fileIsAuthorized: boolean;
};

export type FileDownloadAccessDecision =
  | { type: "allow" }
  | { type: "deny"; status: 401 | 403 | 404; message: string };

export function getFileDownloadAccessDecision(
  input: FileDownloadAccessInput,
): FileDownloadAccessDecision {
  if (!input.isAuthenticated) {
    return {
      type: "deny",
      status: 401,
      message: "Authentication required.",
    };
  }

  if (input.role !== "client") {
    return {
      type: "deny",
      status: 403,
      message: "Client access required.",
    };
  }

  if (!input.fileIdIsValid || !input.fileIsAuthorized) {
    return {
      type: "deny",
      status: 404,
      message: "File not found.",
    };
  }

  return { type: "allow" };
}
