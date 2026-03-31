import { API_BASE_URL } from "@/lib/api";
import type { StudentPortalSessionUser } from "@/lib/student-portal-auth";

export type StudentPortalSubscription = {
  id: string;
  studentId: string;
  studentName: string;
  planId: string;
  planName: string;
  status: "ACTIVE" | "CANCELED";
  startDate: string;
  nextBillingDate: string;
};

export type StudentPortalInvoice = {
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

export type StudentPortalBillingOverview = {
  subscriptions: StudentPortalSubscription[];
  invoices: StudentPortalInvoice[];
};

export async function fetchStudentPortalBilling(session: StudentPortalSessionUser) {
  const response = await fetch(`${API_BASE_URL}/api/v1/student-portal/me/billing`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`
    },
    cache: "no-store"
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("SESSION_FORBIDDEN");
  }

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar o financeiro do portal.");
  }

  return (await response.json()) as StudentPortalBillingOverview;
}
