import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProgressEntryForm } from "@/app/instrutor/progress-entry-form";

const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock
  })
}));

describe("ProgressEntryForm", () => {
  beforeEach(() => {
    refreshMock.mockReset();
    global.fetch = vi.fn();
  });

  it("bloqueia novo envio acidental apos registrar evolucao e oferece proximo aluno", async () => {
    vi.mocked(global.fetch).mockResolvedValue(
      new Response(JSON.stringify({ id: "entry-1" }), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      })
    );

    render(
      <ProgressEntryForm
        studentId="student-1"
        nextStudentHref="/instrutor?date=2026-05-20&slotId=slot-2&studentId=student-2"
        nextStudentLabel="Bruno Aluno"
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Descreva a sessao, adaptacoes, resposta do aluno e proximo foco."), {
      target: { value: "Sessao registrada durante atendimento." }
    });
    fireEvent.click(screen.getByRole("button", { name: "Registrar evolucao" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(refreshMock).toHaveBeenCalled();
    });

    expect(await screen.findByText("Evolucao registrada com sucesso.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Evolucao registrada" })).toBeDisabled();
    expect(screen.getByRole("link", { name: "Ir para Bruno Aluno" })).toHaveAttribute(
      "href",
      "/instrutor?date=2026-05-20&slotId=slot-2&studentId=student-2"
    );

    fireEvent.click(screen.getByRole("button", { name: "Liberar novo registro" }));

    expect(screen.getByRole("button", { name: "Registrar evolucao" })).not.toBeDisabled();
    expect(screen.queryByText("Evolucao registrada com sucesso.")).not.toBeInTheDocument();
  });

  it("bloqueia reenvio quando a evolucao e criada mas o anexo falha", async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "entry-1" }), {
          status: 201,
          headers: { "Content-Type": "application/json" }
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "Falha no armazenamento do anexo." }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        })
      );

    render(<ProgressEntryForm studentId="student-1" />);

    fireEvent.change(screen.getByPlaceholderText("Descreva a sessao, adaptacoes, resposta do aluno e proximo foco."), {
      target: { value: "Sessao registrada com anexo." }
    });
    fireEvent.change(screen.getByLabelText("Anexo clinico opcional"), {
      target: {
        files: [new File(["imagem"], "evolucao.png", { type: "image/png" })]
      }
    });
    fireEvent.click(screen.getByRole("button", { name: "Registrar evolucao" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(refreshMock).toHaveBeenCalled();
    });

    expect(await screen.findByText("Falha no armazenamento do anexo.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Evolucao registrada" })).toBeDisabled();
    expect(screen.getByText("Este e o ultimo aluno da fila do dia.")).toBeInTheDocument();
  });

  it("mantem formulario editavel quando a evolucao nao e criada", async () => {
    vi.mocked(global.fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: "Notas obrigatorias." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      })
    );

    render(<ProgressEntryForm studentId="student-1" />);

    const notesField = screen.getByPlaceholderText("Descreva a sessao, adaptacoes, resposta do aluno e proximo foco.");
    fireEvent.change(notesField, {
      target: { value: "Sessao que falhara antes da criacao." }
    });
    fireEvent.click(screen.getByRole("button", { name: "Registrar evolucao" }));

    expect(await screen.findByText("Notas obrigatorias.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Registrar evolucao" })).not.toBeDisabled();
    expect(notesField).toHaveValue("Sessao que falhara antes da criacao.");
    expect(screen.queryByText("Este e o ultimo aluno da fila do dia.")).not.toBeInTheDocument();
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it("ignora toque duplo enquanto o envio principal esta em andamento", async () => {
    let resolveRequest: (response: Response) => void = () => {};
    vi.mocked(global.fetch).mockImplementation(
      () => new Promise<Response>((resolve) => {
        resolveRequest = resolve;
      })
    );

    render(<ProgressEntryForm studentId="student-1" />);

    fireEvent.change(screen.getByPlaceholderText("Descreva a sessao, adaptacoes, resposta do aluno e proximo foco."), {
      target: { value: "Sessao com envio lento." }
    });
    fireEvent.click(screen.getByRole("button", { name: "Registrar evolucao" }));
    fireEvent.click(screen.getByRole("button", { name: "Registrando..." }));

    expect(global.fetch).toHaveBeenCalledTimes(1);

    resolveRequest(
      new Response(JSON.stringify({ id: "entry-1" }), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      })
    );

    expect(await screen.findByText("Evolucao registrada com sucesso.")).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("libera novo registro sem reaproveitar anexo que falhou", async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "entry-1" }), {
          status: 201,
          headers: { "Content-Type": "application/json" }
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "Falha no armazenamento do anexo." }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "entry-2" }), {
          status: 201,
          headers: { "Content-Type": "application/json" }
        })
      );

    render(<ProgressEntryForm studentId="student-1" />);

    const notesField = screen.getByPlaceholderText("Descreva a sessao, adaptacoes, resposta do aluno e proximo foco.");
    fireEvent.change(notesField, {
      target: { value: "Sessao registrada com anexo." }
    });
    fireEvent.change(screen.getByLabelText("Anexo clinico opcional"), {
      target: {
        files: [new File(["imagem"], "evolucao.png", { type: "image/png" })]
      }
    });
    fireEvent.click(screen.getByRole("button", { name: "Registrar evolucao" }));

    expect(await screen.findByText("Falha no armazenamento do anexo.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Liberar novo registro" }));
    fireEvent.change(notesField, {
      target: { value: "Nova evolucao sem anexo reaproveitado." }
    });
    fireEvent.click(screen.getByRole("button", { name: "Registrar evolucao" }));

    expect(await screen.findByText("Evolucao registrada com sucesso.")).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });
});
