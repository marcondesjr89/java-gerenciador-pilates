package br.com.gerenciadorpilates.scheduling.api;

import br.com.gerenciadorpilates.identityaccess.domain.InstructorSpecialty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.UUID;

public record CreateScheduleSlotRequest(
        @NotNull(message = "Instrutor e obrigatorio") UUID instructorUserId,
        @NotNull(message = "Especialidade e obrigatoria") InstructorSpecialty requiredSpecialty,
        @NotNull(message = "Horario inicial e obrigatorio") OffsetDateTime startTime,
        @NotNull(message = "Horario final e obrigatorio") OffsetDateTime endTime,
        @Min(value = 1, message = "Capacidade minima e 1") int capacity
) {
}
