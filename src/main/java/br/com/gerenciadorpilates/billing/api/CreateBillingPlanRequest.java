package br.com.gerenciadorpilates.billing.api;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record CreateBillingPlanRequest(
        @NotBlank @Size(max = 150) String name,
        @NotNull @DecimalMin(value = "0.01") BigDecimal priceAmount,
        @Min(1) int billingCycleMonths
) {
}
