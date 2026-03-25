package br.com.gerenciadorpilates.reporting.api;

import java.math.BigDecimal;

public record KpiValueResponse(
        String key,
        String label,
        BigDecimal value,
        String unit,
        String description
) {
}
