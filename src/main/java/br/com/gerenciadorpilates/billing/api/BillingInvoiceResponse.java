package br.com.gerenciadorpilates.billing.api;

import br.com.gerenciadorpilates.billing.domain.BillingInvoice;
import br.com.gerenciadorpilates.billing.domain.InvoiceStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record BillingInvoiceResponse(
        UUID id,
        UUID studentId,
        String studentName,
        UUID subscriptionId,
        LocalDate referenceMonth,
        LocalDate dueDate,
        BigDecimal amountDue,
        InvoiceStatus status,
        OffsetDateTime paidAt
) {

    public static BillingInvoiceResponse from(BillingInvoice invoice) {
        return new BillingInvoiceResponse(
                invoice.getId(),
                invoice.getStudentId(),
                invoice.getStudentName(),
                invoice.getSubscriptionId(),
                invoice.getReferenceMonth(),
                invoice.getDueDate(),
                invoice.getAmountDue(),
                invoice.getStatus(),
                invoice.getPaidAt()
        );
    }
}
