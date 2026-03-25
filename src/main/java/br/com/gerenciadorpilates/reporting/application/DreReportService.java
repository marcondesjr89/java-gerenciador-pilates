package br.com.gerenciadorpilates.reporting.application;

import br.com.gerenciadorpilates.billing.infrastructure.BillingPaymentRepository;
import br.com.gerenciadorpilates.platform.config.ApplicationProperties;
import br.com.gerenciadorpilates.reporting.api.DreSummaryResponse;
import br.com.gerenciadorpilates.reporting.domain.ExpenseType;
import br.com.gerenciadorpilates.reporting.domain.FinancialExpense;
import br.com.gerenciadorpilates.reporting.infrastructure.FinancialExpenseRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DreReportService {

    private final BillingPaymentRepository paymentRepository;
    private final FinancialExpenseRepository expenseRepository;
    private final ApplicationProperties applicationProperties;

    public DreReportService(
            BillingPaymentRepository paymentRepository,
            FinancialExpenseRepository expenseRepository,
            ApplicationProperties applicationProperties
    ) {
        this.paymentRepository = paymentRepository;
        this.expenseRepository = expenseRepository;
        this.applicationProperties = applicationProperties;
    }

    @Transactional(readOnly = true)
    public DreSummaryResponse summarize(LocalDate startDate, LocalDate endDate) {
        validateRange(startDate, endDate);
        OffsetDateTime periodStart = startDate.atStartOfDay(ZoneId.of(applicationProperties.timezone())).toOffsetDateTime();
        OffsetDateTime periodEnd = endDate.atTime(LocalTime.MAX).atZone(ZoneId.of(applicationProperties.timezone())).toOffsetDateTime();

        BigDecimal totalRevenue = paymentRepository.findAllByPaidAtBetweenOrderByPaidAtAsc(periodStart, periodEnd)
                .stream()
                .map(payment -> payment.getAmountPaid())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<FinancialExpense> expenses = expenseRepository.findAllByOccurredOnBetweenOrderByOccurredOnAsc(startDate, endDate);
        BigDecimal fixedCosts = sumByType(expenses, ExpenseType.FIXED);
        BigDecimal variableCosts = sumByType(expenses, ExpenseType.VARIABLE);

        return new DreSummaryResponse(
                startDate,
                endDate,
                totalRevenue,
                fixedCosts,
                variableCosts,
                totalRevenue.subtract(fixedCosts).subtract(variableCosts)
        );
    }

    private BigDecimal sumByType(List<FinancialExpense> expenses, ExpenseType expenseType) {
        return expenses.stream()
                .filter(expense -> expense.getExpenseType() == expenseType)
                .map(FinancialExpense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private void validateRange(LocalDate startDate, LocalDate endDate) {
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("A data final deve ser maior ou igual a data inicial.");
        }
    }
}
