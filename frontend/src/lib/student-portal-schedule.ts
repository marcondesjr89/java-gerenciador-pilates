import { API_BASE_URL } from "@/lib/api";
import type { StudentPortalSessionUser } from "@/lib/student-portal-auth";

export type StudentPortalScheduleSlot = {
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

export async function fetchStudentPortalScheduleSlots(session: StudentPortalSessionUser, date: string) {
  const response = await fetch(`${API_BASE_URL}/api/v1/student-portal/me/schedule-slots?date=${encodeURIComponent(date)}`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`
    },
    cache: "no-store"
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("SESSION_FORBIDDEN");
  }

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar horarios do portal.");
  }

  return (await response.json()) as StudentPortalScheduleSlot[];
}
