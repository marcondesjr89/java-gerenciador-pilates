import type { SessionUser } from "@/lib/auth";
import { fetchApiJson } from "@/lib/http";
import type { ScheduleSlot } from "@/lib/schedule-types";

export type ScheduleBlock = {
  id: string;
  instructorUserId: string;
  instructorName: string;
  startTime: string;
  endTime: string;
  reason: string;
};

export type ScheduleBooking = {
  id: string;
  slotId: string;
  studentId: string;
  studentName: string;
  status: string;
};

export async function fetchScheduleSlots(session: SessionUser, date: string) {
  const searchParams = new URLSearchParams({ date });
  return fetchApiJson<ScheduleSlot[]>(session, `/api/v1/schedule-slots?${searchParams.toString()}`, {
    errorMessage: "Nao foi possivel carregar a agenda."
  });
}

export async function fetchScheduleBlocks(session: SessionUser, date: string) {
  const searchParams = new URLSearchParams({ date });
  return fetchApiJson<ScheduleBlock[]>(session, `/api/v1/schedule-blocks?${searchParams.toString()}`, {
    errorMessage: "Nao foi possivel carregar os bloqueios."
  });
}

export async function fetchSlotBookings(session: SessionUser, slotId: string) {
  return fetchApiJson<ScheduleBooking[]>(session, `/api/v1/schedule-slots/${slotId}/bookings`, {
    errorMessage: "Nao foi possivel carregar as reservas do horario."
  });
}
