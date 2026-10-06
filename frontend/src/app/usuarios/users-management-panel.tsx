"use client";

import { useId, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  KeyRound,
  Pencil,
  Plus,
  Search,
  UserCheck,
  UserX,
  X
} from "lucide-react";
import {
  type InstructorSpecialty,
  type InternalUser,
  type UserRole,
  INSTRUCTOR_SPECIALTY_LABELS,
  USER_ROLE_LABELS
} from "@/lib/users";

const ALL_ROLES: UserRole[] = ["ADMIN", "RECEPTION", "INSTRUCTOR"];
const ALL_SPECIALTIES: InstructorSpecialty[] = [
  "PILATES_SOLO",
  "PILATES_APARELHOS",
  "PILATES_GESTANTES",
  "PILATES_REABILITACAO",
  "PILATES_IDOSOS"
];

type Props = {
  initialUsers: InternalUser[];
  currentUserEmail: string;
};

export function UsersManagementPanel({ initialUsers, currentUserEmail }: Props) {
  const [users, setUsers] = useState<InternalUser[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Estados de modais / formulários
  const [isCreating, setIsCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<InternalUser | null>(null);
  const [passwordTargetUser, setPasswordTargetUser] = useState<InternalUser | null>(null);

  // Estados de feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  // Blindagem contra concorrência e duplo clique
  const mutationInFlightRef = useRef(false);

  // Campos do form de criação
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState<UserRole>("INSTRUCTOR");
  const [createSpecialties, setCreateSpecialties] = useState<InstructorSpecialty[]>([]);

  // Campos do form de edição
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<UserRole>("INSTRUCTOR");
  const [editSpecialties, setEditSpecialties] = useState<InstructorSpecialty[]>([]);

  // Campo do form de senha
  const [newPassword, setNewPassword] = useState("");

  const searchInputId = useId();

  // Filtragem memoizada
  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesSearch =
        !term ||
        u.fullName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term);

      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && u.active) ||
        (statusFilter === "INACTIVE" && !u.active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  function resetCreateForm() {
    setCreateName("");
    setCreateEmail("");
    setCreatePassword("");
    setCreateRole("INSTRUCTOR");
    setCreateSpecialties([]);
    setIsCreating(false);
  }

  function startEdit(user: InternalUser) {
    setEditingUser(user);
    setEditName(user.fullName);
    setEditRole(user.role);
    setEditSpecialties([...user.specialties]);
    setErrorMessage(null);
  }

  function startPasswordChange(user: InternalUser) {
    setPasswordTargetUser(user);
    setNewPassword("");
    setErrorMessage(null);
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (mutationInFlightRef.current) return;

    if (!createEmail.trim() || !createName.trim() || !createPassword.trim()) {
      setErrorMessage("Preencha todos os campos obrigatórios.");
      return;
    }

    if (createPassword.length < 8) {
      setErrorMessage("A senha provisória deve possuir no mínimo 8 caracteres.");
      return;
    }

    mutationInFlightRef.current = true;
    setIsPending(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: createName.trim(),
          email: createEmail.trim(),
          password: createPassword,
          role: createRole,
          specialties: createRole === "INSTRUCTOR" ? createSpecialties : []
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.detail || "Erro ao cadastrar usuário.");
      }

      setUsers((prev) => [data, ...prev]);
      setSuccessMessage(`Usuário ${data.fullName} cadastrado com sucesso!`);
      resetCreateForm();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      mutationInFlightRef.current = false;
      setIsPending(false);
    }
  }

  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser || mutationInFlightRef.current) return;

    if (!editName.trim()) {
      setErrorMessage("O nome completo é obrigatório.");
      return;
    }

    mutationInFlightRef.current = true;
    setIsPending(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: editName.trim(),
          role: editRole,
          specialties: editRole === "INSTRUCTOR" ? editSpecialties : []
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.detail || "Erro ao atualizar usuário.");
      }

      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? data : u)));
      setSuccessMessage(`Dados de ${data.fullName} atualizados.`);
      setEditingUser(null);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      mutationInFlightRef.current = false;
      setIsPending(false);
    }
  }

  async function handleToggleStatus(user: InternalUser) {
    if (mutationInFlightRef.current) return;

    if (user.email.toLowerCase() === currentUserEmail.toLowerCase()) {
      setErrorMessage("Você não pode inativar seu próprio usuário logado.");
      return;
    }

    const nextActive = !user.active;
    const actionLabel = nextActive ? "ativar" : "inativar";

    if (!window.confirm(`Deseja realmente ${actionLabel} o acesso de ${user.fullName}?`)) {
      return;
    }

    mutationInFlightRef.current = true;
    setIsPending(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/users/${user.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: nextActive })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.detail || `Erro ao ${actionLabel} usuário.`);
      }

      setUsers((prev) => prev.map((u) => (u.id === user.id ? data : u)));
      setSuccessMessage(`Usuário ${data.fullName} agora está ${nextActive ? "ativo" : "inativo"}.`);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      mutationInFlightRef.current = false;
      setIsPending(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordTargetUser || mutationInFlightRef.current) return;

    if (newPassword.length < 8) {
      setErrorMessage("A nova senha deve possuir pelo menos 8 caracteres.");
      return;
    }

    mutationInFlightRef.current = true;
    setIsPending(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/users/${passwordTargetUser.id}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.detail || "Erro ao redefinir senha.");
      }

      setSuccessMessage(`Senha de ${passwordTargetUser.fullName} alterada com sucesso!`);
      setPasswordTargetUser(null);
      setNewPassword("");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      mutationInFlightRef.current = false;
      setIsPending(false);
    }
  }

  function toggleSpecialtySelection(
    current: InstructorSpecialty[],
    setter: (val: InstructorSpecialty[]) => void,
    specialty: InstructorSpecialty
  ) {
    if (current.includes(specialty)) {
      setter(current.filter((s) => s !== specialty));
    } else {
      setter([...current, specialty]);
    }
  }

  return (
    <div className="space-y-6">
      {/* Alertas de Feedback */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-500 hover:text-emerald-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Barra de Acoes e Filtros */}
      <section className="flex flex-col gap-4 rounded-[26px] border border-brand-line bg-brand-surface p-5 shadow-panel lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <label htmlFor={searchInputId} className="sr-only">
              Buscar usuário
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-subtext" />
            <input
              id={searchInputId}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              className="w-full rounded-2xl border border-brand-line bg-brand-surfaceSoft py-2.5 pl-9 pr-3 text-sm text-brand-ink placeholder:text-brand-subtext focus:border-brand-primary focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-2xl border border-brand-line bg-brand-surfaceSoft px-3 py-2.5 text-sm text-brand-ink focus:border-brand-primary focus:outline-none"
            >
              <option value="ALL">Todos os perfis</option>
              <option value="ADMIN">Administradores</option>
              <option value="RECEPTION">Recepção</option>
              <option value="INSTRUCTOR">Instrutores</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-2xl border border-brand-line bg-brand-surfaceSoft px-3 py-2.5 text-sm text-brand-ink focus:border-brand-primary focus:outline-none"
            >
              <option value="ALL">Todos os status</option>
              <option value="ACTIVE">Ativos</option>
              <option value="INACTIVE">Inativos</option>
            </select>
          </div>
        </div>

        <div>
          {!isCreating && (
            <button
              type="button"
              onClick={() => {
                setIsCreating(true);
                setEditingUser(null);
                setPasswordTargetUser(null);
                setErrorMessage(null);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-primary/90 sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Novo Usuário
            </button>
          )}
        </div>
      </section>

      {/* Formulario de Criacao */}
      {isCreating && (
        <section className="rounded-[26px] border border-brand-primary/30 bg-brand-surface p-6 shadow-panel">
          <div className="flex items-center justify-between border-b border-brand-line pb-4">
            <div>
              <h2 className="text-lg font-semibold text-brand-secondary">Cadastrar Novo Membro da Equipe</h2>
              <p className="text-xs text-brand-subtext">Crie a conta de acesso para a equipe interna do studio.</p>
            </div>
            <button
              type="button"
              onClick={resetCreateForm}
              className="rounded-xl p-2 text-brand-subtext hover:bg-brand-surfaceSoft hover:text-brand-ink"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleCreateUser} className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-subtext">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Ex: Marina Silva"
                  className="mt-1 w-full rounded-2xl border border-brand-line bg-brand-surfaceSoft px-3 py-2 text-sm text-brand-ink focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-subtext">
                  E-mail de Acesso *
                </label>
                <input
                  type="email"
                  required
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="marina@studio.local"
                  className="mt-1 w-full rounded-2xl border border-brand-line bg-brand-surfaceSoft px-3 py-2 text-sm text-brand-ink focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-subtext">
                  Senha Provisória *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="mt-1 w-full rounded-2xl border border-brand-line bg-brand-surfaceSoft px-3 py-2 text-sm text-brand-ink focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-subtext">
                  Perfil de Acesso *
                </label>
                <select
                  value={createRole}
                  onChange={(e) => setCreateRole(e.target.value as UserRole)}
                  className="mt-1 w-full rounded-2xl border border-brand-line bg-brand-surfaceSoft px-3 py-2 text-sm text-brand-ink focus:border-brand-primary focus:outline-none"
                >
                  {ALL_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {USER_ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {createRole === "INSTRUCTOR" && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-subtext">
                  Especialidades do Instrutor
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ALL_SPECIALTIES.map((spec) => {
                    const isSelected = createSpecialties.includes(spec);
                    return (
                      <button
                        type="button"
                        key={spec}
                        onClick={() =>
                          toggleSpecialtySelection(createSpecialties, setCreateSpecialties, spec)
                        }
                        className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                          isSelected
                            ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                            : "border-brand-line bg-brand-surfaceSoft text-brand-subtext hover:border-brand-primary/40"
                        }`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                        {INSTRUCTOR_SPECIALTY_LABELS[spec]}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={resetCreateForm}
                disabled={isPending}
                className="rounded-2xl border border-brand-line px-4 py-2 text-sm font-medium text-brand-subtext hover:bg-brand-surfaceSoft hover:text-brand-ink"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 rounded-2xl bg-brand-primary px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-primary/90 disabled:opacity-50"
              >
                {isPending ? "Cadastrando..." : "Cadastrar Usuário"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Modal / Card de Edicao */}
      {editingUser && (
        <section className="rounded-[26px] border border-blue-300 bg-brand-surface p-6 shadow-panel">
          <div className="flex items-center justify-between border-b border-brand-line pb-4">
            <div>
              <h2 className="text-lg font-semibold text-brand-secondary">
                Editar Usuário: {editingUser.fullName}
              </h2>
              <p className="text-xs text-brand-subtext">E-mail: {editingUser.email}</p>
            </div>
            <button
              type="button"
              onClick={() => setEditingUser(null)}
              className="rounded-xl p-2 text-brand-subtext hover:bg-brand-surfaceSoft hover:text-brand-ink"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleUpdateUser} className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-subtext">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-brand-line bg-brand-surfaceSoft px-3 py-2 text-sm text-brand-ink focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-subtext">
                  Perfil de Acesso *
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="mt-1 w-full rounded-2xl border border-brand-line bg-brand-surfaceSoft px-3 py-2 text-sm text-brand-ink focus:border-brand-primary focus:outline-none"
                >
                  {ALL_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {USER_ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {editRole === "INSTRUCTOR" && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-subtext">
                  Especialidades do Instrutor
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ALL_SPECIALTIES.map((spec) => {
                    const isSelected = editSpecialties.includes(spec);
                    return (
                      <button
                        type="button"
                        key={spec}
                        onClick={() =>
                          toggleSpecialtySelection(editSpecialties, setEditSpecialties, spec)
                        }
                        className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                          isSelected
                            ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                            : "border-brand-line bg-brand-surfaceSoft text-brand-subtext hover:border-brand-primary/40"
                        }`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                        {INSTRUCTOR_SPECIALTY_LABELS[spec]}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                disabled={isPending}
                className="rounded-2xl border border-brand-line px-4 py-2 text-sm font-medium text-brand-subtext hover:bg-brand-surfaceSoft hover:text-brand-ink"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 rounded-2xl bg-brand-primary px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-primary/90 disabled:opacity-50"
              >
                {isPending ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Modal / Card de Redefinicao de Senha */}
      {passwordTargetUser && (
        <section className="rounded-[26px] border border-amber-300 bg-brand-surface p-6 shadow-panel">
          <div className="flex items-center justify-between border-b border-brand-line pb-4">
            <div>
              <h2 className="text-lg font-semibold text-brand-secondary">
                Redefinir Senha: {passwordTargetUser.fullName}
              </h2>
              <p className="text-xs text-brand-subtext">
                Defina uma nova senha para {passwordTargetUser.email}.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPasswordTargetUser(null)}
              className="rounded-xl p-2 text-brand-subtext hover:bg-brand-surfaceSoft hover:text-brand-ink"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-subtext">
                Nova Senha * (mínimo 8 caracteres)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha segura"
                className="mt-1 w-full max-w-md rounded-2xl border border-brand-line bg-brand-surfaceSoft px-3 py-2 text-sm text-brand-ink focus:border-brand-primary focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setPasswordTargetUser(null)}
                disabled={isPending}
                className="rounded-2xl border border-brand-line px-4 py-2 text-sm font-medium text-brand-subtext hover:bg-brand-surfaceSoft hover:text-brand-ink"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 rounded-2xl bg-amber-600 px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-amber-700 disabled:opacity-50"
              >
                {isPending ? "Redefinindo..." : "Confirmar Nova Senha"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Lista de Usuarios */}
      <section className="rounded-[26px] border border-brand-line bg-brand-surface p-6 shadow-panel">
        <div className="flex items-center justify-between border-b border-brand-line pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
            Equipe Cadastrada ({filteredUsers.length})
          </p>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-sm text-brand-subtext">
            Nenhum membro da equipe encontrado para os filtros selecionados.
          </div>
        ) : (
          <div className="mt-4 divide-y divide-brand-line">
            {filteredUsers.map((user) => {
              const isCurrentUser =
                Boolean(user.email && currentUserEmail) &&
                user.email.toLowerCase() === currentUserEmail.toLowerCase();
              return (
                <div
                  key={user.id}
                  className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-brand-secondary">{user.fullName}</p>
                      {isCurrentUser && (
                        <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[11px] font-semibold text-brand-primary">
                          Você
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          user.active
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {user.active ? "Ativo" : "Inativo"}
                      </span>
                    </div>

                    <p className="text-xs text-brand-subtext">{user.email}</p>

                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-lg bg-brand-surfaceSoft px-2 py-0.5 text-xs font-medium text-brand-ink">
                        {USER_ROLE_LABELS[user.role]}
                      </span>

                      {user.role === "INSTRUCTOR" &&
                        user.specialties.map((spec) => (
                          <span
                            key={spec}
                            className="rounded-lg border border-brand-line px-1.5 py-0.5 text-[11px] text-brand-subtext"
                          >
                            {INSTRUCTOR_SPECIALTY_LABELS[spec]}
                          </span>
                        ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => startEdit(user)}
                      className="flex items-center gap-1 rounded-xl border border-brand-line px-3 py-1.5 text-xs font-medium text-brand-ink transition hover:bg-brand-surfaceSoft"
                    >
                      <Pencil className="h-3.5 w-3.5 text-brand-subtext" />
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => startPasswordChange(user)}
                      className="flex items-center gap-1 rounded-xl border border-brand-line px-3 py-1.5 text-xs font-medium text-brand-ink transition hover:bg-brand-surfaceSoft"
                    >
                      <KeyRound className="h-3.5 w-3.5 text-brand-subtext" />
                      Senha
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(user)}
                      disabled={isCurrentUser || isPending}
                      title={
                        isCurrentUser
                          ? "Você não pode inativar seu próprio usuário."
                          : user.active
                          ? "Inativar usuário"
                          : "Ativar usuário"
                      }
                      className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                        isCurrentUser
                          ? "cursor-not-allowed opacity-40 border border-brand-line text-stone-400"
                          : user.active
                          ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                          : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }`}
                    >
                      {user.active ? (
                        <>
                          <UserX className="h-3.5 w-3.5" />
                          Inativar
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-3.5 w-3.5" />
                          Ativar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
