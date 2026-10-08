import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreatePlanForm } from "@/app/financeiro/create-plan-form";

const refreshMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock
  })
}));

describe("CreatePlanForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("associa labels e inputs formalmente com id e htmlFor (WCAG 2.1 AA)", () => {
    render(<CreatePlanForm />);

    expect(screen.getByLabelText("Nome do plano")).toBeInTheDocument();
    expect(screen.getByLabelText("Valor (R$)")).toBeInTheDocument();
    expect(screen.getByLabelText("Ciclo em meses")).toBeInTheDocument();
  });

  it("exibe mensagem de erro acessível com role='alert' quando a requisição falha", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: "Já existe um plano com este nome." })
      })
    );

    render(<CreatePlanForm />);

    fireEvent.change(screen.getByLabelText("Nome do plano"), { target: { value: "Plano Ouro" } });
    fireEvent.change(screen.getByLabelText("Valor (R$)"), { target: { value: "350.00" } });

    fireEvent.submit(screen.getByRole("button", { name: "Cadastrar plano" }).closest("form")!);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Já existe um plano com este nome.");
  });

  it("protege contra duplo clique durante submissão concorrente", async () => {
    let resolveFetch: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });

    const fetchMock = vi.fn().mockImplementation(() => pendingPromise);
    vi.stubGlobal("fetch", fetchMock);

    render(<CreatePlanForm />);

    fireEvent.change(screen.getByLabelText("Nome do plano"), { target: { value: "Plano Prata" } });
    fireEvent.change(screen.getByLabelText("Valor (R$)"), { target: { value: "280.00" } });

    const form = screen.getByRole("button", { name: "Cadastrar plano" }).closest("form")!;

    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveFetch!({
      ok: true,
      json: async () => ({ id: "plan-1" })
    });

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Plano cadastrado com sucesso.");
    });
  });
});
