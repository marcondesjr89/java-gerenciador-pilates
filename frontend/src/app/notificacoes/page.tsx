import { BellRing, CircleAlert, Send, TimerReset } from "lucide-react";
import { AppShell } from "@/components/ui/app-shell";
import { SectionCard } from "@/components/ui/section-card";
import { requireInternalSession } from "@/lib/auth";
import { fetchNotificationOutbox } from "@/lib/notifications";

type NotificationsPageProps = {
  searchParams?: Promise<{
    status?: string;
  }>;
};

function formatDateTime(value: string | null) {
  if (!value) {
    return "Nao registrado";
  }

  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

export default async function NotificationsPage({ searchParams }: NotificationsPageProps) {
  const session = await requireInternalSession();
  const params = await searchParams;
  const selectedStatus = params?.status ?? "";
  const outbox = await fetchNotificationOutbox(session, selectedStatus || undefined);
  const pendingCount = outbox.filter((entry) => entry.status === "PENDING").length;
  const sentCount = outbox.filter((entry) => entry.status === "SENT").length;
  const failedCount = outbox.filter((entry) => entry.status === "FAILED").length;

  return (
    <AppShell currentPath="/notificacoes">
      <div className="space-y-6">
        <section className="rounded-[26px] border border-brand-line bg-brand-surface p-6 shadow-panel lg:p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-brand-primary">Notificacoes</p>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-4xl text-brand-secondary lg:text-5xl">Outbox operacional</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-brand-subtext">
                Acompanhe o estado das notificacoes enfileiradas para integracoes externas, com foco inicial no WhatsApp.
              </p>
            </div>

            <form className="flex flex-col gap-2 rounded-[22px] bg-brand-soft px-5 py-4 text-sm text-brand-secondary">
              <span className="font-semibold">Filtrar status</span>
              <select
                name="status"
                defaultValue={selectedStatus}
                className="rounded-2xl border border-brand-line bg-brand-surface px-4 py-2 text-brand-ink outline-none"
              >
                <option value="">Todos</option>
                <option value="PENDING">Pendentes</option>
                <option value="SENT">Enviadas</option>
                <option value="FAILED">Falhas</option>
              </select>
              <button
                type="submit"
                className="rounded-2xl bg-brand-primary px-4 py-2 font-semibold text-white transition hover:bg-brand-primaryHover"
              >
                Atualizar outbox
              </button>
            </form>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-3">
          <article className="rounded-[24px] border border-brand-line bg-brand-panel p-5 shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-brand-subtext">Pendentes</p>
                <p className="mt-3 font-display text-4xl text-brand-ink">{pendingCount}</p>
              </div>
              <div className="rounded-2xl bg-brand-soft p-3 text-brand-primary">
                <TimerReset className="h-5 w-5" />
              </div>
            </div>
          </article>

          <article className="rounded-[24px] border border-brand-line bg-brand-panel p-5 shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-brand-subtext">Enviadas</p>
                <p className="mt-3 font-display text-4xl text-brand-ink">{sentCount}</p>
              </div>
              <div className="rounded-2xl bg-[rgba(25,135,84,0.12)] p-3 text-brand-success">
                <Send className="h-5 w-5" />
              </div>
            </div>
          </article>

          <article className="rounded-[24px] border border-brand-line bg-brand-panel p-5 shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-brand-subtext">Falhas</p>
                <p className="mt-3 font-display text-4xl text-brand-ink">{failedCount}</p>
              </div>
              <div className="rounded-2xl bg-[rgba(220,53,69,0.08)] p-3 text-brand-danger">
                <CircleAlert className="h-5 w-5" />
              </div>
            </div>
          </article>
        </section>

        <SectionCard
          title="Entradas do outbox"
          description="As 100 notificacoes mais recentes para auditoria e acompanhamento operacional."
        >
          {outbox.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-brand-line bg-brand-surface px-5 py-10 text-center text-sm text-brand-subtext">
              Nenhuma notificacao encontrada para o filtro atual.
            </div>
          ) : (
            <div className="space-y-3">
              {outbox.map((entry) => (
                <article key={entry.id} className="rounded-[20px] border border-brand-line bg-brand-surface px-4 py-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-brand-ink">{entry.messageTemplate}</p>
                        <span
                          className={
                            entry.status === "SENT"
                              ? "rounded-full bg-[rgba(25,135,84,0.12)] px-3 py-1 text-xs font-semibold text-brand-success"
                              : entry.status === "PENDING"
                                ? "rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-secondary"
                                : "rounded-full bg-[rgba(220,53,69,0.08)] px-3 py-1 text-xs font-semibold text-brand-danger"
                          }
                        >
                          {entry.status === "SENT" ? "Enviada" : entry.status === "PENDING" ? "Pendente" : "Falhou"}
                        </span>
                      </div>
                      <p className="text-sm text-brand-subtext">Canal: {entry.channel}</p>
                      <p className="text-sm text-brand-subtext">Referencia do destinatario: {entry.recipientReference}</p>
                      <p className="text-sm text-brand-subtext">Criada em {formatDateTime(entry.createdAt)}</p>
                      <p className="text-sm text-brand-subtext">Tentativa: {formatDateTime(entry.attemptedAt)}</p>
                      <p className="text-sm text-brand-subtext">Envio: {formatDateTime(entry.sentAt)}</p>
                      {entry.errorMessage ? (
                        <p className="text-sm text-brand-danger">Erro: {entry.errorMessage}</p>
                      ) : null}
                    </div>

                    <div className="max-w-xl rounded-2xl border border-brand-line bg-brand-panel px-4 py-4 text-sm text-brand-subtext">
                      <div className="mb-2 flex items-center gap-2 text-brand-secondary">
                        <BellRing className="h-4 w-4" />
                        Payload
                      </div>
                      <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs text-brand-subtext">
                        {entry.payloadJson}
                      </pre>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
