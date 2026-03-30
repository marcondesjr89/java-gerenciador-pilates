import { AlertCircle, BadgeDollarSign, CreditCard, FileClock, Landmark } from "lucide-react";
import { AppShell } from "@/components/ui/app-shell";
import { SectionCard } from "@/components/ui/section-card";
import { requireInternalSession } from "@/lib/auth";
import { fetchStudents } from "@/lib/students";
import {
  fetchBillingPlans,
  fetchDreSummary,
  fetchFinancialExpenses,
  fetchOverdueInvoices,
  fetchStudentInvoices,
  fetchStudentSubscriptions
} from "@/lib/billing";
import { CreatePlanForm } from "@/app/financeiro/create-plan-form";
import { CreateSubscriptionForm } from "@/app/financeiro/create-subscription-form";
import { GenerateInvoiceForm } from "@/app/financeiro/generate-invoice-form";
import { RegisterPaymentForm } from "@/app/financeiro/register-payment-form";

type FinancePageProps = {
  searchParams?: Promise<{
    startDate?: string;
    endDate?: string;
    studentId?: string;
  }>;
};

function getToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Fortaleza"
  }).format(new Date());
}

function getMonthRange() {
  const today = new Date(`${getToday()}T12:00:00`);
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return {
    startDate: startDate.toLocaleDateString("en-CA"),
    endDate: endDate.toLocaleDateString("en-CA")
  };
}

function formatCurrency(value: string) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

function statusClass(status: string) {
  if (status === "PAID" || status === "ACTIVE") {
    return "rounded-full bg-[rgba(25,135,84,0.12)] px-3 py-1 text-xs font-semibold text-brand-success";
  }

  if (status === "OPEN") {
    return "rounded-full bg-[rgba(255,193,7,0.18)] px-3 py-1 text-xs font-semibold text-[#8a6200]";
  }

  return "rounded-full bg-[rgba(220,53,69,0.08)] px-3 py-1 text-xs font-semibold text-brand-danger";
}

function statusLabel(status: string) {
  switch (status) {
    case "ACTIVE":
      return "Ativa";
    case "CANCELED":
      return "Cancelada";
    case "OPEN":
      return "Aberta";
    case "PAID":
      return "Paga";
    default:
      return status;
  }
}

