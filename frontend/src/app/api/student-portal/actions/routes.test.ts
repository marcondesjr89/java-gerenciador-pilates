import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST as cancelBooking } from "@/app/api/student-portal/bookings/[bookingId]/cancel/route";
import { POST as createPortalBooking } from "@/app/api/student-portal/schedule-slots/[slotId]/bookings/route";
import { POST as joinPortalWaitlist } from "@/app/api/student-portal/schedule-slots/[slotId]/waitlist/route";

const requireStudentPortalApiSessionMock = vi.fn();
const proxyJsonToBackendMock = vi.fn();

vi.mock("@/app/api/_lib/proxy", () => ({
  requireStudentPortalApiSession: (...args: unknown[]) => requireStudentPortalApiSessionMock(...args),
  proxyJsonToBackend: (...args: unknown[]) => proxyJsonToBackendMock(...args)
}));

describe("student portal action routes", () => {
  beforeEach(() => {
    requireStudentPortalApiSessionMock.mockReset();
    proxyJsonToBackendMock.mockReset();
  });

  it("retorna 400 quando falta a reserva no cancelamento", async () => {
    requireStudentPortalApiSessionMock.mockResolvedValue({ accessToken: "portal-token" });

    const response = await cancelBooking(new Request("http://localhost/api/student-portal/bookings//cancel", { method: "POST" }), {
      params: Promise.resolve({ bookingId: " " })
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "Informe a reserva para cancelamento." });
    expect(proxyJsonToBackendMock).not.toHaveBeenCalled();
  });

  it("retorna 400 quando falta o horario na reserva", async () => {
    requireStudentPortalApiSessionMock.mockResolvedValue({ accessToken: "portal-token" });

    const response = await createPortalBooking(new Request("http://localhost/api/student-portal/schedule-slots//bookings", { method: "POST" }), {
      params: Promise.resolve({ slotId: " " })
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "Informe o horario para a reserva." });
    expect(proxyJsonToBackendMock).not.toHaveBeenCalled();
  });

  it("retorna 400 quando falta o horario na lista de espera", async () => {
    requireStudentPortalApiSessionMock.mockResolvedValue({ accessToken: "portal-token" });

    const response = await joinPortalWaitlist(new Request("http://localhost/api/student-portal/schedule-slots//waitlist", { method: "POST" }), {
      params: Promise.resolve({ slotId: " " })
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "Informe o horario para a lista de espera." });
    expect(proxyJsonToBackendMock).not.toHaveBeenCalled();
  });
});
