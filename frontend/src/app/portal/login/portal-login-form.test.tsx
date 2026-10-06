import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PortalLoginForm } from "@/app/portal/login/portal-login-form";

const replaceMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
    refresh: refreshMock
  })
}));

describe("PortalLoginForm a11y and behavior", () => {
  beforeEach(() => {
    replaceMock.mockReset();
    refreshMock.mockReset();
    global.fetch = vi.fn();
  });

  it("renderiza inputs acessiveis associados aos seus labels e atributos de autocompletar", () => {
    render(<PortalLoginForm />);

    const emailInput = screen.getByLabelText("E-mail");
    const passwordInput = screen.getByLabelText("Senha");
    const submitButton = screen.getByRole("button", { name: "Entrar no portal" });

    expect(emailInput).toHaveAttribute("id", "portal-email");
    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("autocomplete", "email");
    expect(emailInput).toBeRequired();

    expect(passwordInput).toHaveAttribute("id", "portal-password");
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(passwordInput).toHaveAttribute("autocomplete", "current-password");
    expect(passwordInput).toBeRequired();

    expect(submitButton).toHaveAttribute("type", "submit");
    expect(submitButton).not.toBeDisabled();
    expect(submitButton).toHaveAttribute("aria-busy", "false");
  });

  it("exibe mensagem de erro acessivel com role=alert ao falhar autenticacao", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Credenciais invalidas." }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      })
    );

    render(<PortalLoginForm />);

    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "aluno@exemplo.com" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "senhaerrada" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar no portal" }));

    const errorAlert = await screen.findByRole("alert");
    expect(errorAlert).toBeInTheDocument();
    expect(errorAlert).toHaveTextContent("Credenciais invalidas.");
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("realiza login com sucesso e redireciona para o portal", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(new Response(null, { status: 200 }));

    render(<PortalLoginForm />);

    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "aluno@exemplo.com" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "senha123" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar no portal" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/student-portal/session/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: "aluno@exemplo.com", password: "senha123" })
      });
      expect(replaceMock).toHaveBeenCalledWith("/portal");
      expect(refreshMock).toHaveBeenCalled();
    });
  });
});
