package br.com.gerenciadorpilates.scheduling.api;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;
import java.util.UUID;

public record CreateScheduleBlockRequest(
        @NotNull UUID instructorUserId,
        @NotNull @Future OffsetDateTime startTime,
        @NotNull @Future OffsetDateTime endTime,
        @NotBlank @Size(max = 255) String reason
) {
}