export default async function FinancePage({ searchParams }: FinancePageProps) {
  const session = await requireInternalSession();
  const params = await searchParams;
  const defaultRange = getMonthRange();
  const startDate = params?.startDate ?? defaultRange.startDate;
  const endDate = params?.endDate ?? defaultRange.endDate;
  const students = await fetchStudents(session);
  const selectedStudent =
    students.find((student) => student.id === params?.studentId) ??
    students[0] ??
    null;

  const [plans, overdueInvoices, dreSummary, expenses, studentSubscriptions, studentInvoices] = await Promise.all([
    fetchBillingPlans(session),
    fetchOverdueInvoices(session, endDate),
    fetchDreSummary(session, startDate, endDate),
    fetchFinancialExpenses(session, startDate, endDate),
    selectedStudent ? fetchStudentSubscriptions(session, selectedStudent.id) : Promise.resolve([]),
    selectedStudent ? fetchStudentInvoices(session, selectedStudent.id) : Promise.resolve([])
  ]);

  const overdueAmount = overdueInvoices.reduce((sum, invoice) => sum + Number(invoice.amountDue), 0);

  return (
    <AppShell currentPath="/financeiro">
      <div className="space-y-6">
        <section className="rounded-[26px] border border-brand-line bg-brand-surface p-6 shadow-panel lg:p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-brand-primary">Financeiro interno</p>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-4xl text-brand-secondary lg:text-5xl">Receita, cobranca e leitura por aluno</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-brand-subtext">
                Primeira abertura do modulo financeiro com dados reais de planos, assinaturas, faturas,
                inadimplencia e DRE no periodo selecionado.
              </p>
            </div>

            <form className="grid gap-2 rounded-[22px] bg-brand-soft px-5 py-4 text-sm text-brand-secondary md:grid-cols-2">
              <label className="space-y-1">
                <span className="font-semibold">Inicio</span>
                <input
                  name="startDate"
                  type="date"
                  defaultValue={startDate}
                  className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-2 text-brand-ink outline-none"
                />
              </label>
              <label className="space-y-1">
                <span className="font-semibold">Fim</span>
                <input
                  name="endDate"
                  type="date"
                  defaultValue={endDate}
                  className="w-full rounded-2xl border border-brand-line bg-brand-surface px-4 py-2 text-brand-ink outline-none"
                />
              </label>
              {selectedStudent ? <input type="hidden" name="studentId" value={selectedStudent.id} /> : null}
              <button
                type="submit"
                className="md:col-span-2 rounded-2xl bg-brand-primary px-4 py-2 font-semibold text-white transition hover:bg-brand-primaryHover"
              >
                Atualizar leitura financeira
              </button>
            </form>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-4">
          <article className="rounded-[24px] border border-brand-line bg-brand-panel p-5 shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-brand-subtext">Receita do periodo</p>
                <p className="mt-3 font-display text-3xl text-brand-ink">{formatCurrency(dreSummary.totalRevenue)}</p>
                <p className="mt-3 text-sm leading-6 text-brand-subtext">Entradas consolidadas no DRE atual.</p>
              </div>
              <div className="rounded-2xl bg-brand-soft p-3 text-brand-primary">
                <Landmark className="h-5 w-5" />
              </div>
            </div>
          </article>

          <article className="rounded-[24px] border border-brand-line bg-brand-panel p-5 shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-brand-subtext">Resultado liquido</p>
                <p className="mt-3 font-display text-3xl text-brand-ink">{formatCurrency(dreSummary.netResult)}</p>
                <p className="mt-3 text-sm leading-6 text-brand-subtext">Receita menos custos fixos e variaveis.</p>
              </div>
              <div className="rounded-2xl bg-[rgba(13,110,253,0.1)] p-3 text-brand-info">
                <BadgeDollarSign className="h-5 w-5" />
              </div>
            </div>
          </article>

          <article className="rounded-[24px] border border-brand-line bg-brand-panel p-5 shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-brand-subtext">Inadimplencia aberta</p>
                <p className="mt-3 font-display text-3xl text-brand-ink">{overdueInvoices.length}</p>
                <p className="mt-3 text-sm leading-6 text-brand-subtext">{formatCurrency(String(overdueAmount))} em aberto.</p>
              </div>
              <div className="rounded-2xl bg-[rgba(220,53,69,0.08)] p-3 text-brand-danger">
                <FileClock className="h-5 w-5" />
              </div>
            </div>
          </article>

          <article className="rounded-[24px] border border-brand-line bg-brand-panel p-5 shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-brand-subtext">Despesas do periodo</p>
                <p className="mt-3 font-display text-3xl text-brand-ink">{expenses.length}</p>
                <p className="mt-3 text-sm leading-6 text-brand-subtext">
                  {formatCurrency(String(Number(dreSummary.totalFixedCosts) + Number(dreSummary.totalVariableCosts)))} em custos.
                </p>
              </div>
              <div className="rounded-2xl bg-brand-soft p-3 text-brand-secondary">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
          </article>
        </section>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <SectionCard
            title="Cadastrar plano"
            description="Abra novas ofertas comerciais para vincular assinaturas e preparar a cobranca recorrente."
          >
            <CreatePlanForm />
          </SectionCard>

          <SectionCard
            title="Carteira de planos"
            description="Planos vindos do backend com ciclo de cobranca e situacao atual."
          >
            {plans.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-brand-line bg-brand-surface px-5 py-10 text-center text-sm text-brand-subtext">
                Nenhum plano cadastrado no backend.
              </div>
            ) : (
              <div className="space-y-3">
                {plans.map((plan) => (
                  <article key={plan.id} className="rounded-[20px] border border-brand-line bg-brand-surface px-4 py-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-brand-ink">{plan.name}</p>
                        <p className="mt-1 text-sm text-brand-subtext">
                          {formatCurrency(plan.priceAmount)} a cada {plan.billingCycleMonths} mes(es)
                        </p>
                      </div>
                      <span className={statusClass(plan.active ? "ACTIVE" : "CANCELED")}>
                        {plan.active ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <SectionCard
            title="Aluno no financeiro"
            description="Selecione o aluno para consultar assinatura, faturas e operacao de cobranca."
          >
            {students.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-brand-line bg-brand-surface px-5 py-10 text-center text-sm text-brand-subtext">
                Nenhum aluno disponivel para o modulo financeiro.
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((student) => {
                  const isSelected = selectedStudent?.id === student.id;

                  return (
                    <a
                      key={student.id}
                      href={`/financeiro?studentId=${student.id}&startDate=${startDate}&endDate=${endDate}`}
                      className={
                        isSelected
                          ? "block rounded-[20px] border border-brand-primary/30 bg-brand-soft px-4 py-4"
                          : "block rounded-[20px] border border-brand-line bg-brand-surface px-4 py-4 transition hover:border-brand-primary/30"
                      }
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-brand-ink">{student.fullName}</p>
                          <p className="mt-1 text-sm text-brand-subtext">{student.email}</p>
                        </div>
                        <span className={statusClass(student.status)}>{student.status === "ACTIVE" ? "Ativo" : "Inativo"}</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Ficha financeira do aluno"
            description="Assinaturas, geracao de faturas e baixa de recebimento para o aluno selecionado."
          >
            {selectedStudent ? (
              <div className="space-y-6">
                <div className="rounded-[20px] border border-brand-line bg-brand-surface px-5 py-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Aluno selecionado</p>
                      <h2 className="mt-2 font-display text-3xl text-brand-secondary">{selectedStudent.fullName}</h2>
                      <p className="mt-2 text-sm text-brand-subtext">{selectedStudent.email}</p>
                    </div>
                    <span className={statusClass(selectedStudent.status)}>
                      {selectedStudent.status === "ACTIVE" ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>

                <div className="rounded-[20px] border border-brand-line bg-brand-surface px-5 py-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Nova assinatura</p>
                  <h3 className="mt-2 font-display text-2xl text-brand-secondary">Vincular plano ao aluno</h3>
                  <div className="mt-4">
                    <CreateSubscriptionForm
                      studentId={selectedStudent.id}
                      plans={plans.filter((plan) => plan.active)}
                      defaultStartDate={getToday()}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-2xl text-brand-secondary">Assinaturas</h3>
                    <span className="text-sm text-brand-subtext">{studentSubscriptions.length} registro(s)</span>
                  </div>

                  {studentSubscriptions.length === 0 ? (
                    <div className="rounded-[20px] border border-dashed border-brand-line bg-brand-surface px-5 py-8 text-center text-sm text-brand-subtext">
                      Nenhuma assinatura encontrada para este aluno.
                    </div>
                  ) : (
                    studentSubscriptions.map((subscription) => (
                      <article key={subscription.id} className="rounded-[20px] border border-brand-line bg-brand-surface px-5 py-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="font-semibold text-brand-ink">{subscription.planName}</p>
                            <p className="mt-1 text-sm text-brand-subtext">
                              Inicio em {formatDate(subscription.startDate)} com proxima cobranca em {formatDate(subscription.nextBillingDate)}
                            </p>
                          </div>
                          <span className={statusClass(subscription.status)}>{statusLabel(subscription.status)}</span>
                        </div>

                        {subscription.status === "ACTIVE" ? (
                          <GenerateInvoiceForm
                            subscriptionId={subscription.id}
                            defaultDueDate={subscription.nextBillingDate}
                          />
                        ) : null}
                      </article>
                    ))
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-2xl text-brand-secondary">Faturas</h3>
                    <span className="text-sm text-brand-subtext">{studentInvoices.length} registro(s)</span>
                  </div>

                  {studentInvoices.length === 0 ? (
                    <div className="rounded-[20px] border border-dashed border-brand-line bg-brand-surface px-5 py-8 text-center text-sm text-brand-subtext">
                      Nenhuma fatura encontrada para este aluno.
                    </div>
                  ) : (
                    studentInvoices.map((invoice) => (
                      <article key={invoice.id} className="rounded-[20px] border border-brand-line bg-brand-surface px-5 py-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="font-semibold text-brand-ink">
                              Competencia {formatDate(invoice.referenceMonth)}
                            </p>
                            <p className="mt-1 text-sm text-brand-subtext">
                              Vencimento em {formatDate(invoice.dueDate)} com valor de {formatCurrency(invoice.amountDue)}
                            </p>
                            {invoice.paidAt ? (
                              <p className="mt-1 text-sm text-brand-subtext">Pago em {formatDateTime(invoice.paidAt)}</p>
                            ) : null}
                          </div>
                          <span className={statusClass(invoice.status)}>{statusLabel(invoice.status)}</span>
                        </div>

                        {invoice.status === "OPEN" ? (
                          <RegisterPaymentForm invoiceId={invoice.id} amountDue={invoice.amountDue} />
                        ) : null}
                      </article>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-[20px] border border-dashed border-brand-line bg-brand-surface px-5 py-10 text-center text-sm text-brand-subtext">
                Nenhum aluno encontrado para o modulo financeiro.
              </div>
            )}
          </SectionCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Faturas em atraso"
            description="Cobrancas vencidas ate a data final filtrada para acao imediata da recepcao."
          >
            {overdueInvoices.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-brand-line bg-brand-surface px-5 py-10 text-center text-sm text-brand-subtext">
                Nenhuma fatura vencida no recorte atual.
              </div>
            ) : (
              <div className="space-y-3">
                {overdueInvoices.map((invoice) => (
                  <article key={invoice.id} className="rounded-[20px] border border-brand-line bg-brand-surface px-4 py-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-brand-ink">{invoice.studentName}</p>
                        <p className="mt-1 text-sm text-brand-subtext">
                          Venceu em {formatDate(invoice.dueDate)} com valor de {formatCurrency(invoice.amountDue)}
                        </p>
                      </div>
                      <span className={statusClass(invoice.status)}>{statusLabel(invoice.status)}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Despesas do periodo"
            description="Saidas financeiras listadas no backend para compor a leitura do DRE."
          >
            {expenses.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-brand-line bg-brand-surface px-5 py-10 text-center text-sm text-brand-subtext">
                Nenhuma despesa registrada para o periodo filtrado.
              </div>
            ) : (
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <article key={expense.id} className="rounded-[20px] border border-brand-line bg-brand-surface px-4 py-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-brand-ink">{expense.description}</p>
                        <p className="mt-1 text-sm text-brand-subtext">
                          {expense.expenseType} em {formatDate(expense.occurredOn)}
                        </p>
                      </div>
                      <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-secondary">
                        {formatCurrency(expense.amount)}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <SectionCard
          title="Leitura de custos e resultado"
          description="Resumo consolidado do DRE para o intervalo financeiro selecionado."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-[20px] border border-brand-line bg-brand-surface px-5 py-5">
              <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Custos fixos</p>
              <p className="mt-2 font-display text-3xl text-brand-secondary">{formatCurrency(dreSummary.totalFixedCosts)}</p>
            </article>
            <article className="rounded-[20px] border border-brand-line bg-brand-surface px-5 py-5">
              <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Custos variaveis</p>
              <p className="mt-2 font-display text-3xl text-brand-secondary">{formatCurrency(dreSummary.totalVariableCosts)}</p>
            </article>
            <article className="rounded-[20px] border border-brand-line bg-brand-surface px-5 py-5">
              <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Faixa analisada</p>
              <p className="mt-2 font-semibold text-brand-ink">
                {formatDate(dreSummary.startDate)} ate {formatDate(dreSummary.endDate)}
              </p>
            </article>
          </div>

          {Number(dreSummary.netResult) < 0 ? (
            <div className="mt-5 rounded-[20px] border border-[rgba(220,53,69,0.15)] bg-[rgba(220,53,69,0.05)] px-5 py-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-brand-danger" />
                <p className="text-sm leading-6 text-brand-subtext">
                  O resultado liquido do periodo esta negativo. Vale revisar inadimplencia, planos ativos e o peso das despesas registradas.
                </p>
              </div>
            </div>
          ) : null}
        </SectionCard>
      </div>
    </AppShell>
  );
}
