import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadInstructorPage } from "@/app/instrutor/load-instructor-page";
import type { SessionUser } from "@/lib/auth";
import { fetchInstructorDaySchedule } from "@/lib/schedule";
import type { InstructorDaySchedule, InstructorDaySlot } from "@/lib/schedule-types";

vi.mock("@/lib/schedule", () => ({
  fetchInstructorDaySchedule: vi.fn()
}));

const session: SessionUser = {
  accessToken: "token",
  email: "instrutor@teste.local",
  userId: "instructor-1",
  fullName: "Instrutor Teste",
  expiresAt: Date.now() + 60_000,
  role: "INSTRUCTOR"
};

function buildSlot(overrides: Partial<InstructorDaySlot>): InstructorDaySlot {
  return {
    id: "slot-1",
    instructorUserId: "instructor-1",
    instructorName: "Instrutor Teste",
    requiredSpecialty: "PILATES_SOLO",
    startTime: "2026-05-20T10:00:00Z",
    endTime: "2026-05-20T11:00:00Z",
    capacity: 3,
    bookedCount: 1,
    availableSpots: 2,
    bookings: [
      {
        id: "booking-1",
        slotId: "slot-1",
        studentId: "student-1",
        studentName: "Ana Aluna",
        status: "BOOKED",
        clinicalSummary: {
          studentId: "student-1",
          alerts: ["Dor em acompanhamento"],
          generalObservations: "Evitar carga axial intensa.",
          latestProgressEntry: {
            id: "entry-1",
            recordedAt: "2026-05-19T12:00:00Z",
            instructorNotes: "Boa resposta ao controle de tronco.",
            flexibilityScore: 70,
            strengthScore: null,
            painLevel: 2
          }
        }
      }
    ],
    ...overrides
  };
}

function buildSchedule(slots: InstructorDaySlot[]): InstructorDaySchedule {
  return {
    instructorUserId: "instructor-1",
    date: "2026-05-20",
    totalSlots: slots.length,
    totalBookings: slots.reduce((sum, slot) => sum + slot.bookings.length, 0),
    slots
  };
}

