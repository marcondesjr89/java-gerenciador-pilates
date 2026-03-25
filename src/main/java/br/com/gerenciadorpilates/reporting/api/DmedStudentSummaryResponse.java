package br.com.gerenciadorpilates.reporting.api;

import java.math.BigDecimal;
import java.util.UUID;

public record DmedStudentSummaryResponse(
        UUID studentId,
        String studentName,
        String cpf,
        BigDecimal totalPaid
) {
}
