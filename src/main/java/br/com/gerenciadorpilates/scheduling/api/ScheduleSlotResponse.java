package br.com.gerenciadorpilates.scheduling.api;

import br.com.gerenciadorpilates.identityaccess.domain.InstructorSpecialty;
import br.com.gerenciadorpilates.scheduling.domain.ScheduleSlot;
import java.time.OffsetDateTime;
import java.util.UUID;

public record ScheduleSlotResponse(
        UUID id,
        UUID instructorUserId,
        String instructorName,
        InstructorSpecialty requiredSpecialty,
        OffsetDateTime startTime,
        OffsetDateTime endTime,
        int capacity,
        int bookedCount,
        int availableSpots
) {

    public static ScheduleSlotResponse from(ScheduleSlot slot) {
        return new ScheduleSlotResponse(
                slot.getId(),
                slot.getInstructorUserId(),
                slot.getInstructorName(),
                slot.getRequiredSpecialty(),
                slot.getStartTime(),
                slot.getEndTime(),
                slot.getCapacity(),
                slot.getBookedCount(),
                slot.getCapacity() - slot.getBookedCount()
        );
    }
}
