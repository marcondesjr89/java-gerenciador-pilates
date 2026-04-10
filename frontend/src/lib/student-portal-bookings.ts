import type { StudentPortalSessionUser } from "@/lib/student-portal-auth";
import { fetchApiJson } from "@/lib/http";

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
  return fetchApiJson<StudentPortalBooking[]>(session, "/api/v1/student-portal/me/bookings", {
    errorMessage: "Nao foi possivel carregar as reservas do portal."
  });
}
