package br.com.gerenciadorpilates.scheduling.api;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateScheduleBookingRequest(@NotNull UUID studentId) {
}
