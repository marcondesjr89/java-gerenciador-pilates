import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AnamnesisForm } from "@/app/alunos/anamnesis-form";
import type { StudentAnamnesis } from "@/lib/clinical";

const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock
  })
}));

const mockAnamnesis: StudentAnamnesis = {
  id: "anamnesis-1",
  studentId: "student-1",
  hasPathologies: true,
  pathologyDetails: "Hérnia de disco L4-L5",
  hasSurgeries: false,
  surgeryDetails: null,
  hasPain: true,
  painDetails: "Dor lombar",
  hasHypertension: false,
  hasOsteoporosis: false,
  isPregnant: false,
  medicalClearanceRequired: true,
  generalObservations: "Evitar flexão excessiva",
  alerts: ["Patologias: Hérnia de disco L4-L5", "Dor relatada: Dor lombar", "Exige liberação médica"],
  updatedAt: "2026-10-07T12:00:00Z"
};

describe("AnamnesisForm component", () => {
  beforeEach(() => {
    refreshMock.mockReset();
    global.fetch = vi.fn();
  });

  it("renderiza campos de anamnese pré-preenchidos quando informados", () => {
    render(
      <AnamnesisForm
        studentId="student-1"
        studentName="Mariana Silva"
        initialAnamnesis={mockAnamnesis}
      />
    );

    expect(screen.getByText("Editar Anamnese e Alertas de Mariana Silva")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Hérnia de disco L4-L5")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Dor lombar")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Evitar flexão excessiva")).toBeInTheDocument();
  });

  it("permite preencher e salvar anamnese com sucesso", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockAnamnesis), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    const onSaved = vi.fn();

    render(
      <AnamnesisForm
        studentId="student-1"
        studentName="Mariana Silva"
        initialAnamnesis={null}
        onSaved={onSaved}
      />
    );

    expect(screen.getByText("Cadastrar Anamnese e Alertas de Mariana Silva")).toBeInTheDocument();

    const pathologyCheckbox = screen.getByLabelText(/Possui patologias/i);
    fireEvent.click(pathologyCheckbox);

    const pathologyInput = await screen.findByPlaceholderText(/Hérnia de disco/i);
    fireEvent.change(pathologyInput, { target: { value: "Hérnia de disco L4-L5 - Evitar hiperflexão" } });

    const submitBtn = screen.getByRole("button", { name: /Salvar Anamnese/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/students/student-1/anamnesis",
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "application/json" }
        })
      );
      expect(screen.getByRole("status")).toHaveTextContent("Anamnese e alertas clinicos atualizados com sucesso!");
      expect(onSaved).toHaveBeenCalled();
    });
  });

  it("exibe mensagem de erro quando a API retorna erro", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Dados inconsistentes na anamnese." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      })
    );

    render(
      <AnamnesisForm
        studentId="student-1"
        studentName="Mariana Silva"
        initialAnamnesis={null}
      />
    );

    const submitBtn = screen.getByRole("button", { name: /Salvar Anamnese/i });
    fireEvent.click(submitBtn);

    const errorAlert = await screen.findByRole("alert");
    expect(errorAlert).toHaveTextContent("Dados inconsistentes na anamnese.");
  });
});