describe("loadInstructorPage", () => {
  beforeEach(() => {
    vi.mocked(fetchInstructorDaySchedule).mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("seleciona o primeiro slot e primeiro aluno quando a URL nao informa selecao", async () => {
    vi.mocked(fetchInstructorDaySchedule).mockResolvedValue(buildSchedule([buildSlot({})]));

    const result = await loadInstructorPage(session, { date: "2026-05-20" });

    expect(fetchInstructorDaySchedule).toHaveBeenCalledWith(session, "2026-05-20");
    expect(result.dateNavigation).toMatchObject({
      previousDate: "2026-05-19",
      nextDate: "2026-05-21"
    });
    expect(result.dateNavigation.todayDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result.selectedSlot?.id).toBe("slot-1");
    expect(result.selectedBooking?.studentId).toBe("student-1");
    expect(result.alertSummary).toMatchObject({
      alerts: ["Dor em acompanhamento"],
      generalObservations: "Evitar carga axial intensa.",
      hasActiveAlerts: true
    });
    expect(result.latestEntrySummary).toMatchObject({
      scoreSummary: "Flexibilidade: 70 | Forca: - | Dor: 2",
      instructorNotes: "Boa resposta ao controle de tronco."
    });
    expect(result.careQueue).toEqual([
      expect.objectContaining({
        bookingId: "booking-1",
        slotId: "slot-1",
        studentId: "student-1",
        hasActiveAlerts: true,
        hasLatestEntry: true
      })
    ]);
    expect(result.selectedBookingNavigation).toMatchObject({
      selectedIndex: 0,
      previous: null,
      next: null
    });
    expect(result.dayOperationalSummary).toMatchObject({
      activeAlertsCount: 1,
      pendingProgressCount: 0,
      completedProgressCount: 1,
      completionPercentage: 100,
      nextPendingProgress: null
    });
    expect(result.dayOperationalSummary.priorityQueue).toEqual([
      expect.objectContaining({
        studentId: "student-1",
        hasActiveAlerts: true,
        hasLatestEntry: true
      })
    ]);
    expect(result.slotOperationalSummaries).toEqual({
      "slot-1": {
        activeAlertsCount: 1,
        pendingProgressCount: 0
      }
    });
    expect(result.bookingOperationalSummaries).toEqual({
      "student-1": {
        activeAlertsCount: 1,
        hasLatestEntry: true
      }
    });
  });

  it("respeita slot e aluno selecionados quando eles existem no agregado", async () => {
    const secondSlot = buildSlot({
      id: "slot-2",
      bookings: [
        {
          id: "booking-2",
          slotId: "slot-2",
          studentId: "student-2",
          studentName: "Bruno Aluno",
          status: "BOOKED",
          clinicalSummary: {
            studentId: "student-2",
            alerts: [],
            generalObservations: null,
            latestProgressEntry: null
          }
        }
      ]
    });
    vi.mocked(fetchInstructorDaySchedule).mockResolvedValue(buildSchedule([buildSlot({}), secondSlot]));

    const result = await loadInstructorPage(session, {
      date: "2026-05-20",
      slotId: "slot-2",
      studentId: "student-2"
    });

    expect(result.selectedSlot?.id).toBe("slot-2");
    expect(result.selectedBooking?.studentName).toBe("Bruno Aluno");
    expect(result.alertSummary).toMatchObject({
      alerts: [],
      generalObservations: "Sem observacoes gerais registradas.",
      hasActiveAlerts: false
    });
    expect(result.latestEntrySummary).toBeNull();
  });

  it("monta fila de atendimento e navegacao entre alunos do dia", async () => {
    const firstSlot = buildSlot({
      id: "slot-1",
      startTime: "2026-05-20T08:00:00Z",
      endTime: "2026-05-20T09:00:00Z"
    });
    const secondSlot = buildSlot({
      id: "slot-2",
      startTime: "2026-05-20T09:00:00Z",
      endTime: "2026-05-20T10:00:00Z",
      bookings: [
        {
          id: "booking-2",
          slotId: "slot-2",
          studentId: "student-2",
          studentName: "Bruno Aluno",
          status: "BOOKED",
          clinicalSummary: {
            studentId: "student-2",
            alerts: [],
            generalObservations: null,
            latestProgressEntry: null
          }
        }
      ]
    });
    vi.mocked(fetchInstructorDaySchedule).mockResolvedValue(buildSchedule([firstSlot, secondSlot]));

    const result = await loadInstructorPage(session, {
      date: "2026-05-20",
      slotId: "slot-2",
      studentId: "student-2"
    });

    expect(result.careQueue).toEqual([
      expect.objectContaining({
        bookingId: "booking-1",
        slotId: "slot-1",
        studentId: "student-1",
        startTime: "2026-05-20T08:00:00Z",
        hasActiveAlerts: true,
        hasLatestEntry: true
      }),
      expect.objectContaining({
        bookingId: "booking-2",
        slotId: "slot-2",
        studentId: "student-2",
        startTime: "2026-05-20T09:00:00Z",
        hasActiveAlerts: false,
        hasLatestEntry: false
      })
    ]);
    expect(result.selectedBookingNavigation.selectedIndex).toBe(1);
    expect(result.selectedBookingNavigation.previous).toMatchObject({
      studentId: "student-1",
      slotId: "slot-1"
    });
    expect(result.selectedBookingNavigation.next).toBeNull();
    expect(result.dayOperationalSummary).toMatchObject({
      activeAlertsCount: 1,
      pendingProgressCount: 1,
      completedProgressCount: 1,
      completionPercentage: 50,
      nextPendingProgress: expect.objectContaining({
        studentId: "student-2",
        slotId: "slot-2"
      })
    });
    expect(result.dayOperationalSummary.priorityQueue).toEqual([
      expect.objectContaining({
        studentId: "student-1",
        hasActiveAlerts: true,
        hasLatestEntry: true
      }),
      expect.objectContaining({
        studentId: "student-2",
        hasActiveAlerts: false,
        hasLatestEntry: false
      })
    ]);
    expect(result.slotOperationalSummaries).toEqual({
      "slot-1": {
        activeAlertsCount: 1,
        pendingProgressCount: 0
      },
      "slot-2": {
        activeAlertsCount: 0,
        pendingProgressCount: 1
      }
    });
    expect(result.bookingOperationalSummaries).toEqual({
      "student-2": {
        activeAlertsCount: 0,
        hasLatestEntry: false
      }
    });
  });

  it("mantem estado vazio quando o instrutor nao tem agenda no dia", async () => {
    vi.mocked(fetchInstructorDaySchedule).mockResolvedValue(buildSchedule([]));

    const result = await loadInstructorPage(session, { date: "2026-05-20" });

    expect(result.instructorSlots).toEqual([]);
    expect(result.selectedSlot).toBeNull();
    expect(result.selectedBooking).toBeNull();
    expect(result.nextSlot).toBeNull();
    expect(result.totalStudents).toBe(0);
    expect(result.careQueue).toEqual([]);
    expect(result.selectedBookingNavigation).toMatchObject({
      selectedIndex: -1,
      previous: null,
      next: null
    });
    expect(result.dayOperationalSummary).toEqual({
      activeAlertsCount: 0,
      pendingProgressCount: 0,
      completedProgressCount: 0,
      completionPercentage: 0,
      nextPendingProgress: null,
      priorityQueue: []
    });
    expect(result.slotOperationalSummaries).toEqual({});
    expect(result.bookingOperationalSummaries).toEqual({});
  });

  it("calcula a proxima aula a partir do dia selecionado e horario atual", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-20T12:30:00Z"));
    const finishedSlot = buildSlot({
      id: "slot-1",
      startTime: "2026-05-20T10:00:00Z",
      endTime: "2026-05-20T11:00:00Z"
    });
    const currentSlot = buildSlot({
      id: "slot-2",
      startTime: "2026-05-20T12:00:00Z",
      endTime: "2026-05-20T13:00:00Z"
    });
    vi.mocked(fetchInstructorDaySchedule).mockResolvedValue(buildSchedule([finishedSlot, currentSlot]));

    const result = await loadInstructorPage(session, { date: "2026-05-20" });

    expect(result.nextSlot?.id).toBe("slot-2");
  });

  it("nao mostra proxima aula para data passada e usa o primeiro horario em data futura", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-20T12:30:00Z"));
    const slot = buildSlot({
      id: "slot-1",
      startTime: "2026-05-21T10:00:00Z",
      endTime: "2026-05-21T11:00:00Z"
    });

    vi.mocked(fetchInstructorDaySchedule).mockResolvedValue(buildSchedule([slot]));
    const pastResult = await loadInstructorPage(session, { date: "2026-05-19" });
    expect(pastResult.nextSlot).toBeNull();

    vi.mocked(fetchInstructorDaySchedule).mockResolvedValue(buildSchedule([slot]));
    const futureResult = await loadInstructorPage(session, { date: "2026-05-21" });
    expect(futureResult.nextSlot?.id).toBe("slot-1");
  });
});
