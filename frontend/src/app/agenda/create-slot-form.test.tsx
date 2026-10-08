import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateSlotForm } from "@/app/agenda/create-slot-form";
import type { InstructorUser } from "@/lib/users";

const mockInstructors: InstructorUser[] = [
  {
    id: "inst-1",
    fullName: "Instrutora Clara",
    email: "clara@pilates.com",
    role: "INSTRUCTOR",
    specialties: ["PILATES_CLINICO", "REABILITACAO"]
  }
];

const refreshMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock
  })
}));

describe("CreateSlotForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("associa labels e inputs formalmente com id e htmlFor (WCAG 2.1 AA)", () => {
    render(<CreateSlotForm selectedDate="2026-10-08" instructors={mockInstructors} />);

    expect(screen.getByLabelText("Instrutor")).toBeInTheDocument();
    expect(screen.getByLabelText("Especialidade")).toBeInTheDocument();
    expect(screen.getByLabelText("Inicio")).toBeInTheDocument();
    expect(screen.getByLabelText("Fim")).toBeInTheDocument();
    expect(screen.getByLabelText("Capacidade")).toBeInTheDocument();
  });

  it("exibe mensagem de erro acessível com role='alert' quando a requisição falha", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: "Horário conflita com outro slot ativo." })
      })
    );

    render(<CreateSlotForm selectedDate="2026-10-08" instructors={mockInstructors} />);

    fireEvent.change(screen.getByLabelText("Inicio"), { target: { value: "08:00" } });
    fireEvent.change(screen.getByLabelText("Fim"), { target: { value: "09:00" } });

    fireEvent.submit(screen.getByRole("button", { name: "Criar horario" }).closest("form")!);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Horário conflita com outro slot ativo.");
  });

  it("protege contra submissão duplicada (duplo clique rápido)", async () => {
    let resolveFetch: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });

    const fetchMock = vi.fn().mockImplementation(() => pendingPromise);
    vi.stubGlobal("fetch", fetchMock);

    render(<CreateSlotForm selectedDate="2026-10-08" instructors={mockInstructors} />);

    fireEvent.change(screen.getByLabelText("Inicio"), { target: { value: "08:00" } });
    fireEvent.change(screen.getByLabelText("Fim"), { target: { value: "09:00" } });

    const form = screen.getByRole("button", { name: "Criar horario" }).closest("form")!;
    
    // Dispara duplo submit instantâneo
    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Conclui a promise pendente
    resolveFetch!({
      ok: true,
      json: async () => ({ id: "slot-created" })
    });

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Horario criado com sucesso para a data selecionada.");
    });
  });
});
