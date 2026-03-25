package br.com.gerenciadorpilates.reporting.api;

import java.util.List;

public record DmedAnnualReportResponse(
        int baseYear,
        String providerName,
        String providerCnpj,
        List<DmedStudentSummaryResponse> students
) {
}
