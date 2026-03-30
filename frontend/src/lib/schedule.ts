import { API_BASE_URL } from "@/lib/api";
import type { SessionUser } from "@/lib/auth";

export type ScheduleSlot = {
  id: string;
  instructorUserId: string;
  instructorName: string;
  requiredSpecialty: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  availableSpots: number;
};

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
  const response = await fetch(`${API_BASE_URL}/api/v1/schedule-slots?${searchParams.toString()}`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`
    },
    cache: "no-store"
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("SESSION_FORBIDDEN");
  }

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar a agenda.");
  }

  return (await response.json()) as ScheduleSlot[];
}

export async function fetchScheduleBlocks(session: SessionUser, date: string) {
  const searchParams = new URLSearchParams({ date });
  const response = await fetch(`${API_BASE_URL}/api/v1/schedule-blocks?${searchParams.toString()}`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`
    },
    cache: "no-store"
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("SESSION_FORBIDDEN");
  }

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar os bloqueios.");
  }

  return (await response.json()) as ScheduleBlock[];
}

export async function fetchSlotBookings(session: SessionUser, slotId: string) {
  const response = await fetch(`${API_BASE_URL}/api/v1/schedule-slots/${slotId}/bookings`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`
    },
    cache: "no-store"
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("SESSION_FORBIDDEN");
  }

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar as reservas do horario.");
  }

  return (await response.json()) as ScheduleBooking[];
}
