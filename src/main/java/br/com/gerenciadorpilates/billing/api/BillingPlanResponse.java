package br.com.gerenciadorpilates.billing.api;

import br.com.gerenciadorpilates.billing.domain.BillingPlan;
import java.math.BigDecimal;
import java.util.UUID;

public record BillingPlanResponse(
        UUID id,
        String name,
        BigDecimal priceAmount,
        int billingCycleMonths,
        boolean active
) {

    public static BillingPlanResponse from(BillingPlan plan) {
        return new BillingPlanResponse(
                plan.getId(),
                plan.getName(),
                plan.getPriceAmount(),
                plan.getBillingCycleMonths(),
                plan.isActive()
        );
    }
}
