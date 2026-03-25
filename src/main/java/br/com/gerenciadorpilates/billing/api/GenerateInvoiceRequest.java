package br.com.gerenciadorpilates.billing.api;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record GenerateInvoiceRequest(
        @NotNull UUID subscriptionId,
        @NotNull LocalDate dueDate
) {
}
