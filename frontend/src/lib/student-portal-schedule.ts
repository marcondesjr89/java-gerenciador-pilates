import { fetchApiJson } from "@/lib/http";
import type { ScheduleSlot as StudentPortalScheduleSlot } from "@/lib/schedule-types";
import type { StudentPortalSessionUser } from "@/lib/student-portal-auth";

export async function fetchStudentPortalScheduleSlots(session: StudentPortalSessionUser, date: string) {
  return fetchApiJson<StudentPortalScheduleSlot[]>(
    session,
    `/api/v1/student-portal/me/schedule-slots?date=${encodeURIComponent(date)}`,
    { errorMessage: "Nao foi possivel carregar horarios do portal." }
  );
}
