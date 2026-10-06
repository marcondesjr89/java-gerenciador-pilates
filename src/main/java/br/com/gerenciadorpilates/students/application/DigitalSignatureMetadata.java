package br.com.gerenciadorpilates.students.application;

import br.com.gerenciadorpilates.students.domain.DigitalSignatureType;
import java.time.OffsetDateTime;

public record DigitalSignatureMetadata(
        boolean signed,
        DigitalSignatureType signatureType,
        String certificateSubject,
        String certificateIssuer,
        String certificateSerialNumber,
        OffsetDateTime signedAt,
        String algorithm,
        String legalFramework
) {

    public static DigitalSignatureMetadata simple() {
        return new DigitalSignatureMetadata(
                false,
                DigitalSignatureType.SIMPLE,
                null,
                null,
                null,
                null,
                "SHA-256",
                DigitalSignatureType.SIMPLE.getLegalBasis()
        );
    }
}
