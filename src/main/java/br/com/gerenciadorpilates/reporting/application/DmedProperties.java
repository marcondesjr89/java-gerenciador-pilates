package br.com.gerenciadorpilates.reporting.application;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.reporting.dmed")
public record DmedProperties(
        String providerName,
        String providerCnpj
) {
}
