package br.com.gerenciadorpilates.students.api;

import br.com.gerenciadorpilates.students.domain.StudentLegalAcceptanceStatus;
import br.com.gerenciadorpilates.students.domain.StudentLegalCollectionMethod;
import br.com.gerenciadorpilates.students.domain.StudentLegalTermType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterStudentLegalAcceptanceRequest(
        @NotNull StudentLegalTermType termType,
        @NotBlank @Size(max = 255) String title,
        @NotBlank @Size(max = 60) String termsVersion,
        @Size(max = 255) String legalBasis,
        @NotBlank String termBody,
        @NotNull StudentLegalAcceptanceStatus status,
        StudentLegalCollectionMethod collectionMethod,
        @Size(max = 1000) String evidenceNote
) {
}
