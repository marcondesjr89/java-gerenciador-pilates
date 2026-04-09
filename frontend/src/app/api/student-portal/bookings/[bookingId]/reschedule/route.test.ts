import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/student-portal/bookings/[bookingId]/reschedule/route";

const requireStudentPortalApiSessionMock = vi.fn();
const proxyJsonToBackendMock = vi.fn();

vi.mock("@/app/api/_lib/proxy", () => ({
  requireStudentPortalApiSession: (...args: unknown[]) => requireStudentPortalApiSessionMock(...args),
  proxyJsonToBackend: (...args: unknown[]) => proxyJsonToBackendMock(...args)
}));

describe("student portal reschedule route", () => {
  beforeEach(() => {
    requireStudentPortalApiSessionMock.mockReset();
    proxyJsonToBackendMock.mockReset();
  });

  it("retorna 400 quando o horario de destino nao e informado", async () => {
    requireStudentPortalApiSessionMock.mockResolvedValue({ accessToken: "portal-token" });

    const response = await POST(
      new Request("http://localhost/api/student-portal/bookings/booking-1/reschedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          targetSlotId: "   "
        })
      }),
      {
        params: Promise.resolve({ bookingId: "booking-1" })
      }
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "Informe o horario de destino para a remarcacao." });
    expect(proxyJsonToBackendMock).not.toHaveBeenCalled();
  });

  it("encaminha a remarcacao com o payload normalizado", async () => {
    requireStudentPortalApiSessionMock.mockResolvedValue({ accessToken: "portal-token" });
    proxyJsonToBackendMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await POST(
      new Request("http://localhost/api/student-portal/bookings/booking-1/reschedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          targetSlotId: " slot-2 "
        })
      }),
      {
        params: Promise.resolve({ bookingId: "booking-1" })
      }
    );

    expect(proxyJsonToBackendMock).toHaveBeenCalledWith({
      session: { accessToken: "portal-token" },
      path: "/api/v1/student-portal/me/bookings/booking-1/reschedule",
      method: "POST",
      body: {
        targetSlotId: "slot-2"
      },
      errorMessage: "Nao foi possivel remarcar a reserva."
    });
  });
});
