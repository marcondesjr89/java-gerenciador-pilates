package br.com.gerenciadorpilates.notifications.infrastructure;

import br.com.gerenciadorpilates.notifications.domain.NotificationOutboxEntry;
import br.com.gerenciadorpilates.notifications.domain.NotificationStatus;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationOutboxRepository extends JpaRepository<NotificationOutboxEntry, UUID> {

    java.util.List<NotificationOutboxEntry> findTop100ByOrderByCreatedAtDesc();

    java.util.List<NotificationOutboxEntry> findTop100ByStatusOrderByCreatedAtDesc(NotificationStatus status);

    List<NotificationOutboxEntry> findTopByStatusOrderByCreatedAtAsc(NotificationStatus status, org.springframework.data.domain.Pageable pageable);

    default List<NotificationOutboxEntry> findTopByStatusOrderByCreatedAtAsc(NotificationStatus status, int batchSize) {
        return findTopByStatusOrderByCreatedAtAsc(status, org.springframework.data.domain.PageRequest.of(0, batchSize));
    }
}
