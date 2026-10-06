package br.com.gerenciadorpilates.students.api;

import br.com.gerenciadorpilates.students.application.DigitalSignatureMetadata;
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
        boolean verified,
        boolean digitalSignaturePresent,
        String digitalSignatureType,
        String certificateIssuer,
        String certificateSubject,
        String certificateSerialNumber,
        String legalFramework,
        OffsetDateTime signatureTimestamp
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
        return from(
                acceptance,
                studentName,
                studentCpfMasked,
                issuerName,
                issuerDocument,
                verificationCode,
                documentReference,
                verificationStatement,
                verified,
                DigitalSignatureMetadata.simple()
        );
    }

    public static StudentLegalAcceptanceVerificationResponse from(
            StudentLegalAcceptance acceptance,
            String studentName,
            String studentCpfMasked,
            String issuerName,
            String issuerDocument,
            String verificationCode,
            String documentReference,
            String verificationStatement,
            boolean verified,
            DigitalSignatureMetadata signatureMetadata
    ) {
        DigitalSignatureMetadata meta = signatureMetadata != null ? signatureMetadata : DigitalSignatureMetadata.simple();
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
                verified,
                meta.signed(),
                meta.signatureType().name(),
                meta.certificateIssuer(),
                meta.certificateSubject(),
                meta.certificateSerialNumber(),
                meta.legalFramework(),
                meta.signedAt()
        );
    }
}
