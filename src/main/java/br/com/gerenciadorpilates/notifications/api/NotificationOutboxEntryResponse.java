package br.com.gerenciadorpilates.notifications.api;

import br.com.gerenciadorpilates.notifications.domain.NotificationChannel;
import br.com.gerenciadorpilates.notifications.domain.NotificationOutboxEntry;
import br.com.gerenciadorpilates.notifications.domain.NotificationStatus;
import java.time.OffsetDateTime;
import java.util.UUID;

public record NotificationOutboxEntryResponse(
        UUID id,
        NotificationChannel channel,
        NotificationStatus status,
        String recipientReference,
        String messageTemplate,
        String payloadJson,
        OffsetDateTime attemptedAt,
        OffsetDateTime sentAt,
        String errorMessage,
        OffsetDateTime createdAt
) {

    public static NotificationOutboxEntryResponse from(NotificationOutboxEntry entry) {
        return new NotificationOutboxEntryResponse(
                entry.getId(),
                entry.getChannel(),
                entry.getStatus(),
                entry.getRecipientReference(),
                entry.getMessageTemplate(),
                entry.getPayloadJson(),
                entry.getAttemptedAt(),
                entry.getSentAt(),
                entry.getErrorMessage(),
                entry.getCreatedAt()
        );
    }
}
