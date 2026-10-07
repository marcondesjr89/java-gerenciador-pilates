import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EditStudentModal } from "@/app/alunos/edit-student-modal";
import type { Student } from "@/lib/students";

const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock
  })
}));

const mockStudent: Student = {
  id: "student-1",
  fullName: "Mariana Silva",
  cpf: "11122233344",
  email: "mariana@pilates.local",
  phoneNumber: "85999991111",
  birthDate: "1990-01-15",
  status: "ACTIVE",
  lgpdConsent: true,
  createdAt: "2026-10-01T10:00:00Z"
};

describe("EditStudentModal component", () => {
  beforeEach(() => {
    refreshMock.mockReset();
    global.fetch = vi.fn();
  });

  it("renderiza campos preenchidos e permite fechar o modal", () => {
    const onClose = vi.fn();

    render(
      <EditStudentModal
        student={mockStudent}
        isOpen={true}
        onClose={onClose}
      />
    );

    expect(screen.getByText("Editar Dados do Aluno")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Mariana Silva")).toBeInTheDocument();
    expect(screen.getByDisplayValue("mariana@pilates.local")).toBeInTheDocument();

    const closeBtn = screen.getByLabelText("Fechar modal de edição");
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it("atualiza os dados cadastrais com sucesso", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ ...mockStudent, fullName: "Mariana Santos" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    const onClose = vi.fn();

    render(
      <EditStudentModal
        student={mockStudent}
        isOpen={true}
        onClose={onClose}
      />
    );

    const nameInput = screen.getByDisplayValue("Mariana Silva");
    fireEvent.change(nameInput, { target: { value: "Mariana Santos" } });

    const submitBtn = screen.getByRole("button", { name: /salvar alterações/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/students/student-1",
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "application/json" }
        })
      );
      expect(screen.getByRole("status")).toHaveTextContent("Dados do aluno atualizados com sucesso!");
    });
  });
});
