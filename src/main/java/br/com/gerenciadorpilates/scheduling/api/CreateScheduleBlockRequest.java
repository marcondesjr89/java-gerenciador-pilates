package br.com.gerenciadorpilates.scheduling.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;
import java.util.UUID;

public record CreateScheduleBlockRequest(
        @NotNull(message = "Instrutor e obrigatorio") UUID instructorUserId,
        @NotNull(message = "Horario inicial e obrigatorio") OffsetDateTime startTime,
        @NotNull(message = "Horario final e obrigatorio") OffsetDateTime endTime,
        @NotBlank(message = "Motivo e obrigatorio") @Size(max = 255, message = "Motivo deve ter no maximo 255 caracteres") String reason
) {
}

