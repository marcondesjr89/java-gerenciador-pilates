import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "@/app/dashboard/page";
import type { DashboardKpis } from "@/lib/dashboard";
import type { ScheduleSlot } from "@/lib/schedule";

const fetchDashboardKpisMock = vi.fn();
const fetchScheduleSlotsMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn()
  })
}));

vi.mock("@/lib/auth", () => ({
  requireInternalSession: vi.fn().mockResolvedValue({
    id: "admin-1",
    email: "admin@pilates.local",
    role: "ADMIN"
  })
}));

vi.mock("@/lib/dashboard", () => ({
  fetchDashboardKpis: (...args: unknown[]) => fetchDashboardKpisMock(...args)
}));

vi.mock("@/lib/schedule", () => ({
  fetchScheduleSlots: (...args: unknown[]) => fetchScheduleSlotsMock(...args)
}));

const mockDashboard: DashboardKpis = {
  indicators: [
    { key: "churnRate", label: "Churn Rate", value: 3.5, description: "Taxa de cancelamento" },
    { key: "occupancyRate", label: "Taxa de ocupacao", value: 82.0, description: "Uso da agenda" },
    { key: "delinquencyRate", label: "Inadimplencia", value: 1.2, description: "Faturas vencidas" }
  ]
};

const mockSlots: ScheduleSlot[] = [
  {
    id: "slot-1",
    instructorUserId: "inst-1",
    instructorName: "Clara Instrutora",
    requiredSpecialty: "PILATES_CLINICO",
    startTime: "2026-10-08T11:00:00Z",
    endTime: "2026-10-08T12:00:00Z",
    capacity: 4,
    bookedCount: 3,
    availableSpots: 1
  }
];

describe("DashboardPage", () => {
  beforeEach(() => {
    fetchDashboardKpisMock.mockReset();
    fetchScheduleSlotsMock.mockReset();
  });

  it("renderiza indicadores KPI, agenda do dia com slots reais e atalhos operacionais", async () => {
    fetchDashboardKpisMock.mockResolvedValue(mockDashboard);
    fetchScheduleSlotsMock.mockResolvedValue(mockSlots);

    render(await DashboardPage());

    expect(screen.getByText("Studio em operacao")).toBeInTheDocument();
    expect(screen.getByText("3,50%")).toBeInTheDocument();
    expect(screen.getByText("82,00%")).toBeInTheDocument();
    expect(screen.getByText("1,20%")).toBeInTheDocument();

    // Valida agenda do dia real
    expect(screen.getByText("Pilates Clinico")).toBeInTheDocument();
    expect(screen.getByText(/Clara Instrutora/)).toBeInTheDocument();
    expect(screen.getByText("3/4 vagas")).toBeInTheDocument();

    // Valida atalhos operacionais
    expect(screen.getByText("Acesso rápido operacional")).toBeInTheDocument();
    expect(screen.getByText("admin@pilates.local")).toBeInTheDocument();
    expect(screen.getAllByText("Agenda").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("Alunos").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("Financeiro").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("Equipe").length).toBeGreaterThanOrEqual(2);
  });

  it("renderiza estado amigável quando não há slots na agenda de hoje", async () => {
    fetchDashboardKpisMock.mockResolvedValue(mockDashboard);
    fetchScheduleSlotsMock.mockResolvedValue([]);

    render(await DashboardPage());

    expect(screen.getByText("Nenhum horário cadastrado para hoje")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /abrir agenda/i })).toBeInTheDocument();
  });
});
