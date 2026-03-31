package br.com.gerenciadorpilates.students.api;

import br.com.gerenciadorpilates.billing.api.BillingInvoiceResponse;
import br.com.gerenciadorpilates.billing.api.StudentSubscriptionResponse;
import java.util.List;

public record StudentPortalBillingOverviewResponse(
        List<StudentSubscriptionResponse> subscriptions,
        List<BillingInvoiceResponse> invoices
) {
}
