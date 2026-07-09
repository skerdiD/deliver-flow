import { describe, expect, it } from "vitest";

import { getFileDownloadAccessDecision } from "@/app/api/client/files/[fileId]/download/access-policy";

describe("client file download access policy", () => {
  it("rejects logged-out and non-client users before file lookup", () => {
    expect(
      getFileDownloadAccessDecision({
        isAuthenticated: false,
        fileIdIsValid: false,
        fileIsAuthorized: false,
      }),
    ).toEqual({
      type: "deny",
      status: 401,
      message: "Authentication required.",
    });

    expect(
      getFileDownloadAccessDecision({
        isAuthenticated: true,
        role: "owner",
        fileIdIsValid: true,
        fileIsAuthorized: true,
      }),
    ).toEqual({
      type: "deny",
      status: 403,
      message: "Client access required.",
    });
  });

  it("returns not found for invalid ids or unauthorized files", () => {
    expect(
      getFileDownloadAccessDecision({
        isAuthenticated: true,
        role: "client",
        fileIdIsValid: false,
        fileIsAuthorized: true,
      }),
    ).toEqual({
      type: "deny",
      status: 404,
      message: "File not found.",
    });

    expect(
      getFileDownloadAccessDecision({
        isAuthenticated: true,
        role: "client",
        fileIdIsValid: true,
        fileIsAuthorized: false,
      }),
    ).toEqual({
      type: "deny",
      status: 404,
      message: "File not found.",
    });
  });

  it("allows signed URL creation only after client authorization passes", () => {
    expect(
      getFileDownloadAccessDecision({
        isAuthenticated: true,
        role: "client",
        fileIdIsValid: true,
        fileIsAuthorized: true,
      }),
    ).toEqual({ type: "allow" });
  });
});
