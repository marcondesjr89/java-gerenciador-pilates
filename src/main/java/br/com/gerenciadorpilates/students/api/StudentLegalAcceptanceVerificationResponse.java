package br.com.gerenciadorpilates.students.api;

import br.com.gerenciadorpilates.students.domain.StudentLegalAcceptance;
import br.com.gerenciadorpilates.students.domain.StudentLegalAcceptanceStatus;
import br.com.gerenciadorpilates.students.domain.StudentLegalCollectionMethod;
import br.com.gerenciadorpilates.students.domain.StudentLegalTermType;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record StudentLegalAcceptanceVerificationResponse(
        UUID acceptanceId,
        UUID studentId,
        String studentName,
        String studentCpfMasked,
        String issuerName,
        String issuerDocument,
        StudentLegalTermType termType,
        List<StudentLegalTermType> coveredTermTypes,
        String title,
        String termsVersion,
        String legalBasis,
        String documentHash,
        StudentLegalAcceptanceStatus status,
        StudentLegalCollectionMethod collectionMethod,
        OffsetDateTime acceptedAt,
        OffsetDateTime createdAt,
        String capturedByUserName,
        String verificationCode,
        String documentReference,
        String verificationStatement,
        boolean verified
) {

    public static StudentLegalAcceptanceVerificationResponse from(
            StudentLegalAcceptance acceptance,
            String studentName,
            String studentCpfMasked,
            String issuerName,
            String issuerDocument,
            String verificationCode,
            String documentReference,
            String verificationStatement,
            boolean verified
    ) {
        return new StudentLegalAcceptanceVerificationResponse(
                acceptance.getId(),
                acceptance.getStudentId(),
                studentName,
                studentCpfMasked,
                issuerName,
                issuerDocument,
                acceptance.getTermType(),
                acceptance.getCoveredTermTypes(),
                acceptance.getTitle(),
                acceptance.getTermsVersion(),
                acceptance.getLegalBasis(),
                acceptance.getDocumentHash(),
                acceptance.getStatus(),
                acceptance.getCollectionMethod(),
                acceptance.getAcceptedAt(),
                acceptance.getCreatedAt(),
                acceptance.getCapturedByUserName(),
                verificationCode,
                documentReference,
                verificationStatement,
                verified
        );
    }
}
