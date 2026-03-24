package br.com.gerenciadorpilates.scheduling.application;

import jakarta.validation.constraints.Min;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.scheduling.policy")
public record SchedulingPolicyProperties(
        @Min(0) long minHoursBeforeCancellation,
        @Min(0) long minHoursBeforeReschedule
) {
}
