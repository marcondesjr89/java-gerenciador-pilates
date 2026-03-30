package br.com.gerenciadorpilates.students.api;

import br.com.gerenciadorpilates.identityaccess.domain.InstructorSpecialty;
import java.time.OffsetDateTime;
import java.util.UUID;

public record StudentPortalRescheduleOptionResponse(
        UUID slotId,
        String instructorName,
        InstructorSpecialty requiredSpecialty,
        OffsetDateTime startTime,
        OffsetDateTime endTime,
        int availableSpots
) {
}
