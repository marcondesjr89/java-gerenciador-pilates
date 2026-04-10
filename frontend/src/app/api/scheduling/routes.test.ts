import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET as listBlocks, POST as createBlock } from "@/app/api/schedule-blocks/route";
import { PUT as updateBlock, DELETE as deleteBlock } from "@/app/api/schedule-blocks/[blockId]/route";
import { POST as createSlot } from "@/app/api/schedule-slots/route";
import { POST as createBooking } from "@/app/api/schedule-slots/[slotId]/bookings/route";
import { DELETE as cancelBooking } from "@/app/api/schedule-slots/[slotId]/bookings/[bookingId]/route";
import { POST as joinWaitlist } from "@/app/api/schedule-slots/[slotId]/waitlist/route";

const requireInternalApiSessionMock = vi.fn();
const proxyJsonToBackendMock = vi.fn();

vi.mock("@/app/api/_lib/proxy", () => ({
  requireInternalApiSession: (...args: unknown[]) => requireInternalApiSessionMock(...args),
  proxyJsonToBackend: (...args: unknown[]) => proxyJsonToBackendMock(...args)
}));

describe("scheduling api routes", () => {
  beforeEach(() => {
    requireInternalApiSessionMock.mockReset();
    proxyJsonToBackendMock.mockReset();
  });

  it("retorna 400 quando a consulta de bloqueios chega com data invalida", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });

    const response = await listBlocks(new Request("http://localhost/api/schedule-blocks?date=10-04-2026"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "Informe uma data valida para consultar bloqueios."
    });
    expect(proxyJsonToBackendMock).not.toHaveBeenCalled();
  });

  it("retorna 400 quando o horario chega sem especialidade valida", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });

    const response = await createSlot(
      new Request("http://localhost/api/schedule-slots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          instructorUserId: "instructor-1",
          requiredSpecialty: "YOGA",
          startTime: "2026-04-10T12:00:00.000Z",
          endTime: "2026-04-10T13:00:00.000Z",
          capacity: 2
        })
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "Informe uma especialidade valida para o horario."
    });
    expect(proxyJsonToBackendMock).not.toHaveBeenCalled();
  });

  it("encaminha criacao de horario com payload normalizado", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });
    proxyJsonToBackendMock.mockResolvedValue(new Response(JSON.stringify({ id: "slot-1" }), { status: 201 }));

    await createSlot(
      new Request("http://localhost/api/schedule-slots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          instructorUserId: " instructor-1 ",
          requiredSpecialty: "PILATES_SOLO",
          startTime: "2026-04-10T12:00:00.000Z",
          endTime: "2026-04-10T13:00:00.000Z",
          capacity: 2
        })
      })
    );

    expect(proxyJsonToBackendMock).toHaveBeenCalledWith({
      session: { accessToken: "internal-token" },
      path: "/api/v1/schedule-slots",
      method: "POST",
      body: {
        instructorUserId: "instructor-1",
        requiredSpecialty: "PILATES_SOLO",
        startTime: "2026-04-10T12:00:00.000Z",
        endTime: "2026-04-10T13:00:00.000Z",
        capacity: 2
      },
      errorMessage: "Nao foi possivel criar o horario.",
      successStatus: 201
    });
  });

  it("retorna 400 quando o bloqueio chega sem motivo", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });

    const response = await createBlock(
      new Request("http://localhost/api/schedule-blocks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          instructorUserId: "instructor-1",
          startTime: "2026-04-10T12:00:00.000Z",
          endTime: "2026-04-10T13:00:00.000Z",
          reason: "   "
        })
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "Informe o motivo do bloqueio." });
    expect(proxyJsonToBackendMock).not.toHaveBeenCalled();
  });

  it("encaminha edicao do bloqueio com payload validado", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });
    proxyJsonToBackendMock.mockResolvedValue(new Response(JSON.stringify({ id: "block-1" }), { status: 200 }));

    await updateBlock(
      new Request("http://localhost/api/schedule-blocks/block-1", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          instructorUserId: " instructor-1 ",
          startTime: "2026-04-10T12:00:00.000Z",
          endTime: "2026-04-10T13:00:00.000Z",
          reason: " Reuniao interna "
        })
      }),
      {
        params: Promise.resolve({ blockId: "block-1" })
      }
    );

    expect(proxyJsonToBackendMock).toHaveBeenCalledWith({
      session: { accessToken: "internal-token" },
      path: "/api/v1/schedule-blocks/block-1",
      method: "PUT",
      body: {
        instructorUserId: "instructor-1",
        startTime: "2026-04-10T12:00:00.000Z",
        endTime: "2026-04-10T13:00:00.000Z",
        reason: "Reuniao interna"
      },
      errorMessage: "Nao foi possivel editar o bloqueio."
    });
  });

  it("retorna 400 quando falta o aluno da reserva", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });

    const response = await createBooking(
      new Request("http://localhost/api/schedule-slots/slot-1/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          studentId: "   "
        })
      }),
      {
        params: Promise.resolve({ slotId: "slot-1" })
      }
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "Informe o aluno da reserva." });
    expect(proxyJsonToBackendMock).not.toHaveBeenCalled();
  });

  it("encaminha inclusao na fila de espera com payload normalizado", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });
    proxyJsonToBackendMock.mockResolvedValue(new Response(JSON.stringify({ id: "wait-1" }), { status: 201 }));

    await joinWaitlist(
      new Request("http://localhost/api/schedule-slots/slot-1/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          studentId: " student-1 "
        })
      }),
      {
        params: Promise.resolve({ slotId: "slot-1" })
      }
    );

    expect(proxyJsonToBackendMock).toHaveBeenCalledWith({
      session: { accessToken: "internal-token" },
      path: "/api/v1/schedule-slots/slot-1/waitlist",
      method: "POST",
      body: {
        studentId: "student-1"
      },
      errorMessage: "Nao foi possivel incluir o aluno na fila de espera.",
      successStatus: 201
    });
  });

  it("retorna 400 quando falta a reserva a ser cancelada", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });

    const response = await cancelBooking(new Request("http://localhost/api/schedule-slots/slot-1/bookings/"), {
      params: Promise.resolve({ slotId: "slot-1", bookingId: "   " })
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "Informe a reserva a ser cancelada." });
    expect(proxyJsonToBackendMock).not.toHaveBeenCalled();
  });

  it("encaminha remocao de bloqueio com identificador validado", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });
    proxyJsonToBackendMock.mockResolvedValue(new Response(null, { status: 204 }));

    await deleteBlock(new Request("http://localhost/api/schedule-blocks/block-1", { method: "DELETE" }), {
      params: Promise.resolve({ blockId: "block-1" })
    });

    expect(proxyJsonToBackendMock).toHaveBeenCalledWith({
      session: { accessToken: "internal-token" },
      path: "/api/v1/schedule-blocks/block-1",
      method: "DELETE",
      errorMessage: "Nao foi possivel remover o bloqueio."
    });
  });
});
