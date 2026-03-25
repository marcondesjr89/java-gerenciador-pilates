package br.com.gerenciadorpilates.billing.infrastructure;

import br.com.gerenciadorpilates.billing.domain.BillingPlan;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillingPlanRepository extends JpaRepository<BillingPlan, UUID> {

    Optional<BillingPlan> findByNameIgnoreCase(String name);
}
