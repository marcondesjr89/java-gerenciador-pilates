package br.com.gerenciadorpilates.notifications.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
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

    @Column(name = "attempted_at")
    private OffsetDateTime attemptedAt;

    @Column(name = "sent_at")
    private OffsetDateTime sentAt;

    @Column(name = "error_message", length = 500)
    private String errorMessage;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

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
        OffsetDateTime now = OffsetDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public void markAttempted(OffsetDateTime attemptedAt) {
        this.attemptedAt = attemptedAt;
    }

    public void markSent(OffsetDateTime sentAt) {
        this.status = NotificationStatus.SENT;
        this.sentAt = sentAt;
        this.errorMessage = null;
    }

    public void markFailed(OffsetDateTime attemptedAt, String errorMessage) {
        this.status = NotificationStatus.FAILED;
        this.attemptedAt = attemptedAt;
        this.errorMessage = errorMessage;
    }

    public void markRetrying() {
        this.status = NotificationStatus.PENDING;
        this.errorMessage = null;
    }

    public UUID getId() {
        return id;
    }

    public NotificationChannel getChannel() {
        return channel;
    }

    public NotificationStatus getStatus() {
        return status;
    }

    public String getRecipientReference() {
        return recipientReference;
    }

    public String getMessageTemplate() {
        return messageTemplate;
    }

    public String getPayloadJson() {
        return payloadJson;
    }

    public OffsetDateTime getAttemptedAt() {
        return attemptedAt;
    }

    public OffsetDateTime getSentAt() {
        return sentAt;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
