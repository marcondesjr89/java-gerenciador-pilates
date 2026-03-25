package br.com.gerenciadorpilates.billing.api;

import br.com.gerenciadorpilates.billing.domain.BillingPayment;
import br.com.gerenciadorpilates.billing.domain.PaymentMethod;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record BillingPaymentResponse(
        UUID id,
        UUID invoiceId,
        UUID studentId,
        BigDecimal amountPaid,
        PaymentMethod paymentMethod,
        OffsetDateTime paidAt,
        String externalReference
) {

    public static BillingPaymentResponse from(BillingPayment payment) {
        return new BillingPaymentResponse(
                payment.getId(),
                payment.getInvoiceId(),
                payment.getStudentId(),
                payment.getAmountPaid(),
                payment.getPaymentMethod(),
                payment.getPaidAt(),
                payment.getExternalReference()
        );
    }
}
