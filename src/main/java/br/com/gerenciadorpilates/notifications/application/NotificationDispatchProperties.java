package br.com.gerenciadorpilates.notifications.application;

import jakarta.validation.constraints.Min;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.notifications")
public record NotificationDispatchProperties(
        boolean enabled,
        @Min(1) int batchSize,
        @Min(1000) long outboxFixedDelayMs,
        WhatsAppProperties whatsapp
) {

    public record WhatsAppProperties(
            boolean enabled,
            String webhookUrl,
            String authToken
    ) {
    }
}
