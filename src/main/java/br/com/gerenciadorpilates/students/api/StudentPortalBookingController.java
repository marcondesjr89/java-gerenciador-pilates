package br.com.gerenciadorpilates.students.api;

import br.com.gerenciadorpilates.platform.security.AuthenticatedActor;
import br.com.gerenciadorpilates.platform.security.SecurityActorUtils;
import br.com.gerenciadorpilates.scheduling.api.ScheduleBookingResponse;
import br.com.gerenciadorpilates.scheduling.application.ScheduleBookingService;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/student-portal/me/bookings")
public class StudentPortalBookingController {

    private final ScheduleBookingService bookingService;

    public StudentPortalBookingController(ScheduleBookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public List<StudentPortalBookingSummaryResponse> myBookings(Authentication authentication) {
        AuthenticatedActor actor = SecurityActorUtils.requireActor(authentication);
        return bookingService.listPortalBookings(actor.principalId());
    }

    @PostMapping("/{bookingId}/cancel")
    public ScheduleBookingResponse cancelMyBooking(
            @PathVariable UUID bookingId,
            Authentication authentication
    ) {
        AuthenticatedActor actor = SecurityActorUtils.requireActor(authentication);
        return bookingService.selfServiceCancelByBookingId(bookingId, actor.principalId());
    }
}
