package br.com.gerenciadorpilates.scheduling.api;

import br.com.gerenciadorpilates.scheduling.application.ScheduleBookingService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/schedule-slots/{slotId}/bookings")
public class ScheduleBookingController {

    private final ScheduleBookingService bookingService;

    public ScheduleBookingController(ScheduleBookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ScheduleBookingResponse create(
            @PathVariable UUID slotId,
            @Valid @RequestBody CreateScheduleBookingRequest request
    ) {
        return bookingService.create(slotId, request.studentId());
    }

    @GetMapping
    public List<ScheduleBookingResponse> list(@PathVariable UUID slotId) {
        return bookingService.listActiveBySlot(slotId);
    }

    @DeleteMapping("/{bookingId}")
    public ScheduleBookingResponse cancel(@PathVariable UUID slotId, @PathVariable UUID bookingId) {
        return bookingService.cancel(slotId, bookingId);
    }

    @PostMapping("/{bookingId}/self-service-cancel")
    public ScheduleBookingResponse selfServiceCancel(@PathVariable UUID slotId, @PathVariable UUID bookingId) {
        return bookingService.selfServiceCancel(slotId, bookingId);
    }

    @PostMapping("/{bookingId}/self-service-reschedule")
    public ScheduleRescheduleResponse selfServiceReschedule(
            @PathVariable UUID slotId,
            @PathVariable UUID bookingId,
            @Valid @RequestBody ScheduleRescheduleRequest request
    ) {
        return bookingService.selfServiceReschedule(slotId, bookingId, request.targetSlotId());
    }
}
