package br.com.gerenciadorpilates.reporting.api;

import br.com.gerenciadorpilates.reporting.domain.ExpenseType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateFinancialExpenseRequest(
        @NotBlank @Size(max = 150) String description,
        @NotNull ExpenseType expenseType,
        @NotNull @DecimalMin(value = "0.01") BigDecimal amount,
        @NotNull LocalDate occurredOn
) {
}
