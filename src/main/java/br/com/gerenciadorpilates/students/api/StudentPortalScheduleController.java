package br.com.gerenciadorpilates.students.api;

import br.com.gerenciadorpilates.platform.security.AuthenticatedActor;
import br.com.gerenciadorpilates.platform.security.SecurityActorUtils;
import br.com.gerenciadorpilates.scheduling.api.ScheduleBookingResponse;
import br.com.gerenciadorpilates.scheduling.api.ScheduleSlotResponse;
import br.com.gerenciadorpilates.scheduling.api.WaitlistEntryResponse;
import br.com.gerenciadorpilates.scheduling.application.ScheduleBookingService;
import br.com.gerenciadorpilates.scheduling.application.ScheduleSlotService;
import br.com.gerenciadorpilates.scheduling.application.ScheduleWaitlistService;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/student-portal/me/schedule-slots")
public class StudentPortalScheduleController {

    private final ScheduleSlotService slotService;
    private final ScheduleBookingService bookingService;
    private final ScheduleWaitlistService waitlistService;

    public StudentPortalScheduleController(
            ScheduleSlotService slotService,
            ScheduleBookingService bookingService,
            ScheduleWaitlistService waitlistService
    ) {
        this.slotService = slotService;
        this.bookingService = bookingService;
        this.waitlistService = waitlistService;
    }

    @GetMapping
    public List<ScheduleSlotResponse> listByDate(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return slotService.listPortalByDate(date);
    }

    @PostMapping("/{slotId}/bookings")
    public ScheduleBookingResponse createBooking(
            @PathVariable UUID slotId,
            Authentication authentication
    ) {
        AuthenticatedActor actor = SecurityActorUtils.requireActor(authentication);
        return bookingService.selfServiceCreate(slotId, actor.principalId());
    }

    @PostMapping("/{slotId}/waitlist")
    public WaitlistEntryResponse joinWaitlist(
            @PathVariable UUID slotId,
            Authentication authentication
    ) {
        AuthenticatedActor actor = SecurityActorUtils.requireActor(authentication);
        return waitlistService.selfServiceJoin(slotId, actor.principalId());
    }
}
