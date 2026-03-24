package br.com.gerenciadorpilates.notifications.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "notification_outbox_entry")
public class NotificationOutboxEntry {

    @Id
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationChannel channel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationStatus status;

    @Column(name = "recipient_reference", nullable = false)
    private String recipientReference;

    @Column(name = "message_template", nullable = false)
    private String messageTemplate;

    @Column(name = "payload_json", nullable = false, length = 4000)
    private String payloadJson;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    protected NotificationOutboxEntry() {
    }

    public NotificationOutboxEntry(
            UUID id,
            NotificationChannel channel,
            NotificationStatus status,
            String recipientReference,
            String messageTemplate,
            String payloadJson
    ) {
        this.id = id;
        this.channel = channel;
        this.status = status;
        this.recipientReference = recipientReference;
        this.messageTemplate = messageTemplate;
        this.payloadJson = payloadJson;
    }

    @PrePersist
    void prePersist() {
        createdAt = OffsetDateTime.now();
    }
}
