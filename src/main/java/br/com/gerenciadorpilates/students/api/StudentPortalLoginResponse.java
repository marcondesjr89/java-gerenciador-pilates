package br.com.gerenciadorpilates.students.api;

import java.util.UUID;

public record StudentPortalLoginResponse(
        String accessToken,
        String tokenType,
        long expiresInSeconds,
        UUID studentId,
        String email,
        String fullName
) {
}
