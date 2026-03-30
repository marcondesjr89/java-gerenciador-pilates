import { API_BASE_URL } from "@/lib/api";
import type { StudentPortalSessionUser } from "@/lib/student-portal-auth";

export type StudentPortalBooking = {
  id: string;
  slotId: string;
  studentId: string;
  studentName: string;
  status: "BOOKED" | "CANCELED";
  instructorName: string;
  requiredSpecialty: string;
  startTime: string;
  endTime: string;
};

export type StudentPortalRescheduleOption = {
  slotId: string;
  instructorName: string;
  requiredSpecialty: string;
  startTime: string;
  endTime: string;
  availableSpots: number;
};

export async function fetchStudentPortalBookings(session: StudentPortalSessionUser) {
  const response = await fetch(`${API_BASE_URL}/api/v1/student-portal/me/bookings`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`
    },
    cache: "no-store"
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("SESSION_FORBIDDEN");
  }

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar as reservas do portal.");
  }

  return (await response.json()) as StudentPortalBooking[];
}
