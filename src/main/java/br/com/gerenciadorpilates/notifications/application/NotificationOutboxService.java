package br.com.gerenciadorpilates.notifications.application;

import br.com.gerenciadorpilates.notifications.api.NotificationOutboxSummaryResponse;
import br.com.gerenciadorpilates.notifications.domain.NotificationOutboxEntry;
import br.com.gerenciadorpilates.notifications.domain.NotificationStatus;
import br.com.gerenciadorpilates.notifications.infrastructure.NotificationOutboxRepository;
import br.com.gerenciadorpilates.platform.domain.ResourceNotFoundException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationOutboxService {

    private final NotificationOutboxRepository outboxRepository;
    private final NotificationOutboxProcessor processor;

    public NotificationOutboxService(
            NotificationOutboxRepository outboxRepository,
            NotificationOutboxProcessor processor
    ) {
        this.outboxRepository = outboxRepository;
        this.processor = processor;
    }

    @Transactional(readOnly = true)
    public List<NotificationOutboxEntry> list(NotificationStatus status) {
        if (status == null) {
            return outboxRepository.findTop100ByOrderByCreatedAtDesc();
        }

        return outboxRepository.findTop100ByStatusOrderByCreatedAtDesc(status);
    }

    @Transactional(readOnly = true)
    public NotificationOutboxSummaryResponse getSummary() {
        long total = outboxRepository.count();
        long pending = outboxRepository.countByStatus(NotificationStatus.PENDING);
        long sent = outboxRepository.countByStatus(NotificationStatus.SENT);
        long failed = outboxRepository.countByStatus(NotificationStatus.FAILED);

        OffsetDateTime lastAttemptedAt = outboxRepository
                .findFirstByStatusOrderByAttemptedAtDesc(NotificationStatus.SENT)
                .map(NotificationOutboxEntry::getAttemptedAt)
                .orElse(null);

        return new NotificationOutboxSummaryResponse(total, pending, sent, failed, lastAttemptedAt);
    }

    @Transactional
    public NotificationOutboxEntry retry(UUID entryId) {
        NotificationOutboxEntry entry = outboxRepository.findById(entryId)
                .orElseThrow(() -> new ResourceNotFoundException("Notificacao nao encontrada."));

        if (entry.getStatus() == NotificationStatus.SENT) {
            throw new IllegalArgumentException("Notificacao ja foi enviada com sucesso.");
        }

        entry.markRetrying();
        NotificationOutboxEntry saved = outboxRepository.save(entry);
        processor.processSingle(saved);
        return saved;
    }

    @Transactional
    public int processNow() {
        return processor.processPendingNow();
    }
}
