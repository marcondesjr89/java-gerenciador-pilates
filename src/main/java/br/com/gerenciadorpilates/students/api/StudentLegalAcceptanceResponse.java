package br.com.gerenciadorpilates.students.api;

import br.com.gerenciadorpilates.students.domain.StudentLegalAcceptance;
import br.com.gerenciadorpilates.students.domain.StudentLegalAcceptanceStatus;
import br.com.gerenciadorpilates.students.domain.StudentLegalCollectionMethod;
import br.com.gerenciadorpilates.students.domain.StudentLegalTermType;
import java.time.OffsetDateTime;
import java.util.UUID;

public record StudentLegalAcceptanceResponse(
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
        String capturedByUserName,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {

    public static StudentLegalAcceptanceResponse from(StudentLegalAcceptance acceptance) {
        return new StudentLegalAcceptanceResponse(
                acceptance.getId(),
                acceptance.getStudentId(),
                acceptance.getTermType(),
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
                acceptance.getCreatedAt(),
                acceptance.getUpdatedAt()
        );
    }
}
