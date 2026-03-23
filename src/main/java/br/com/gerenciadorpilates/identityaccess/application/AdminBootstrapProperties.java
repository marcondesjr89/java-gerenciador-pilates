package br.com.gerenciadorpilates.identityaccess.application;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.bootstrap-admin")
public record AdminBootstrapProperties(
        boolean enabled,
        String fullName,
        String email,
        String password
) {
}
