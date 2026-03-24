package br.com.gerenciadorpilates.scheduling.api;

public record ScheduleRescheduleResponse(
        ScheduleBookingResponse canceledBooking,
        ScheduleBookingResponse newBooking
) {
}
