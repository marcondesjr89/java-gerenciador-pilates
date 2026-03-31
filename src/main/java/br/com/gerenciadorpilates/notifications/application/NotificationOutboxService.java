package br.com.gerenciadorpilates.notifications.application;

import br.com.gerenciadorpilates.notifications.domain.NotificationOutboxEntry;
import br.com.gerenciadorpilates.notifications.domain.NotificationStatus;
import br.com.gerenciadorpilates.notifications.infrastructure.NotificationOutboxRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationOutboxService {

    private final NotificationOutboxRepository outboxRepository;

    public NotificationOutboxService(NotificationOutboxRepository outboxRepository) {
        this.outboxRepository = outboxRepository;
    }

    @Transactional(readOnly = true)
    public List<NotificationOutboxEntry> list(NotificationStatus status) {
        if (status == null) {
            return outboxRepository.findTop100ByOrderByCreatedAtDesc();
        }

        return outboxRepository.findTop100ByStatusOrderByCreatedAtDesc(status);
    }
}
