import { AlertCircle } from "lucide-react";
import { CreatePlanForm } from "@/app/financeiro/create-plan-form";
import { FinanceMetrics } from "@/app/financeiro/finance-metrics";
import { FinanceStudentList } from "@/app/financeiro/finance-student-list";
import { formatCurrency, formatDate } from "@/app/financeiro/helpers";
import { loadFinancePage, type FinanceSearchParams } from "@/app/financeiro/load-finance-page";
import { PlansWallet } from "@/app/financeiro/plans-wallet";
import { StudentFinancialProfile } from "@/app/financeiro/student-financial-profile";
import { AppShell } from "@/components/ui/app-shell";
import { SectionCard } from "@/components/ui/section-card";
import { requireInternalSession } from "@/lib/auth";

type FinancePageProps = {
  searchParams?: Promise<FinanceSearchParams>;
};

export default async function FinancePage({ searchParams }: FinancePageProps) {
  const session = await requireInternalSession();
  const params = await searchParams;
  const {
    startDate,
    endDate,
    students,
    selectedStudent,
    plans,
    overdueInvoices,
    dreSummary,
    expenses,
    studentSubscriptions,
    studentInvoices,
    overdueAmount
  } = await loadFinancePage(session, params);

  return (
    <AppShell currentPath="/financeiro">
      <div className="space-y-6">
        <section className="rounded-[26px] border border-brand-line bg-brand-surface p-6 shadow-panel lg:p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-brand-primary">Financeiro interno</p>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-4xl text-brand-secondary lg:text-5xl">Receita, cobranca e leitura por aluno</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-brand-subtext">
                Primeira abertura do modulo financeiro com dados reais de planos, assinaturas, faturas, inadimplencia e
                DRE no periodo selecionado.
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

        <FinanceMetrics
          revenue={dreSummary.totalRevenue}
          netResult={dreSummary.netResult}
          overdueInvoicesCount={overdueInvoices.length}
          overdueAmount={overdueAmount}
          expensesCount={expenses.length}
          totalCosts={Number(dreSummary.totalFixedCosts) + Number(dreSummary.totalVariableCosts)}
        />

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
            <PlansWallet plans={plans} />
          </SectionCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <SectionCard
            title="Aluno no financeiro"
            description="Selecione o aluno para consultar assinatura, faturas e operacao de cobranca."
          >
            <FinanceStudentList
              students={students}
              selectedStudentId={selectedStudent?.id ?? null}
              startDate={startDate}
              endDate={endDate}
            />
          </SectionCard>

          <SectionCard
            title="Ficha financeira do aluno"
            description="Assinaturas, geracao de faturas e baixa de recebimento para o aluno selecionado."
          >
            <StudentFinancialProfile
              student={selectedStudent}
              plans={plans}
              studentSubscriptions={studentSubscriptions}
              studentInvoices={studentInvoices}
            />
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
                      <span className="rounded-full bg-[rgba(255,193,7,0.18)] px-3 py-1 text-xs font-semibold text-[#8a6200]">
                        Aberta
                      </span>
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
                  O resultado liquido do periodo esta negativo. Vale revisar inadimplencia, planos ativos e o peso das
                  despesas registradas.
                </p>
              </div>
            </div>
          ) : null}
        </SectionCard>
      </div>
    </AppShell>
  );
}
