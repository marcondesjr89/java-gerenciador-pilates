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

function shiftIsoDate(date: string, offsetInDays: number) {
  const shiftedDate = new Date(`${date}T12:00:00`);
  shiftedDate.setDate(shiftedDate.getDate() + offsetInDays);
  return shiftedDate.toISOString().slice(0, 10);
}

function buildDateNavigation(selectedDate: string) {
  return {
    previousDate: shiftIsoDate(selectedDate, -1),
    todayDate: getTodayIsoDate(),
    nextDate: shiftIsoDate(selectedDate, 1)
  };
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

function buildDayOperationalSummary(queue: ReturnType<typeof buildCareQueue>) {
  const activeAlertsCount = queue.filter((item) => item.hasActiveAlerts).length;
  const pendingProgressCount = queue.filter((item) => !item.hasLatestEntry).length;
  const priorityQueue = queue.filter((item) => item.hasActiveAlerts || !item.hasLatestEntry).slice(0, 4);
  const completedProgressCount = queue.length - pendingProgressCount;

  return {
    activeAlertsCount,
    pendingProgressCount,
    completedProgressCount,
    completionPercentage: queue.length > 0 ? Math.round((completedProgressCount / queue.length) * 100) : 0,
    nextPendingProgress: queue.find((item) => !item.hasLatestEntry) ?? null,
    priorityQueue
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

function buildBookingOperationalSummaries(bookings: InstructorDayBooking[]) {
  return Object.fromEntries(
    bookings.map((booking) => [
      booking.studentId,
      {
        activeAlertsCount: booking.clinicalSummary.alerts.length,
        hasLatestEntry: booking.clinicalSummary.latestProgressEntry !== null
      }
    ])
  );
}

function findNextOperationalSlot(slots: InstructorDaySlot[], selectedDate: string) {
  const todayDate = getTodayIsoDate();

  if (selectedDate < todayDate) {
    return null;
  }

  if (selectedDate > todayDate) {
    return slots[0] ?? null;
  }

  const now = new Date();
  return slots.find((slot) => new Date(slot.endTime) >= now) ?? null;
}

export async function loadInstructorPage(session: SessionUser, params?: InstructorSearchParams) {
  const selectedDate = params?.date ?? getTodayIsoDate();
  const dateNavigation = buildDateNavigation(selectedDate);
  const instructorDaySchedule = await fetchInstructorDaySchedule(session, selectedDate);
  const instructorSlots = instructorDaySchedule.slots;
  const selectedSlot = instructorSlots.find((slot) => slot.id === params?.slotId) ?? instructorSlots[0] ?? null;
  const selectedSlotBookings = selectedSlot?.bookings ?? [];
  const selectedBooking = findSelectedBooking(selectedSlotBookings, params?.studentId);
  const selectedClinicalSummary = selectedBooking?.clinicalSummary ?? null;
  const careQueue = buildCareQueue(instructorSlots);
  const selectedBookingNavigation = buildSelectedBookingNavigation(careQueue, selectedBooking);
  const dayOperationalSummary = buildDayOperationalSummary(careQueue);
  const slotOperationalSummaries = buildSlotOperationalSummaries(instructorSlots);
  const bookingOperationalSummaries = buildBookingOperationalSummaries(selectedSlotBookings);

  return {
    selectedDate,
    dateNavigation,
    instructorSlots,
    totalStudents: instructorDaySchedule.totalBookings,
    selectedSlot,
    selectedSlotBookings,
    selectedBooking,
    careQueue,
    selectedBookingNavigation,
    dayOperationalSummary,
    slotOperationalSummaries,
    bookingOperationalSummaries,
    alertSummary: buildAlertSummary(selectedClinicalSummary),
    latestEntrySummary: buildLatestEntrySummary(selectedClinicalSummary),
    nextSlot: findNextOperationalSlot(instructorSlots, selectedDate)
  };
}
