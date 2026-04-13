package br.com.gerenciadorpilates.students.application;

public record StudentLegalAcceptanceAuditMetadata(
        String ipAddress,
        String userAgent,
        String sessionKey,
        String collectionOrigin
) {
}
