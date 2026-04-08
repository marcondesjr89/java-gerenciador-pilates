import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/student-portal/bookings/[bookingId]/reschedule-options/route";

const requireStudentPortalApiSessionMock = vi.fn();
const proxyJsonToBackendMock = vi.fn();

vi.mock("@/app/api/_lib/proxy", () => ({
  requireStudentPortalApiSession: (...args: unknown[]) => requireStudentPortalApiSessionMock(...args),
  proxyJsonToBackend: (...args: unknown[]) => proxyJsonToBackendMock(...args)
}));

describe("student portal reschedule options route", () => {
  beforeEach(() => {
    requireStudentPortalApiSessionMock.mockReset();
    proxyJsonToBackendMock.mockReset();
  });

  it("retorna 400 quando a data nao e informada", async () => {
    requireStudentPortalApiSessionMock.mockResolvedValue({ accessToken: "portal-token" });

    const response = await GET(new Request("http://localhost/api/student-portal/bookings/booking-1/reschedule-options"), {
      params: Promise.resolve({ bookingId: "booking-1" })
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "Informe a data desejada." });
    expect(proxyJsonToBackendMock).not.toHaveBeenCalled();
  });

  it("encaminha a consulta com a data codificada", async () => {
    requireStudentPortalApiSessionMock.mockResolvedValue({ accessToken: "portal-token" });
    proxyJsonToBackendMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await GET(
      new Request("http://localhost/api/student-portal/bookings/booking-1/reschedule-options?date=2026-04-10"),
      {
        params: Promise.resolve({ bookingId: "booking-1" })
      }
    );

    expect(proxyJsonToBackendMock).toHaveBeenCalledWith({
      session: { accessToken: "portal-token" },
      path: "/api/v1/student-portal/me/bookings/booking-1/reschedule-options?date=2026-04-10",
      errorMessage: "Nao foi possivel carregar opcoes de remarcacao."
    });
  });
});
