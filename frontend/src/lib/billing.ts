import { API_BASE_URL } from "@/lib/api";
import type { SessionUser } from "@/lib/auth";

export type BillingPlan = {
  id: string;
  name: string;
  priceAmount: string;
  billingCycleMonths: number;
  active: boolean;
};

export type StudentSubscription = {
  id: string;
  studentId: string;
  studentName: string;
  planId: string;
  planName: string;
  status: "ACTIVE" | "CANCELED";
  startDate: string;
  nextBillingDate: string;
};

export type BillingInvoice = {
  id: string;
  studentId: string;
  studentName: string;
  subscriptionId: string;
  referenceMonth: string;
  dueDate: string;
  amountDue: string;
  status: "OPEN" | "PAID" | "CANCELED";
  paidAt: string | null;
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
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`
    },
    cache: "no-store"
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("SESSION_FORBIDDEN");
  }

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar os dados financeiros.");
  }

  return (await response.json()) as T;
}

export function fetchBillingPlans(session: SessionUser) {
  return apiGet<BillingPlan[]>(session, "/api/v1/billing/plans");
}

export function fetchOverdueInvoices(session: SessionUser, baseDate: string) {
  return apiGet<BillingInvoice[]>(session, `/api/v1/billing/invoices/overdue?baseDate=${baseDate}`);
}

export function fetchStudentSubscriptions(session: SessionUser, studentId: string) {
  return apiGet<StudentSubscription[]>(session, `/api/v1/billing/subscriptions/student/${studentId}`);
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
