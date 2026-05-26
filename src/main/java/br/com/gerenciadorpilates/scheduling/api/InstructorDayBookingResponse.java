package br.com.gerenciadorpilates.scheduling.api;

import br.com.gerenciadorpilates.scheduling.domain.ScheduleBooking;
import br.com.gerenciadorpilates.scheduling.domain.ScheduleBookingStatus;
import java.util.UUID;

public record InstructorDayBookingResponse(
        UUID id,
        UUID slotId,
        UUID studentId,
        String studentName,
        ScheduleBookingStatus status,
        InstructorDayClinicalSummaryResponse clinicalSummary
) {

    public static InstructorDayBookingResponse from(
            ScheduleBooking booking,
            InstructorDayClinicalSummaryResponse clinicalSummary
    ) {
        return new InstructorDayBookingResponse(
                booking.getId(),
                booking.getSlotId(),
                booking.getStudentId(),
                booking.getStudentName(),
                booking.getStatus(),
                clinicalSummary
        );
    }
}
