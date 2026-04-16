import type { StudentPortalSessionUser } from "@/lib/student-portal-auth";
import type { ScheduleBooking, ScheduleSlotAvailability, ScheduleSlotWindow } from "@/lib/schedule-types";
import { fetchApiJson } from "@/lib/http";

export type StudentPortalBooking = ScheduleBooking & ScheduleSlotWindow;

export type StudentPortalRescheduleOption = ScheduleSlotWindow &
  ScheduleSlotAvailability & {
  slotId: string;
};

export type StudentPortalRescheduleRequest = {
  targetSlotId: string;
};

export async function fetchStudentPortalBookings(session: StudentPortalSessionUser) {
  return fetchApiJson<StudentPortalBooking[]>(session, "/api/v1/student-portal/me/bookings", {
    errorMessage: "Nao foi possivel carregar as reservas do portal."
  });
}
