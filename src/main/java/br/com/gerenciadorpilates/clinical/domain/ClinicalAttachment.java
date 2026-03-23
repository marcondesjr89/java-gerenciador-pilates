package br.com.gerenciadorpilates.clinical.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "clinical_attachment")
public class ClinicalAttachment {

    @Id
    private UUID id;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "progress_entry_id", nullable = false)
    private UUID progressEntryId;

    @Column(name = "uploaded_by_user_id", nullable = false)
    private UUID uploadedByUserId;

    @Column(name = "uploaded_by_user_name", nullable = false)
    private String uploadedByUserName;

    @Column(name = "original_file_name", nullable = false)
    private String originalFileName;

    @Column(name = "storage_key", nullable = false, unique = true)
    private String storageKey;

    @Column(name = "content_type", nullable = false)
    private String contentType;

    @Column(name = "file_size", nullable = false)
    private long fileSize;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    protected ClinicalAttachment() {
    }

    public ClinicalAttachment(
            UUID id,
            UUID studentId,
            UUID progressEntryId,
            UUID uploadedByUserId,
            String uploadedByUserName,
            String originalFileName,
            String storageKey,
            String contentType,
            long fileSize
    ) {
        this.id = id;
        this.studentId = studentId;
        this.progressEntryId = progressEntryId;
        this.uploadedByUserId = uploadedByUserId;
        this.uploadedByUserName = uploadedByUserName;
        this.originalFileName = originalFileName;
        this.storageKey = storageKey;
        this.contentType = contentType;
        this.fileSize = fileSize;
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

    public UUID getProgressEntryId() {
        return progressEntryId;
    }

    public UUID getUploadedByUserId() {
        return uploadedByUserId;
    }

    public String getUploadedByUserName() {
        return uploadedByUserName;
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

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
