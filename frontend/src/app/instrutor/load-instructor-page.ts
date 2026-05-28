import type { SessionUser } from "@/lib/auth";
import { formatDateTime, getTodayIsoDate } from "@/lib/formatters";
import { fetchInstructorDaySchedule } from "@/lib/schedule";
import type { InstructorDayBooking, InstructorDayClinicalSummary, InstructorDaySlot } from "@/lib/schedule-types";

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

function buildCareQueue(slots: InstructorDaySlot[]) {
  return slots.flatMap((slot) =>
    slot.bookings.map((booking) => ({
      bookingId: booking.id,
      slotId: slot.id,
      studentId: booking.studentId,
      studentName: booking.studentName,
      startTime: slot.startTime,
      endTime: slot.endTime,
      requiredSpecialty: slot.requiredSpecialty,
      hasActiveAlerts: booking.clinicalSummary.alerts.length > 0,
      hasLatestEntry: booking.clinicalSummary.latestProgressEntry !== null
    }))
  );
}

function buildSelectedBookingNavigation(
  queue: ReturnType<typeof buildCareQueue>,
  selectedBooking: InstructorDayBooking | null
) {
  const selectedIndex = selectedBooking
    ? queue.findIndex((item) => item.studentId === selectedBooking.studentId)
    : -1;

  return {
    selectedIndex,
    previous: selectedIndex > 0 ? queue[selectedIndex - 1] : null,
    next: selectedIndex >= 0 && selectedIndex < queue.length - 1 ? queue[selectedIndex + 1] : null
  };
}

function buildSlotOperationalSummaries(slots: InstructorDaySlot[]) {
  return Object.fromEntries(
    slots.map((slot) => {
      const activeAlertsCount = slot.bookings.filter((booking) => booking.clinicalSummary.alerts.length > 0).length;
      const pendingProgressCount = slot.bookings.filter(
        (booking) => booking.clinicalSummary.latestProgressEntry === null
      ).length;

      return [
        slot.id,
        {
          activeAlertsCount,
          pendingProgressCount
        }
      ];
    })
  );
}

export async function loadInstructorPage(session: SessionUser, params?: InstructorSearchParams) {
  const selectedDate = params?.date ?? getTodayIsoDate();
  const instructorDaySchedule = await fetchInstructorDaySchedule(session, selectedDate);
  const instructorSlots = instructorDaySchedule.slots;
  const selectedSlot = instructorSlots.find((slot) => slot.id === params?.slotId) ?? instructorSlots[0] ?? null;
  const selectedSlotBookings = selectedSlot?.bookings ?? [];
  const selectedBooking = findSelectedBooking(selectedSlotBookings, params?.studentId);
  const selectedClinicalSummary = selectedBooking?.clinicalSummary ?? null;
  const careQueue = buildCareQueue(instructorSlots);
  const selectedBookingNavigation = buildSelectedBookingNavigation(careQueue, selectedBooking);
  const slotOperationalSummaries = buildSlotOperationalSummaries(instructorSlots);

  return {
    selectedDate,
    instructorSlots,
    totalStudents: instructorDaySchedule.totalBookings,
    selectedSlot,
    selectedSlotBookings,
    selectedBooking,
    careQueue,
    selectedBookingNavigation,
    slotOperationalSummaries,
    alertSummary: buildAlertSummary(selectedClinicalSummary),
    latestEntrySummary: buildLatestEntrySummary(selectedClinicalSummary),
    nextSlot: instructorSlots[0] ?? null
  };
}
