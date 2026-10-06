package br.com.gerenciadorpilates.notifications.api;

import java.time.OffsetDateTime;

public record NotificationOutboxSummaryResponse(
        long total,
        long pending,
        long sent,
        long failed,
        OffsetDateTime lastAttemptedAt
) {
}
