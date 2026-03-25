package br.com.gerenciadorpilates.billing.api;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record CreateStudentSubscriptionRequest(
        @NotNull UUID studentId,
        @NotNull UUID planId,
        @NotNull LocalDate startDate
) {
}
