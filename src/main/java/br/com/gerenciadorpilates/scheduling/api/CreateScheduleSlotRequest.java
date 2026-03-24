package br.com.gerenciadorpilates.scheduling.api;

import br.com.gerenciadorpilates.identityaccess.domain.InstructorSpecialty;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.UUID;

public record CreateScheduleSlotRequest(
        @NotNull UUID instructorUserId,
        @NotNull InstructorSpecialty requiredSpecialty,
        @NotNull @Future OffsetDateTime startTime,
        @NotNull @Future OffsetDateTime endTime,
        @Min(1) int capacity
) {
}
