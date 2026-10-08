import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateBlockForm } from "@/app/agenda/create-block-form";
import type { InstructorUser } from "@/lib/users";

const mockInstructors: InstructorUser[] = [
  {
    id: "inst-1",
    fullName: "Instrutora Clara",
    email: "clara@pilates.com",
    role: "INSTRUCTOR",
    specialties: ["PILATES_CLINICO"]
  }
];

const refreshMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock
  })
}));

describe("CreateBlockForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("associa labels e inputs formalmente com id e htmlFor (WCAG 2.1 AA)", () => {
    render(<CreateBlockForm selectedDate="2026-10-08" instructors={mockInstructors} />);

    expect(screen.getByLabelText("Instrutor")).toBeInTheDocument();
    expect(screen.getByLabelText("Motivo")).toBeInTheDocument();
    expect(screen.getByLabelText("Inicio")).toBeInTheDocument();
    expect(screen.getByLabelText("Fim")).toBeInTheDocument();
  });

  it("exibe mensagem de erro com role='alert' quando a requisição falha", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: "Horário de bloqueio indisponível." })
      })
    );

    render(<CreateBlockForm selectedDate="2026-10-08" instructors={mockInstructors} />);

    fireEvent.change(screen.getByLabelText("Motivo"), { target: { value: "Reunião de equipe" } });
    fireEvent.change(screen.getByLabelText("Inicio"), { target: { value: "14:00" } });
    fireEvent.change(screen.getByLabelText("Fim"), { target: { value: "15:00" } });

    fireEvent.submit(screen.getByRole("button", { name: "Criar bloqueio" }).closest("form")!);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Horário de bloqueio indisponível.");
  });

  it("protege contra duplo clique durante submissão", async () => {
    let resolveFetch: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });

    const fetchMock = vi.fn().mockImplementation(() => pendingPromise);
    vi.stubGlobal("fetch", fetchMock);

    render(<CreateBlockForm selectedDate="2026-10-08" instructors={mockInstructors} />);

    fireEvent.change(screen.getByLabelText("Motivo"), { target: { value: "Manutenção" } });
    fireEvent.change(screen.getByLabelText("Inicio"), { target: { value: "10:00" } });
    fireEvent.change(screen.getByLabelText("Fim"), { target: { value: "11:00" } });

    const form = screen.getByRole("button", { name: "Criar bloqueio" }).closest("form")!;

    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveFetch!({
      ok: true,
      json: async () => ({ id: "block-created" })
    });

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Bloqueio criado com sucesso para a data selecionada.");
    });
  });
});
