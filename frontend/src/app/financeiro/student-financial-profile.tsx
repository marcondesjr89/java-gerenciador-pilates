import { CreateSubscriptionForm } from "@/app/financeiro/create-subscription-form";
import { GenerateInvoiceForm } from "@/app/financeiro/generate-invoice-form";
import { getToday, formatCurrency, formatDate, formatDateTime, statusClass, statusLabel } from "@/app/financeiro/helpers";
import { RegisterPaymentForm } from "@/app/financeiro/register-payment-form";
import type { BillingInvoice, BillingPlan, StudentSubscription } from "@/lib/billing";
import type { Student } from "@/lib/students";

type StudentFinancialProfileProps = {
  student: Student | null;
  plans: BillingPlan[];
  studentSubscriptions: StudentSubscription[];
  studentInvoices: BillingInvoice[];
};

export function StudentFinancialProfile({
  student,
  plans,
  studentSubscriptions,
  studentInvoices
}: StudentFinancialProfileProps) {
  if (!student) {
    return (
      <div className="rounded-[20px] border border-dashed border-brand-line bg-brand-surface px-5 py-10 text-center text-sm text-brand-subtext">
        Nenhum aluno encontrado para o modulo financeiro.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[20px] border border-brand-line bg-brand-surface px-5 py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Aluno selecionado</p>
            <h2 className="mt-2 font-display text-3xl text-brand-secondary">{student.fullName}</h2>
            <p className="mt-2 text-sm text-brand-subtext">{student.email}</p>
          </div>
          <span className={statusClass(student.status)}>{student.status === "ACTIVE" ? "Ativo" : "Inativo"}</span>
        </div>
      </div>

      <div className="rounded-[20px] border border-brand-line bg-brand-surface px-5 py-5">
        <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Nova assinatura</p>
        <h3 className="mt-2 font-display text-2xl text-brand-secondary">Vincular plano ao aluno</h3>
        <div className="mt-4">
          <CreateSubscriptionForm
            studentId={student.id}
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
                    Inicio em {formatDate(subscription.startDate)} com proxima cobranca em{" "}
                    {formatDate(subscription.nextBillingDate)}
                  </p>
                </div>
                <span className={statusClass(subscription.status)}>{statusLabel(subscription.status)}</span>
              </div>

              {subscription.status === "ACTIVE" ? (
                <GenerateInvoiceForm subscriptionId={subscription.id} defaultDueDate={subscription.nextBillingDate} />
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
                  <p className="font-semibold text-brand-ink">Competencia {formatDate(invoice.referenceMonth)}</p>
                  <p className="mt-1 text-sm text-brand-subtext">
                    Vencimento em {formatDate(invoice.dueDate)} com valor de {formatCurrency(invoice.amountDue)}
                  </p>
                  {invoice.paidAt ? <p className="mt-1 text-sm text-brand-subtext">Pago em {formatDateTime(invoice.paidAt)}</p> : null}
                </div>
                <span className={statusClass(invoice.status)}>{statusLabel(invoice.status)}</span>
              </div>

              {invoice.status === "OPEN" ? <RegisterPaymentForm invoiceId={invoice.id} amountDue={invoice.amountDue} /> : null}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
