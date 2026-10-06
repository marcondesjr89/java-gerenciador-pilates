import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/app/login/login-form";

const replaceMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
    refresh: refreshMock
  })
}));

describe("LoginForm a11y and behavior", () => {
  beforeEach(() => {
    replaceMock.mockReset();
    refreshMock.mockReset();
    global.fetch = vi.fn();
  });

  it("renderiza inputs acessiveis associados aos seus labels e atributos de autocompletar", () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText("E-mail");
    const passwordInput = screen.getByLabelText("Senha");
    const submitButton = screen.getByRole("button", { name: "Entrar no painel" });

    expect(emailInput).toHaveAttribute("id", "login-email");
    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("autocomplete", "email");
    expect(emailInput).toBeRequired();

    expect(passwordInput).toHaveAttribute("id", "login-password");
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

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "admin@teste.local" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "senhaerrada" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar no painel" }));

    const errorAlert = await screen.findByRole("alert");
    expect(errorAlert).toBeInTheDocument();
    expect(errorAlert).toHaveTextContent("Credenciais invalidas.");
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("realiza login como instrutor e redireciona para a area do instrutor", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ role: "INSTRUCTOR" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "instrutor@teste.local" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "senha123" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar no painel" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/session/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: "instrutor@teste.local", password: "senha123" })
      });
      expect(replaceMock).toHaveBeenCalledWith("/instrutor");
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("realiza login como admin e redireciona para o dashboard", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ role: "ADMIN" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "admin@teste.local" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "senha123" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar no painel" }));

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/dashboard");
      expect(refreshMock).toHaveBeenCalled();
    });
  });
});
