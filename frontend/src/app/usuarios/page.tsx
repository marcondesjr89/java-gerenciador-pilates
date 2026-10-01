import { ShieldAlert, UsersRound } from "lucide-react";
import { AppShell } from "@/components/ui/app-shell";
import { requireInternalSession } from "@/lib/auth";
import { fetchInternalUsers } from "@/lib/users";
import { UsersManagementPanel } from "./users-management-panel";

export default async function UsuariosPage() {
  const session = await requireInternalSession();

  if (session.role !== "ADMIN") {
    return (
      <AppShell currentPath="/usuarios">
        <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-8 text-center text-amber-900 shadow-panel">
          <ShieldAlert className="mx-auto h-12 w-12 text-amber-600" />
          <h1 className="mt-4 font-display text-2xl">Acesso Restrito</h1>
          <p className="mt-2 text-sm text-amber-800">
            A gestão e criação de membros da equipe interna é permitida exclusivamente para Administradores.
          </p>
        </div>
      </AppShell>
    );
  }

  const users = await fetchInternalUsers(session);

  return (
    <AppShell currentPath="/usuarios">
      <div className="space-y-6">
        <section className="rounded-[26px] border border-brand-line bg-brand-surface p-6 shadow-panel lg:p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-brand-primary">Administração do Studio</p>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-4xl text-brand-secondary lg:text-5xl">
                Gestão da Equipe
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-brand-subtext">
                Cadastre e gerencie instrutores, recepcionistas e administradores do studio.
                Controle permissões de acesso, especialidades e credenciais operacionais.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-brand-line bg-brand-surfaceSoft px-4 py-3">
              <UsersRound className="h-5 w-5 text-brand-primary" />
              <div>
                <p className="text-xs uppercase tracking-wider text-brand-subtext">Total da Equipe</p>
                <p className="text-lg font-bold text-brand-secondary">{users.length} usuários</p>
              </div>
            </div>
          </div>
        </section>

        <UsersManagementPanel
          initialUsers={users}
          currentUserEmail={session.username}
        />
      </div>
    </AppShell>
  );
}
