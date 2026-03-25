package br.com.gerenciadorpilates.reporting.api;

import br.com.gerenciadorpilates.reporting.domain.ExpenseType;
import br.com.gerenciadorpilates.reporting.domain.FinancialExpense;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record FinancialExpenseResponse(
        UUID id,
        String description,
        ExpenseType expenseType,
        BigDecimal amount,
        LocalDate occurredOn
) {

    public static FinancialExpenseResponse from(FinancialExpense expense) {
        return new FinancialExpenseResponse(
                expense.getId(),
                expense.getDescription(),
                expense.getExpenseType(),
                expense.getAmount(),
                expense.getOccurredOn()
        );
    }
}
