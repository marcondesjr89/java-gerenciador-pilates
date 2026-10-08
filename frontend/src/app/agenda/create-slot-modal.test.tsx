import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CreateSlotModal } from "@/app/agenda/create-slot-modal";
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
    specialties: ["PILATES_CLINICO", "REABILITACAO"]
  }
];

describe("CreateSlotModal", () => {
  it("não renderiza conteúdo quando isOpen é false", () => {
    const { container } = render(
      <CreateSlotModal
        isOpen={false}
        onClose={vi.fn()}
        selectedDate="2026-10-08"
        instructors={mockInstructors}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renderiza como diálogo acessível com título quando isOpen é true", () => {
    render(
      <CreateSlotModal
        isOpen={true}
        onClose={vi.fn()}
        selectedDate="2026-10-08"
        instructors={mockInstructors}
      />
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("heading", { name: "Novo Horário Operacional" })).toBeInTheDocument();
  });

  it("chama onClose ao clicar no botão fechar", () => {
    const handleClose = vi.fn();
    render(
      <CreateSlotModal
        isOpen={true}
        onClose={handleClose}
        selectedDate="2026-10-08"
        instructors={mockInstructors}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Fechar modal de novo horário" }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("chama onClose ao pressionar tecla Escape", () => {
    const handleClose = vi.fn();
    render(
      <CreateSlotModal
        isOpen={true}
        onClose={handleClose}
        selectedDate="2026-10-08"
        instructors={mockInstructors}
      />
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
