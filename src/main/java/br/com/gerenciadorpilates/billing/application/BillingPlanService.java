package br.com.gerenciadorpilates.billing.application;

import br.com.gerenciadorpilates.billing.api.BillingPlanResponse;
import br.com.gerenciadorpilates.billing.api.CreateBillingPlanRequest;
import br.com.gerenciadorpilates.billing.domain.BillingPlan;
import br.com.gerenciadorpilates.billing.infrastructure.BillingPlanRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BillingPlanService {

    private final BillingPlanRepository planRepository;

    public BillingPlanService(BillingPlanRepository planRepository) {
        this.planRepository = planRepository;
    }

    @Transactional
    public BillingPlanResponse create(CreateBillingPlanRequest request) {
        planRepository.findByNameIgnoreCase(request.name().trim())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Ja existe um plano com este nome.");
                });

        BillingPlan plan = new BillingPlan(
                UUID.randomUUID(),
                request.name().trim(),
                request.priceAmount(),
                request.billingCycleMonths(),
                true
        );
        return BillingPlanResponse.from(planRepository.save(plan));
    }

    @Transactional(readOnly = true)
    public List<BillingPlanResponse> list() {
        return planRepository.findAll()
                .stream()
                .map(BillingPlanResponse::from)
                .toList();
    }
}
