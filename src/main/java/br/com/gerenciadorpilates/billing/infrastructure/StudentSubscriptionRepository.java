package br.com.gerenciadorpilates.billing.infrastructure;

import br.com.gerenciadorpilates.billing.domain.StudentSubscription;
import br.com.gerenciadorpilates.billing.domain.SubscriptionStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentSubscriptionRepository extends JpaRepository<StudentSubscription, UUID> {

    Optional<StudentSubscription> findByStudentIdAndStatus(UUID studentId, SubscriptionStatus status);

    List<StudentSubscription> findAllByStudentIdOrderByStartDateDesc(UUID studentId);
}
