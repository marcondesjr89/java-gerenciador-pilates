package br.com.gerenciadorpilates.scheduling.api;

import br.com.gerenciadorpilates.identityaccess.domain.InstructorSpecialty;
import br.com.gerenciadorpilates.scheduling.domain.ScheduleSlot;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record InstructorDaySlotResponse(
        UUID id,
        UUID instructorUserId,
        String instructorName,
        InstructorSpecialty requiredSpecialty,
        OffsetDateTime startTime,
        OffsetDateTime endTime,
        int capacity,
        int bookedCount,
        int availableSpots,
        List<InstructorDayBookingResponse> bookings
) {

    public static InstructorDaySlotResponse from(ScheduleSlot slot, List<InstructorDayBookingResponse> bookings) {
        return new InstructorDaySlotResponse(
                slot.getId(),
                slot.getInstructorUserId(),
                slot.getInstructorName(),
                slot.getRequiredSpecialty(),
                slot.getStartTime(),
                slot.getEndTime(),
                slot.getCapacity(),
                slot.getBookedCount(),
                slot.getCapacity() - slot.getBookedCount(),
                bookings
        );
    }
}
