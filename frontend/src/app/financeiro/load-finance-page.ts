import type { SessionUser } from "@/lib/auth";
import {
  fetchBillingPlans,
  fetchDreSummary,
  fetchFinancialExpenses,
  fetchOverdueInvoices,
  fetchStudentInvoices,
  fetchStudentSubscriptions
} from "@/lib/billing";
import { fetchStudents } from "@/lib/students";
import { getMonthRange } from "@/app/financeiro/helpers";

export type FinanceSearchParams = {
  startDate?: string;
  endDate?: string;
  studentId?: string;
};

export async function loadFinancePage(session: SessionUser, params?: FinanceSearchParams) {
  const defaultRange = getMonthRange();
  const startDate = params?.startDate ?? defaultRange.startDate;
  const endDate = params?.endDate ?? defaultRange.endDate;
  const students = await fetchStudents(session);
  const selectedStudent = students.find((student) => student.id === params?.studentId) ?? students[0] ?? null;
  const [plans, overdueInvoices, dreSummary, expenses, studentSubscriptions, studentInvoices] = await Promise.all([
    fetchBillingPlans(session),
    fetchOverdueInvoices(session, endDate),
    fetchDreSummary(session, startDate, endDate),
    fetchFinancialExpenses(session, startDate, endDate),
    selectedStudent ? fetchStudentSubscriptions(session, selectedStudent.id) : Promise.resolve([]),
    selectedStudent ? fetchStudentInvoices(session, selectedStudent.id) : Promise.resolve([])
  ]);

  return {
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
    overdueAmount: overdueInvoices.reduce((sum, invoice) => sum + Number(invoice.amountDue), 0)
  };
}
