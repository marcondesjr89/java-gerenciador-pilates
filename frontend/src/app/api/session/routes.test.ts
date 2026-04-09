import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST as internalLogin } from "@/app/api/session/login/route";
import { POST as studentPortalLogin } from "@/app/api/student-portal/session/login/route";

const encodeSessionMock = vi.fn();
const encodeStudentPortalSessionMock = vi.fn();
const fetchMock = vi.fn();

vi.mock("@/lib/auth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth")>("@/lib/auth");
  return {
    ...actual,
    encodeSession: (...args: unknown[]) => encodeSessionMock(...args)
  };
});

vi.mock("@/lib/student-portal-auth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/student-portal-auth")>("@/lib/student-portal-auth");
  return {
    ...actual,
    encodeStudentPortalSession: (...args: unknown[]) => encodeStudentPortalSessionMock(...args)
  };
});

describe("session api routes", () => {
  beforeEach(() => {
    encodeSessionMock.mockReset();
    encodeStudentPortalSessionMock.mockReset();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("retorna 400 no login interno com json invalido", async () => {
    const response = await internalLogin(
      new Request("http://localhost/api/session/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: "{"
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "Corpo da requisicao invalido." });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("normaliza o login interno antes de consultar backend e montar a sessao", async () => {
    encodeSessionMock.mockResolvedValue("signed-session");
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            accessToken: "token-1",
            email: "admin@studio.com",
            expiresInSeconds: 3600,
            role: "ADMIN"
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "user-1",
            fullName: "Admin Studio"
          }),
          { status: 200 }
        )
      );

    const response = await internalLogin(
      new Request("http://localhost/api/session/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: "  admin@studio.com  ",
          password: "secret"
        })
      })
    );

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("/api/v1/auth/login"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          email: "admin@studio.com",
          password: "secret"
        })
      })
    );
    expect(encodeSessionMock).toHaveBeenCalledWith({
      accessToken: "token-1",
      email: "admin@studio.com",
      userId: "user-1",
      fullName: "Admin Studio",
      expiresInSeconds: 3600,
      role: "ADMIN"
    });
  });

  it("retorna 400 no login do portal quando faltam credenciais", async () => {
    const response = await studentPortalLogin(
      new Request("http://localhost/api/student-portal/session/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: "aluno@studio.com",
          password: ""
        })
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "Informe e-mail e senha." });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("normaliza o login do portal antes de persistir a sessao", async () => {
    encodeStudentPortalSessionMock.mockResolvedValue("signed-portal-session");
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          accessToken: "portal-token",
          tokenType: "Bearer",
          expiresInSeconds: 1800,
          studentId: "student-1",
          email: "aluno@studio.com",
          fullName: "Aluno Studio"
        }),
        { status: 200 }
      )
    );

    const response = await studentPortalLogin(
      new Request("http://localhost/api/student-portal/session/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: "  aluno@studio.com ",
          password: "secret"
        })
      })
    );

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/student-portal/auth/login"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          email: "aluno@studio.com",
          password: "secret"
        })
      })
    );
    expect(encodeStudentPortalSessionMock).toHaveBeenCalledWith({
      accessToken: "portal-token",
      email: "aluno@studio.com",
      fullName: "Aluno Studio",
      studentId: "student-1",
      expiresInSeconds: 1800
    });
  });
});
