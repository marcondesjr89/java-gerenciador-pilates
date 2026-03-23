package br.com.gerenciadorpilates.identityaccess.api;

import br.com.gerenciadorpilates.identityaccess.domain.UserRole;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresInSeconds,
        String email,
        UserRole role
) {
}
