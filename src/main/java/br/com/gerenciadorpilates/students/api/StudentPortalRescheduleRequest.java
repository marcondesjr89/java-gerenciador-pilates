package br.com.gerenciadorpilates.students.api;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record StudentPortalRescheduleRequest(@NotNull UUID targetSlotId) {
}
