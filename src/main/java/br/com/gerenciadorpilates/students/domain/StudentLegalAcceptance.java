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
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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

    @Column(name = "covered_term_types", nullable = false, columnDefinition = "text")
    private String coveredTermTypes;

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

    @Column(name = "audit_ip_address", length = 255)
    private String auditIpAddress;

    @Column(name = "audit_user_agent", length = 1000)
    private String auditUserAgent;

    @Column(name = "audit_session_key", length = 64)
    private String auditSessionKey;

    @Column(name = "audit_collection_origin", length = 120)
    private String auditCollectionOrigin;

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
            List<StudentLegalTermType> coveredTermTypes,
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
            String capturedByUserName,
            String auditIpAddress,
            String auditUserAgent,
            String auditSessionKey,
            String auditCollectionOrigin
    ) {
        this.id = id;
        this.studentId = studentId;
        this.termType = termType;
        this.coveredTermTypes = serializeCoveredTermTypes(coveredTermTypes, termType);
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
        this.auditIpAddress = auditIpAddress;
        this.auditUserAgent = auditUserAgent;
        this.auditSessionKey = auditSessionKey;
        this.auditCollectionOrigin = auditCollectionOrigin;
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

    public List<StudentLegalTermType> getCoveredTermTypes() {
        return deserializeCoveredTermTypes(coveredTermTypes, termType);
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

    public String getAuditIpAddress() {
        return auditIpAddress;
    }

    public String getAuditUserAgent() {
        return auditUserAgent;
    }

    public String getAuditSessionKey() {
        return auditSessionKey;
    }

    public String getAuditCollectionOrigin() {
        return auditCollectionOrigin;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    private static String serializeCoveredTermTypes(List<StudentLegalTermType> coveredTermTypes, StudentLegalTermType primaryTermType) {
        return normalizeCoveredTermTypes(coveredTermTypes, primaryTermType).stream()
                .map(StudentLegalTermType::name)
                .collect(Collectors.joining(","));
    }

    private static List<StudentLegalTermType> deserializeCoveredTermTypes(String value, StudentLegalTermType primaryTermType) {
        if (value == null || value.isBlank()) {
            return List.of(primaryTermType);
        }

        List<StudentLegalTermType> parsedValues = Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(item -> !item.isBlank())
                .map(StudentLegalTermType::valueOf)
                .distinct()
                .toList();

        return parsedValues.isEmpty() ? List.of(primaryTermType) : parsedValues;
    }

    private static List<StudentLegalTermType> normalizeCoveredTermTypes(
            List<StudentLegalTermType> coveredTermTypes,
            StudentLegalTermType primaryTermType
    ) {
        if (coveredTermTypes == null || coveredTermTypes.isEmpty()) {
            return List.of(primaryTermType);
        }

        List<StudentLegalTermType> normalizedValues = coveredTermTypes.stream()
                .filter(item -> item != null)
                .distinct()
                .toList();

        if (normalizedValues.isEmpty()) {
            return List.of(primaryTermType);
        }

        if (normalizedValues.contains(primaryTermType)) {
            return normalizedValues;
        }

        java.util.ArrayList<StudentLegalTermType> values = new java.util.ArrayList<>();
        values.add(primaryTermType);
        values.addAll(normalizedValues);
        return List.copyOf(values);
    }
}
