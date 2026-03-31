package br.com.gerenciadorpilates.notifications.application;

import br.com.gerenciadorpilates.notifications.domain.NotificationOutboxEntry;
import br.com.gerenciadorpilates.notifications.domain.NotificationStatus;
import br.com.gerenciadorpilates.notifications.infrastructure.NotificationOutboxRepository;
import java.time.OffsetDateTime;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationOutboxProcessor {

    private static final Logger log = LoggerFactory.getLogger(NotificationOutboxProcessor.class);

    private final NotificationOutboxRepository outboxRepository;
    private final NotificationDispatchProperties properties;
    private final WhatsAppNotificationDispatcher whatsAppDispatcher;

    public NotificationOutboxProcessor(
            NotificationOutboxRepository outboxRepository,
            NotificationDispatchProperties properties,
            WhatsAppNotificationDispatcher whatsAppDispatcher
    ) {
        this.outboxRepository = outboxRepository;
        this.properties = properties;
        this.whatsAppDispatcher = whatsAppDispatcher;
    }

    @Scheduled(fixedDelayString = "${app.notifications.outbox-fixed-delay-ms:30000}")
    @Transactional
    public void processPending() {
        if (!properties.enabled()) {
            return;
        }

        List<NotificationOutboxEntry> entries = outboxRepository
                .findTopByStatusOrderByCreatedAtAsc(NotificationStatus.PENDING, properties.batchSize());

        for (NotificationOutboxEntry entry : entries) {
            entry.markAttempted(OffsetDateTime.now());
            try {
                switch (entry.getChannel()) {
                    case WHATSAPP -> whatsAppDispatcher.dispatch(entry);
                }
                entry.markSent(OffsetDateTime.now());
            } catch (Exception exception) {
                entry.markFailed(OffsetDateTime.now(), truncateError(exception.getMessage()));
                log.warn("Falha ao enviar notificacao {} pelo canal {}: {}", entry.getId(), entry.getChannel(), exception.getMessage());
            }
        }
    }

    private String truncateError(String message) {
        if (message == null || message.isBlank()) {
            return "Falha sem detalhe retornado.";
        }
        return message.length() <= 500 ? message : message.substring(0, 500);
    }
}
