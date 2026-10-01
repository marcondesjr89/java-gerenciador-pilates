import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { InternalUser } from "@/lib/users";
import { UsersManagementPanel } from "./users-management-panel";

const mockUsers: InternalUser[] = [
  {
    id: "user-admin",
    email: "admin@test.local",
    fullName: "Administrador Geral",
    role: "ADMIN",
    specialties: [],
    active: true,
    createdAt: "2026-03-01T10:00:00Z"
  },
  {
    id: "user-instructor",
    email: "carla@test.local",
    fullName: "Carla Instrutora",
    role: "INSTRUCTOR",
    specialties: ["PILATES_SOLO", "PILATES_APARELHOS"],
    active: true,
    createdAt: "2026-03-05T14:30:00Z"
  },
  {
    id: "user-reception",
    email: "recepcao@test.local",
    fullName: "Renata Recepcao",
    role: "RECEPTION",
    specialties: [],
    active: false,
    createdAt: "2026-03-10T09:15:00Z"
  }
];

describe("UsersManagementPanel", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renderiza a lista de usuarios com status e badges corretos", () => {
    render(
      <UsersManagementPanel
        initialUsers={mockUsers}
        currentUserEmail="admin@test.local"
      />
    );

    expect(screen.getByText("Equipe Cadastrada (3)")).toBeInTheDocument();
    expect(screen.getByText("Administrador Geral")).toBeInTheDocument();
    expect(screen.getByText("Carla Instrutora")).toBeInTheDocument();
    expect(screen.getByText("Renata Recepcao")).toBeInTheDocument();

    // Badge "Você" para o usuário atual
    expect(screen.getByText("Você")).toBeInTheDocument();

    // Badges de status
    expect(screen.getAllByText("Ativo")).toHaveLength(2);
    expect(screen.getByText("Inativo")).toBeInTheDocument();
  });

  it("filtra usuarios por termo de busca", () => {
    render(
      <UsersManagementPanel
        initialUsers={mockUsers}
        currentUserEmail="admin@test.local"
      />
    );

    const searchInput = screen.getByPlaceholderText("Buscar por nome ou e-mail...");
    fireEvent.change(searchInput, { target: { value: "carla" } });

    expect(screen.getByText("Equipe Cadastrada (1)")).toBeInTheDocument();
    expect(screen.getByText("Carla Instrutora")).toBeInTheDocument();
    expect(screen.queryByText("Administrador Geral")).not.toBeInTheDocument();
  });

  it("permite cadastrar novo usuario com sucesso e atualiza a lista", async () => {
    const newUser: InternalUser = {
      id: "user-new",
      email: "novo@test.local",
      fullName: "Novo Instrutor",
      role: "INSTRUCTOR",
      specialties: ["PILATES_SOLO"],
      active: true,
      createdAt: "2026-10-01T12:00:00Z"
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => newUser
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <UsersManagementPanel
        initialUsers={mockUsers}
        currentUserEmail="admin@test.local"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /novo usuário/i }));

    fireEvent.change(screen.getByPlaceholderText("Ex: Marina Silva"), {
      target: { value: "Novo Instrutor" }
    });
    fireEvent.change(screen.getByPlaceholderText("marina@studio.local"), {
      target: { value: "novo@test.local" }
    });
    fireEvent.change(screen.getByPlaceholderText("Mínimo 8 caracteres"), {
      target: { value: "SenhaSegura123" }
    });

    fireEvent.click(screen.getByRole("button", { name: "Solo" }));

    fireEvent.click(screen.getByRole("button", { name: /cadastrar usuário/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/users",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            fullName: "Novo Instrutor",
            email: "novo@test.local",
            password: "SenhaSegura123",
            role: "INSTRUCTOR",
            specialties: ["PILATES_SOLO"]
          })
        })
      );
    });

    expect(await screen.findByText("Usuário Novo Instrutor cadastrado com sucesso!")).toBeInTheDocument();
    expect(screen.getByText("Equipe Cadastrada (4)")).toBeInTheDocument();
  });

  it("bloqueia clique duplo concorrente no envio do cadastro", async () => {
    let resolveApi: (value: unknown) => void = () => {};
    const pendingPromise = new Promise((resolve) => {
      resolveApi = resolve;
    });

    const fetchMock = vi.fn().mockImplementation(() => pendingPromise);
    vi.stubGlobal("fetch", fetchMock);

    render(
      <UsersManagementPanel
        initialUsers={mockUsers}
        currentUserEmail="admin@test.local"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /novo usuário/i }));

    fireEvent.change(screen.getByPlaceholderText("Ex: Marina Silva"), {
      target: { value: "Instrutor Teste" }
    });
    fireEvent.change(screen.getByPlaceholderText("marina@studio.local"), {
      target: { value: "teste@studio.local" }
    });
    fireEvent.change(screen.getByPlaceholderText("Mínimo 8 caracteres"), {
      target: { value: "Senha12345" }
    });

    const submitBtn = screen.getByRole("button", { name: /cadastrar usuário/i });
    fireEvent.click(submitBtn);
    fireEvent.click(submitBtn);
    fireEvent.click(submitBtn);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveApi({
      ok: true,
      json: async () => ({
        id: "user-created",
        email: "teste@studio.local",
        fullName: "Instrutor Teste",
        role: "INSTRUCTOR",
        specialties: [],
        active: true,
        createdAt: "2026-10-01T12:00:00Z"
      })
    });
  });

  it("trata erro da API de forma graciosa sem perder o formulario", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Já existe um usuário com este e-mail." })
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <UsersManagementPanel
        initialUsers={mockUsers}
        currentUserEmail="admin@test.local"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /novo usuário/i }));

    fireEvent.change(screen.getByPlaceholderText("Ex: Marina Silva"), {
      target: { value: "Instrutor Duplicado" }
    });
    fireEvent.change(screen.getByPlaceholderText("marina@studio.local"), {
      target: { value: "duplicado@studio.local" }
    });
    fireEvent.change(screen.getByPlaceholderText("Mínimo 8 caracteres"), {
      target: { value: "Senha12345" }
    });

    fireEvent.click(screen.getByRole("button", { name: /cadastrar usuário/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Já existe um usuário com este e-mail."
    );

    // Formulario continua aberto e preenchido
    expect(screen.getByDisplayValue("Instrutor Duplicado")).toBeInTheDocument();
  });

  it("desabilita o botao de inativar para o usuario atualmente logado", () => {
    render(
      <UsersManagementPanel
        initialUsers={mockUsers}
        currentUserEmail="admin@test.local"
      />
    );

    // O admin logado não pode ser inativado
    const adminToggleBtn = screen.getAllByRole("button", { name: /inativar/i })[0];
    expect(adminToggleBtn).toBeDisabled();
    expect(adminToggleBtn).toHaveAttribute(
      "title",
      "Você não pode inativar seu próprio usuário."
    );
  });
});
