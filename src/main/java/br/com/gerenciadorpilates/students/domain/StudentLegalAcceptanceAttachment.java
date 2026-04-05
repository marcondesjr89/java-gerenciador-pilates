package br.com.gerenciadorpilates.students.domain;

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
@Table(name = "student_legal_acceptance_attachment")
public class StudentLegalAcceptanceAttachment {

    @Id
    private UUID id;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "legal_acceptance_id", nullable = false)
    private UUID legalAcceptanceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "attachment_type", nullable = false)
    private StudentLegalAcceptanceAttachmentType attachmentType;

    @Column(name = "original_file_name", nullable = false)
    private String originalFileName;

    @Column(name = "storage_key", nullable = false, unique = true, length = 500)
    private String storageKey;

    @Column(name = "content_type", nullable = false, length = 120)
    private String contentType;

    @Column(name = "file_size", nullable = false)
    private long fileSize;

    @Column(name = "uploaded_by_user_id", nullable = false)
    private UUID uploadedByUserId;

    @Column(name = "uploaded_by_user_name", nullable = false)
    private String uploadedByUserName;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    protected StudentLegalAcceptanceAttachment() {
    }

    public StudentLegalAcceptanceAttachment(
            UUID id,
            UUID studentId,
            UUID legalAcceptanceId,
            StudentLegalAcceptanceAttachmentType attachmentType,
            String originalFileName,
            String storageKey,
            String contentType,
            long fileSize,
            UUID uploadedByUserId,
            String uploadedByUserName
    ) {
        this.id = id;
        this.studentId = studentId;
        this.legalAcceptanceId = legalAcceptanceId;
        this.attachmentType = attachmentType;
        this.originalFileName = originalFileName;
        this.storageKey = storageKey;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.uploadedByUserId = uploadedByUserId;
        this.uploadedByUserName = uploadedByUserName;
    }

    @PrePersist
    void prePersist() {
        createdAt = OffsetDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getStudentId() {
        return studentId;
    }

    public UUID getLegalAcceptanceId() {
        return legalAcceptanceId;
    }

    public StudentLegalAcceptanceAttachmentType getAttachmentType() {
        return attachmentType;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public String getStorageKey() {
        return storageKey;
    }

    public String getContentType() {
        return contentType;
    }

    public long getFileSize() {
        return fileSize;
    }

    public UUID getUploadedByUserId() {
        return uploadedByUserId;
    }

    public String getUploadedByUserName() {
        return uploadedByUserName;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
