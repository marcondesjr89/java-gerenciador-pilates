package br.com.gerenciadorpilates.scheduling.api;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateWaitlistEntryRequest(@NotNull UUID studentId) {
}
