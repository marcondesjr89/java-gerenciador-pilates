package br.com.gerenciadorpilates.platform.security;

import org.springframework.security.core.Authentication;

public final class SecurityActorUtils {

    private SecurityActorUtils() {
    }

    public static AuthenticatedActor requireActor(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedActor actor)) {
            throw new IllegalStateException("Usuario autenticado nao encontrado no contexto de seguranca.");
        }
        return actor;
    }
}
