import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { decodeSession, encodeSession } from "@/lib/auth";

describe("auth session cookie", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-07T10:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("gera e valida cookie assinado da sessao interna", async () => {
    const cookie = await encodeSession({
      accessToken: "token-interno",
      email: "admin@studio.com",
      userId: "user-1",
      fullName: "Admin Studio",
      expiresInSeconds: 3600,
      role: "ADMIN"
    });

    expect(cookie).toContain(".");

    await expect(decodeSession(cookie)).resolves.toEqual({
      accessToken: "token-interno",
      email: "admin@studio.com",
      userId: "user-1",
      fullName: "Admin Studio",
      expiresAt: Date.now() + 3600 * 1000,
      role: "ADMIN"
    });
  });

  it("rejeita cookie assinado adulterado", async () => {
    const cookie = await encodeSession({
      accessToken: "token-interno",
      email: "admin@studio.com",
      userId: "user-1",
      fullName: "Admin Studio",
      expiresInSeconds: 3600,
      role: "ADMIN"
    });

    const tampered = `${cookie}x`;

    await expect(decodeSession(tampered)).resolves.toBeNull();
  });

  it("mantem compatibilidade com cookie legado sem assinatura", async () => {
    const legacyCookie = Buffer.from(
      JSON.stringify({
        accessToken: "legacy-token",
        email: "recepcao@studio.com",
        userId: "user-2",
        fullName: "Recepcao",
        expiresAt: Date.now() + 1800 * 1000,
        role: "RECEPTION"
      })
    ).toString("base64url");

    await expect(decodeSession(legacyCookie)).resolves.toEqual({
      accessToken: "legacy-token",
      email: "recepcao@studio.com",
      userId: "user-2",
      fullName: "Recepcao",
      expiresAt: Date.now() + 1800 * 1000,
      role: "RECEPTION"
    });
  });
});
