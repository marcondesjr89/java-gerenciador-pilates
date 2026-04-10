export type BillingSubscription = {
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
