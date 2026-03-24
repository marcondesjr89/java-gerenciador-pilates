package br.com.gerenciadorpilates.platform.security;

import java.security.Principal;
import java.util.UUID;

public record AuthenticatedActor(
        String name,
        UUID principalId,
        String principalType
) implements Principal {

    @Override
    public String getName() {
        return name;
    }
}
