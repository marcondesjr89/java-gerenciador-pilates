package br.com.gerenciadorpilates.students.api;

import br.com.gerenciadorpilates.students.domain.StudentLegalAcceptance;
import br.com.gerenciadorpilates.students.domain.StudentLegalAcceptanceStatus;
import br.com.gerenciadorpilates.students.domain.StudentLegalCollectionMethod;
import br.com.gerenciadorpilates.students.domain.StudentLegalTermType;
import java.time.OffsetDateTime;
import java.util.UUID;

public record StudentLegalAcceptanceVerificationResponse(
        UUID acceptanceId,
        UUID studentId,
        String studentName,
        String studentCpfMasked,
        StudentLegalTermType termType,
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
        boolean verified
) {

    public static StudentLegalAcceptanceVerificationResponse from(
            StudentLegalAcceptance acceptance,
            String studentName,
            String studentCpfMasked,
            String verificationCode,
            boolean verified
    ) {
        return new StudentLegalAcceptanceVerificationResponse(
                acceptance.getId(),
                acceptance.getStudentId(),
                studentName,
                studentCpfMasked,
                acceptance.getTermType(),
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
                verified
        );
    }
}
