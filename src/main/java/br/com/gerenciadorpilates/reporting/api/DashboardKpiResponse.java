package br.com.gerenciadorpilates.reporting.api;

import java.time.LocalDate;
import java.util.List;

public record DashboardKpiResponse(
        LocalDate startDate,
        LocalDate endDate,
        List<KpiValueResponse> indicators
) {
}
