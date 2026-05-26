import { describe, expect, it, vi } from "vitest";
import type { SessionUser } from "@/lib/auth";
import { fetchInstructorDaySchedule } from "@/lib/schedule";
import { fetchApiJson } from "@/lib/http";

vi.mock("@/lib/http", () => ({
  fetchApiJson: vi.fn()
}));

const session: SessionUser = {
  accessToken: "token",
  email: "instrutor@teste.local",
  userId: "instructor-1",
  fullName: "Instrutor Teste",
  expiresAt: Date.now() + 60_000,
  role: "INSTRUCTOR"
};

describe("schedule client", () => {
  it("carrega agenda agregada do instrutor por data", async () => {
    vi.mocked(fetchApiJson).mockResolvedValue({
      instructorUserId: "instructor-1",
      date: "2026-05-20",
      totalSlots: 0,
      totalBookings: 0,
      slots: []
    });

    await fetchInstructorDaySchedule(session, "2026-05-20");

    expect(fetchApiJson).toHaveBeenCalledWith(
      session,
      "/api/v1/schedule-slots/instructor-day?date=2026-05-20",
      {
        errorMessage: "Nao foi possivel carregar a agenda do instrutor."
      }
    );
  });
});
