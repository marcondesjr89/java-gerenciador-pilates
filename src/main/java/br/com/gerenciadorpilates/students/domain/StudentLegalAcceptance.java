package br.com.gerenciadorpilates.students.domain;

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
@Table(name = "student_legal_acceptance")
public class StudentLegalAcceptance {

    @Id
    private UUID id;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "term_type", nullable = false)
    private StudentLegalTermType termType;

    @Column(nullable = false)
    private String title;

    @Column(name = "terms_version", nullable = false)
    private String termsVersion;

    @Column(name = "legal_basis")
    private String legalBasis;

    @Column(name = "document_hash", nullable = false, length = 64)
    private String documentHash;

    @Column(name = "term_body", nullable = false, columnDefinition = "text")
    private String termBody;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StudentLegalAcceptanceStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "collection_method")
    private StudentLegalCollectionMethod collectionMethod;

    @Column(name = "accepted_at")
    private OffsetDateTime acceptedAt;

    @Column(name = "evidence_note", length = 1000)
    private String evidenceNote;

    @Column(name = "captured_by_user_id")
    private UUID capturedByUserId;

    @Column(name = "captured_by_user_name")
    private String capturedByUserName;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected StudentLegalAcceptance() {
    }

    public StudentLegalAcceptance(
            UUID id,
            UUID studentId,
            StudentLegalTermType termType,
            String title,
            String termsVersion,
            String legalBasis,
            String documentHash,
            String termBody,
            StudentLegalAcceptanceStatus status,
            StudentLegalCollectionMethod collectionMethod,
            OffsetDateTime acceptedAt,
            String evidenceNote,
            UUID capturedByUserId,
            String capturedByUserName
    ) {
        this.id = id;
        this.studentId = studentId;
        this.termType = termType;
        this.title = title;
        this.termsVersion = termsVersion;
        this.legalBasis = legalBasis;
        this.documentHash = documentHash;
        this.termBody = termBody;
        this.status = status;
        this.collectionMethod = collectionMethod;
        this.acceptedAt = acceptedAt;
        this.evidenceNote = evidenceNote;
        this.capturedByUserId = capturedByUserId;
        this.capturedByUserName = capturedByUserName;
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

    public UUID getId() {
        return id;
    }

    public UUID getStudentId() {
        return studentId;
    }

    public StudentLegalTermType getTermType() {
        return termType;
    }

    public String getTitle() {
        return title;
    }

    public String getTermsVersion() {
        return termsVersion;
    }

    public String getLegalBasis() {
        return legalBasis;
    }

    public String getDocumentHash() {
        return documentHash;
    }

    public String getTermBody() {
        return termBody;
    }

    public StudentLegalAcceptanceStatus getStatus() {
        return status;
    }

    public StudentLegalCollectionMethod getCollectionMethod() {
        return collectionMethod;
    }

    public OffsetDateTime getAcceptedAt() {
        return acceptedAt;
    }

    public String getEvidenceNote() {
        return evidenceNote;
    }

    public UUID getCapturedByUserId() {
        return capturedByUserId;
    }

    public String getCapturedByUserName() {
        return capturedByUserName;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}
