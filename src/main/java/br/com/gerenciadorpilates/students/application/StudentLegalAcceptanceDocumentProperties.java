package br.com.gerenciadorpilates.students.application;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.students.legal-acceptances")
public record StudentLegalAcceptanceDocumentProperties(
        @NotBlank String verificationBaseUrl
) {
}
