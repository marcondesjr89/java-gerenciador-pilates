package br.com.gerenciadorpilates.reporting.api;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DreSummaryResponse(
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal totalRevenue,
        BigDecimal totalFixedCosts,
        BigDecimal totalVariableCosts,
        BigDecimal netResult
) {
}
