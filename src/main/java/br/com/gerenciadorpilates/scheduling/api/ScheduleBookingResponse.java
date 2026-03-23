package br.com.gerenciadorpilates.scheduling.api;

import br.com.gerenciadorpilates.scheduling.domain.ScheduleBooking;
import br.com.gerenciadorpilates.scheduling.domain.ScheduleBookingStatus;
import java.util.UUID;

public record ScheduleBookingResponse(
        UUID id,
        UUID slotId,
        UUID studentId,
        String studentName,
        ScheduleBookingStatus status
) {

    public static ScheduleBookingResponse from(ScheduleBooking booking) {
        return new ScheduleBookingResponse(
                booking.getId(),
                booking.getSlotId(),
                booking.getStudentId(),
                booking.getStudentName(),
                booking.getStatus()
        );
    }
}
