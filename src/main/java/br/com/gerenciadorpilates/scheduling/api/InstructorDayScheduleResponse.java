package br.com.gerenciadorpilates.scheduling.api;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record InstructorDayScheduleResponse(
        UUID instructorUserId,
        LocalDate date,
        int totalSlots,
        int totalBookings,
        List<InstructorDaySlotResponse> slots
) {
}
