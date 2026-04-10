import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST as createStudent } from "@/app/api/students/route";
import { POST as createPortalAccount } from "@/app/api/students/[studentId]/portal-account/route";
import { POST as createProgressEntry } from "@/app/api/students/[studentId]/progress-entries/route";

const requireInternalApiSessionMock = vi.fn();
const proxyJsonToBackendMock = vi.fn();

vi.mock("@/app/api/_lib/proxy", () => ({
  requireInternalApiSession: (...args: unknown[]) => requireInternalApiSessionMock(...args),
  proxyJsonToBackend: (...args: unknown[]) => proxyJsonToBackendMock(...args)
}));

describe("student api routes", () => {
  beforeEach(() => {
    requireInternalApiSessionMock.mockReset();
    proxyJsonToBackendMock.mockReset();
  });

  it("retorna 400 quando o cadastro do aluno chega com CPF invalido", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });

    const response = await createStudent(
      new Request("http://localhost/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName: "Aluno Teste",
          cpf: "123",
          email: "aluno@studio.com",
          phoneNumber: "85999999999",
          birthDate: "1990-01-01",
          status: "ACTIVE",
          lgpdConsent: true
        })
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "Informe um CPF valido com 11 digitos." });
    expect(proxyJsonToBackendMock).not.toHaveBeenCalled();
  });

  it("encaminha cadastro do aluno com payload normalizado", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });
    proxyJsonToBackendMock.mockResolvedValue(new Response(JSON.stringify({ id: "student-1" }), { status: 201 }));

    await createStudent(
      new Request("http://localhost/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName: "  Aluno Teste  ",
          cpf: "12345678901",
          email: "  aluno@studio.com ",
          phoneNumber: " 85999999999 ",
          birthDate: "1990-01-01",
          status: "ACTIVE",
          lgpdConsent: true
        })
      })
    );

    expect(proxyJsonToBackendMock).toHaveBeenCalledWith({
      session: { accessToken: "internal-token" },
      path: "/api/v1/students",
      method: "POST",
      body: {
        fullName: "Aluno Teste",
        cpf: "12345678901",
        email: "aluno@studio.com",
        phoneNumber: "85999999999",
        birthDate: "1990-01-01",
        status: "ACTIVE",
        lgpdConsent: true
      },
      errorMessage: "Nao foi possivel cadastrar o aluno.",
      successStatus: 201
    });
  });

  it("retorna 400 quando a conta do portal chega com senha curta", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });

    const response = await createPortalAccount(
      new Request("http://localhost/api/students/student-1/portal-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: "aluno@studio.com",
          password: "1234567"
        })
      }),
      {
        params: Promise.resolve({ studentId: "student-1" })
      }
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "Informe uma senha valida com pelo menos 8 caracteres."
    });
    expect(proxyJsonToBackendMock).not.toHaveBeenCalled();
  });

  it("encaminha configuracao da conta do portal com payload normalizado", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });
    proxyJsonToBackendMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await createPortalAccount(
      new Request("http://localhost/api/students/student-1/portal-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: " aluno@studio.com ",
          password: "12345678"
        })
      }),
      {
        params: Promise.resolve({ studentId: "student-1" })
      }
    );

    expect(proxyJsonToBackendMock).toHaveBeenCalledWith({
      session: { accessToken: "internal-token" },
      path: "/api/v1/students/student-1/portal-account",
      method: "POST",
      body: {
        email: "aluno@studio.com",
        password: "12345678"
      },
      errorMessage: "Nao foi possivel configurar a conta do portal."
    });
  });

  it("retorna 400 quando a evolucao chega com dor fora da faixa", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });

    const response = await createProgressEntry(
      new Request("http://localhost/api/students/student-1/progress-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          recordedAt: "2026-04-10T12:00:00.000Z",
          instructorNotes: "Evolucao ok",
          flexibilityScore: 70,
          strengthScore: 80,
          painLevel: 11
        })
      }),
      {
        params: Promise.resolve({ studentId: "student-1" })
      }
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "Informe uma dor valida entre 0 e 10." });
    expect(proxyJsonToBackendMock).not.toHaveBeenCalled();
  });

  it("encaminha evolucao com payload validado", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });
    proxyJsonToBackendMock.mockResolvedValue(new Response(JSON.stringify({ id: "entry-1" }), { status: 200 }));

    await createProgressEntry(
      new Request("http://localhost/api/students/student-1/progress-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          recordedAt: "2026-04-10T12:00:00.000Z",
          instructorNotes: "  Evolucao ok  ",
          flexibilityScore: 70,
          strengthScore: 80,
          painLevel: 3
        })
      }),
      {
        params: Promise.resolve({ studentId: "student-1" })
      }
    );

    expect(proxyJsonToBackendMock).toHaveBeenCalledWith({
      session: { accessToken: "internal-token" },
      path: "/api/v1/students/student-1/progress-entries",
      method: "POST",
      body: {
        recordedAt: "2026-04-10T12:00:00.000Z",
        instructorNotes: "Evolucao ok",
        flexibilityScore: 70,
        strengthScore: 80,
        painLevel: 3
      },
      errorMessage: "Nao foi possivel registrar a evolucao."
    });
  });
});
