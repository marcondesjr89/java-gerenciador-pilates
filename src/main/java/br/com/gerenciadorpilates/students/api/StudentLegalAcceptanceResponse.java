package br.com.gerenciadorpilates.students.api;

import br.com.gerenciadorpilates.students.domain.StudentLegalAcceptance;
import br.com.gerenciadorpilates.students.domain.StudentLegalAcceptanceStatus;
import br.com.gerenciadorpilates.students.domain.StudentLegalCollectionMethod;
import br.com.gerenciadorpilates.students.domain.StudentLegalTermType;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record StudentLegalAcceptanceResponse(
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
        String auditCollectionOrigin,
        List<StudentLegalAcceptanceAttachmentResponse> attachments,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {

    public static StudentLegalAcceptanceResponse from(
            StudentLegalAcceptance acceptance,
            List<StudentLegalAcceptanceAttachmentResponse> attachments
    ) {
        return new StudentLegalAcceptanceResponse(
                acceptance.getId(),
                acceptance.getStudentId(),
                acceptance.getTermType(),
                acceptance.getCoveredTermTypes(),
                acceptance.getTitle(),
                acceptance.getTermsVersion(),
                acceptance.getLegalBasis(),
                acceptance.getDocumentHash(),
                acceptance.getTermBody(),
                acceptance.getStatus(),
                acceptance.getCollectionMethod(),
                acceptance.getAcceptedAt(),
                acceptance.getEvidenceNote(),
                acceptance.getCapturedByUserId(),
                acceptance.getCapturedByUserName(),
                acceptance.getAuditIpAddress(),
                acceptance.getAuditUserAgent(),
                acceptance.getAuditSessionKey(),
                acceptance.getAuditCollectionOrigin(),
                attachments,
                acceptance.getCreatedAt(),
                acceptance.getUpdatedAt()
        );
    }
}
