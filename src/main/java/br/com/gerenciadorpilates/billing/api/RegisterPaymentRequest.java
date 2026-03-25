package br.com.gerenciadorpilates.billing.api;

import br.com.gerenciadorpilates.billing.domain.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record RegisterPaymentRequest(
        @NotNull @DecimalMin(value = "0.01") BigDecimal amountPaid,
        @NotNull PaymentMethod paymentMethod,
        @NotNull OffsetDateTime paidAt,
        @Size(max = 255) String externalReference
) {
}
