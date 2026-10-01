import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET as listUsers, POST as createUser } from "@/app/api/users/route";
import { PUT as updateUser } from "@/app/api/users/[userId]/route";
import { PATCH as updateUserStatus } from "@/app/api/users/[userId]/status/route";
import { POST as changeUserPassword } from "@/app/api/users/[userId]/password/route";

const requireInternalApiSessionMock = vi.fn();
const proxyJsonToBackendMock = vi.fn();

vi.mock("@/app/api/_lib/proxy", () => ({
  requireInternalApiSession: (...args: unknown[]) => requireInternalApiSessionMock(...args),
  proxyJsonToBackend: (...args: unknown[]) => proxyJsonToBackendMock(...args)
}));

describe("users api routes", () => {
  beforeEach(() => {
    requireInternalApiSessionMock.mockReset();
    proxyJsonToBackendMock.mockReset();
  });

  it("encaminha listagem de usuarios da equipe", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "admin-token" });
    proxyJsonToBackendMock.mockResolvedValue(new Response("[]", { status: 200 }));

    await listUsers();

    expect(proxyJsonToBackendMock).toHaveBeenCalledWith({
      session: { accessToken: "admin-token" },
      path: "/api/v1/users",
      method: "GET",
      errorMessage: "Nao foi possivel carregar a lista de usuarios."
    });
  });

  it("encaminha criacao de usuario com payload correto", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "admin-token" });
    proxyJsonToBackendMock.mockResolvedValue(new Response("{}", { status: 201 }));

    const request = new Request("http://localhost/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "instrutora@teste.local",
        fullName: "Instrutora Ana",
        password: "SenhaSegura123",
        role: "INSTRUCTOR",
        specialties: ["PILATES_SOLO"]
      })
    });

    await createUser(request);

    expect(proxyJsonToBackendMock).toHaveBeenCalledWith({
      session: { accessToken: "admin-token" },
      path: "/api/v1/users",
      method: "POST",
      body: {
        email: "instrutora@teste.local",
        fullName: "Instrutora Ana",
        password: "SenhaSegura123",
        role: "INSTRUCTOR",
        specialties: ["PILATES_SOLO"]
      },
      errorMessage: "Nao foi possivel cadastrar o usuario."
    });
  });

  it("retorna 400 se e-mail ou senha forem invalidos na criacao", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "admin-token" });

    const response = await createUser(
      new Request("http://localhost/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "email-invalido",
          fullName: "Nome",
          password: "123",
          role: "INSTRUCTOR"
        })
      })
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.message).toBe("Informe um e-mail valido.");
  });

  it("encaminha atualizacao de dados de usuario", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "admin-token" });
    proxyJsonToBackendMock.mockResolvedValue(new Response("{}", { status: 200 }));

    const request = new Request("http://localhost/api/users/user-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Ana Atualizada",
        role: "INSTRUCTOR",
        specialties: ["PILATES_APARELHOS"]
      })
    });

    await updateUser(request, { params: Promise.resolve({ userId: "user-1" }) });

    expect(proxyJsonToBackendMock).toHaveBeenCalledWith({
      session: { accessToken: "admin-token" },
      path: "/api/v1/users/user-1",
      method: "PUT",
      body: {
        fullName: "Ana Atualizada",
        role: "INSTRUCTOR",
        specialties: ["PILATES_APARELHOS"]
      },
      errorMessage: "Nao foi possivel atualizar o usuario."
    });
  });

  it("encaminha alteracao de status ativo/inativo", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "admin-token" });
    proxyJsonToBackendMock.mockResolvedValue(new Response("{}", { status: 200 }));

    const request = new Request("http://localhost/api/users/user-1/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        active: false
      })
    });

    await updateUserStatus(request, { params: Promise.resolve({ userId: "user-1" }) });

    expect(proxyJsonToBackendMock).toHaveBeenCalledWith({
      session: { accessToken: "admin-token" },
      path: "/api/v1/users/user-1/status",
      method: "PATCH",
      body: {
        active: false
      },
      errorMessage: "Nao foi possivel alterar o status do usuario."
    });
  });

  it("encaminha redefinicao de senha com validacao de tamanho minimo", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "admin-token" });
    proxyJsonToBackendMock.mockResolvedValue(new Response("{}", { status: 200 }));

    const shortPwdResponse = await changeUserPassword(
      new Request("http://localhost/api/users/user-1/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: "123" })
      }),
      { params: Promise.resolve({ userId: "user-1" }) }
    );
    expect(shortPwdResponse.status).toBe(400);

    const validRequest = new Request("http://localhost/api/users/user-1/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: "NovaSenhaValida123" })
    });

    await changeUserPassword(validRequest, { params: Promise.resolve({ userId: "user-1" }) });

    expect(proxyJsonToBackendMock).toHaveBeenCalledWith({
      session: { accessToken: "admin-token" },
      path: "/api/v1/users/user-1/password",
      method: "POST",
      body: {
        newPassword: "NovaSenhaValida123"
      },
      errorMessage: "Nao foi possivel alterar a senha do usuario."
    });
  });
});
