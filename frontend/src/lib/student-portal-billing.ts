import type { BillingInvoice, BillingSubscription } from "@/lib/billing-types";
import { fetchApiJson } from "@/lib/http";
import type { StudentPortalSessionUser } from "@/lib/student-portal-auth";

export type StudentPortalBillingOverview = {
  subscriptions: BillingSubscription[];
  invoices: BillingInvoice[];
};

export async function fetchStudentPortalBilling(session: StudentPortalSessionUser) {
  return fetchApiJson<StudentPortalBillingOverview>(session, "/api/v1/student-portal/me/billing", {
    errorMessage: "Nao foi possivel carregar o financeiro do portal."
  });
}
