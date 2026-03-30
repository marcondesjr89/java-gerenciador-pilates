package br.com.gerenciadorpilates.students.api;

import br.com.gerenciadorpilates.identityaccess.domain.InstructorSpecialty;
import br.com.gerenciadorpilates.scheduling.domain.ScheduleBooking;
import br.com.gerenciadorpilates.scheduling.domain.ScheduleBookingStatus;
import br.com.gerenciadorpilates.scheduling.domain.ScheduleSlot;
import java.time.OffsetDateTime;
import java.util.UUID;

public record StudentPortalBookingSummaryResponse(
        UUID id,
        UUID slotId,
        UUID studentId,
        String studentName,
        ScheduleBookingStatus status,
        String instructorName,
        InstructorSpecialty requiredSpecialty,
        OffsetDateTime startTime,
        OffsetDateTime endTime
) {

    public static StudentPortalBookingSummaryResponse from(ScheduleBooking booking, ScheduleSlot slot) {
        return new StudentPortalBookingSummaryResponse(
                booking.getId(),
                booking.getSlotId(),
                booking.getStudentId(),
                booking.getStudentName(),
                booking.getStatus(),
                slot.getInstructorName(),
                slot.getRequiredSpecialty(),
                slot.getStartTime(),
                slot.getEndTime()
        );
    }
}
