import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AgendaHeaderActions } from "@/app/agenda/agenda-header-actions";
import type { InstructorUser } from "@/lib/users";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn()
  })
}));

const mockInstructors: InstructorUser[] = [
  {
    id: "inst-1",
    fullName: "Instrutora Clara",
    email: "clara@pilates.com",
    role: "INSTRUCTOR",
    specialties: ["PILATES_CLINICO"]
  }
];

describe("AgendaHeaderActions", () => {
  it("renderiza botões de ação e abre os modais correspondentes ao clicar", () => {
    render(<AgendaHeaderActions selectedDate="2026-10-08" instructors={mockInstructors} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Clica em Novo Horário
    fireEvent.click(screen.getByRole("button", { name: "Novo Horário" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Novo Horário Operacional" })).toBeInTheDocument();

    // Fecha o modal
    fireEvent.click(screen.getByRole("button", { name: "Fechar modal de novo horário" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Clica em Bloquear Horário
    fireEvent.click(screen.getByRole("button", { name: "Bloquear Horário" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Bloquear Horário na Agenda" })).toBeInTheDocument();
  });
});
