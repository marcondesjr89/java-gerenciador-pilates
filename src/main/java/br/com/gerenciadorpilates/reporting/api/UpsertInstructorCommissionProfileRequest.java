package br.com.gerenciadorpilates.reporting.api;

import br.com.gerenciadorpilates.reporting.domain.CommissionModel;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record UpsertInstructorCommissionProfileRequest(
        @NotNull UUID instructorUserId,
        @NotNull CommissionModel commissionModel,
        @NotNull @DecimalMin(value = "0.01") BigDecimal unitAmount,
        boolean active
) {
}
