package br.com.gerenciadorpilates.students.application;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.students.legal-acceptances.digital-signature")
public record DigitalSignatureProperties(
        boolean enabled,
        String keystoreType,
        String keystorePath,
        String keystorePassword,
        String keyAlias,
        String keyPassword,
        String signatureReason,
        String signatureLocation,
        boolean icpBrasil
) {

    public DigitalSignatureProperties {
        if (keystoreType == null || keystoreType.isBlank()) {
            keystoreType = "PKCS12";
        }
        if (signatureReason == null || signatureReason.isBlank()) {
            signatureReason = "Autenticidade e integridade do registro juridico institucional";
        }
        if (signatureLocation == null || signatureLocation.isBlank()) {
            signatureLocation = "Studio de Pilates";
        }
    }
}
