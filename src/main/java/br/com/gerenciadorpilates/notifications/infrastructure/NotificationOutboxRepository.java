package br.com.gerenciadorpilates.notifications.infrastructure;

import br.com.gerenciadorpilates.notifications.domain.NotificationOutboxEntry;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationOutboxRepository extends JpaRepository<NotificationOutboxEntry, UUID> {
}
