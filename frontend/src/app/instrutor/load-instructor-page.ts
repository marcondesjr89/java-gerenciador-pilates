import type { SessionUser } from "@/lib/auth";
import { formatDateTime, getTodayIsoDate } from "@/lib/formatters";
import { fetchInstructorDaySchedule } from "@/lib/schedule";
import type { InstructorDayBooking, InstructorDayClinicalSummary } from "@/lib/schedule-types";

export type InstructorSearchParams = {
  date?: string;
  slotId?: string;
  studentId?: string;
};

function buildAlertSummary(summary: InstructorDayClinicalSummary | null) {
  const alerts = summary?.alerts ?? [];

  return {
    alerts,
    generalObservations: summary?.generalObservations || "Sem observacoes gerais registradas.",
    hasActiveAlerts: alerts.length > 0
  };
}

function buildLatestEntrySummary(summary: InstructorDayClinicalSummary | null) {
  const latestProgressEntry = summary?.latestProgressEntry;

  if (!latestProgressEntry) {
    return null;
  }

  return {
    recordedAtLabel: formatDateTime(latestProgressEntry.recordedAt, {
      dateStyle: "short",
      timeStyle: "short"
    }),
    scoreSummary: `Flexibilidade: ${latestProgressEntry.flexibilityScore ?? "-"} | Forca: ${latestProgressEntry.strengthScore ?? "-"} | Dor: ${latestProgressEntry.painLevel ?? "-"}`,
    instructorNotes: latestProgressEntry.instructorNotes
  };
}

function findSelectedBooking(bookings: InstructorDayBooking[], studentId?: string) {
  return bookings.find((booking) => booking.studentId === studentId) ?? bookings[0] ?? null;
}

export async function loadInstructorPage(session: SessionUser, params?: InstructorSearchParams) {
  const selectedDate = params?.date ?? getTodayIsoDate();
  const instructorDaySchedule = await fetchInstructorDaySchedule(session, selectedDate);
  const instructorSlots = instructorDaySchedule.slots;
  const selectedSlot = instructorSlots.find((slot) => slot.id === params?.slotId) ?? instructorSlots[0] ?? null;
  const selectedSlotBookings = selectedSlot?.bookings ?? [];
  const selectedBooking = findSelectedBooking(selectedSlotBookings, params?.studentId);
  const selectedClinicalSummary = selectedBooking?.clinicalSummary ?? null;

  return {
    selectedDate,
    instructorSlots,
    totalStudents: instructorDaySchedule.totalBookings,
    selectedSlot,
    selectedSlotBookings,
    selectedBooking,
    alertSummary: buildAlertSummary(selectedClinicalSummary),
    latestEntrySummary: buildLatestEntrySummary(selectedClinicalSummary),
    nextSlot: instructorSlots[0] ?? null
  };
}
