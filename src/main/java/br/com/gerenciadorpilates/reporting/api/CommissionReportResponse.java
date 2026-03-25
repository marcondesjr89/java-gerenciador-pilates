package br.com.gerenciadorpilates.reporting.api;

import br.com.gerenciadorpilates.reporting.domain.CommissionModel;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CommissionReportResponse(
        UUID instructorUserId,
        String instructorName,
        CommissionModel commissionModel,
        BigDecimal unitAmount,
        long quantity,
        BigDecimal totalAmount,
        LocalDate startDate,
        LocalDate endDate
) {
}
