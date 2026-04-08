import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { decodeStudentPortalSession, encodeStudentPortalSession } from "@/lib/student-portal-auth";

describe("student portal session cookie", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-07T10:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("gera e valida cookie assinado do portal do aluno", async () => {
    const cookie = await encodeStudentPortalSession({
      accessToken: "portal-token",
      email: "aluno@studio.com",
      fullName: "Aluno Portal",
      studentId: "student-1",
      expiresInSeconds: 7200
    });

    expect(cookie).toContain(".");

    await expect(decodeStudentPortalSession(cookie)).resolves.toEqual({
      accessToken: "portal-token",
      email: "aluno@studio.com",
      fullName: "Aluno Portal",
      studentId: "student-1",
      expiresAt: Date.now() + 7200 * 1000
    });
  });

  it("nao aceita cookie interno na leitura do portal", async () => {
    const internalShapeCookie = Buffer.from(
      JSON.stringify({
        accessToken: "token-interno",
        email: "admin@studio.com",
        userId: "user-1",
        fullName: "Admin Studio",
        expiresAt: Date.now() + 3600 * 1000,
        role: "ADMIN"
      })
    ).toString("base64url");

    await expect(decodeStudentPortalSession(internalShapeCookie)).resolves.toBeNull();
  });
});
