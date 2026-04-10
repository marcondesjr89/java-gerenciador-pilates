import type { SessionUser } from "@/lib/auth";
import type { BillingInvoice, BillingSubscription } from "@/lib/billing-types";
import { fetchApiJson } from "@/lib/http";

export type { BillingInvoice, BillingSubscription };
export type StudentSubscription = BillingSubscription;

export type BillingPlan = {
  id: string;
  name: string;
  priceAmount: string;
  billingCycleMonths: number;
  active: boolean;
};

export type DreSummary = {
  startDate: string;
  endDate: string;
  totalRevenue: string;
  totalFixedCosts: string;
  totalVariableCosts: string;
  netResult: string;
};

export type FinancialExpense = {
  id: string;
  description: string;
  expenseType: string;
  amount: string;
  occurredOn: string;
};

async function apiGet<T>(session: SessionUser, path: string) {
  return fetchApiJson<T>(session, path, {
    errorMessage: "Nao foi possivel carregar os dados financeiros."
  });
}

export function fetchBillingPlans(session: SessionUser) {
  return apiGet<BillingPlan[]>(session, "/api/v1/billing/plans");
}

export function fetchOverdueInvoices(session: SessionUser, baseDate: string) {
  return apiGet<BillingInvoice[]>(session, `/api/v1/billing/invoices/overdue?baseDate=${baseDate}`);
}

export function fetchStudentSubscriptions(session: SessionUser, studentId: string) {
  return apiGet<BillingSubscription[]>(session, `/api/v1/billing/subscriptions/student/${studentId}`);
}

export function fetchStudentInvoices(session: SessionUser, studentId: string) {
  return apiGet<BillingInvoice[]>(session, `/api/v1/billing/invoices/student/${studentId}`);
}

export function fetchDreSummary(session: SessionUser, startDate: string, endDate: string) {
  return apiGet<DreSummary>(session, `/api/v1/financial/dre?startDate=${startDate}&endDate=${endDate}`);
}

export function fetchFinancialExpenses(session: SessionUser, startDate: string, endDate: string) {
  return apiGet<FinancialExpense[]>(session, `/api/v1/financial/expenses?startDate=${startDate}&endDate=${endDate}`);
}
