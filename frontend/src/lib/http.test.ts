import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchApiJson } from "@/lib/http";

describe("fetchApiJson", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("retorna null para status configurado como nulo", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    const response = await fetchApiJson<{ id: string } | null>(
      { accessToken: "token" },
      "/api/v1/students/student-1/portal-account",
      { errorMessage: "erro", nullStatuses: [404] }
    );

    expect(response).toBeNull();
  });

  it("lanca SESSION_FORBIDDEN em 401 e 403", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));

    await expect(
      fetchApiJson<{ ok: true }>({ accessToken: "token" }, "/api/v1/test", { errorMessage: "erro" })
    ).rejects.toThrow("SESSION_FORBIDDEN");
  });

  it("lanca a mensagem configurada quando a API falha", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(
      fetchApiJson<{ ok: true }>({ accessToken: "token" }, "/api/v1/test", { errorMessage: "falhou" })
    ).rejects.toThrow("falhou");
  });

  it("retorna o json da API quando a chamada funciona", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await expect(
      fetchApiJson<{ ok: true }>({ accessToken: "token" }, "/api/v1/test", { errorMessage: "falhou" })
    ).resolves.toEqual({ ok: true });
  });

  it("utiliza no-store como estrategia padrao de cache", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await fetchApiJson({ accessToken: "token" }, "/api/v1/test", { errorMessage: "falhou" });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/test"),
      expect.objectContaining({
        cache: "no-store"
      })
    );
  });

  it("repassa cache customizado e opcoes de revalidacao Next.js quando configurados", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await fetchApiJson(
      { accessToken: "token" },
      "/api/v1/plans",
      {
        errorMessage: "falhou",
        cache: "default",
        next: { revalidate: 60, tags: ["billing-plans"] }
      }
    );

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/plans"),
      expect.objectContaining({
        cache: "default",
        next: { revalidate: 60, tags: ["billing-plans"] }
      })
    );
  });
});
