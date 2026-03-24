package br.com.gerenciadorpilates.scheduling.api;

import br.com.gerenciadorpilates.scheduling.application.ScheduleWaitlistService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/schedule-slots/{slotId}/waitlist")
public class ScheduleWaitlistController {

    private final ScheduleWaitlistService waitlistService;

    public ScheduleWaitlistController(ScheduleWaitlistService waitlistService) {
        this.waitlistService = waitlistService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WaitlistEntryResponse join(
            @PathVariable UUID slotId,
            @Valid @RequestBody CreateWaitlistEntryRequest request
    ) {
        return waitlistService.join(slotId, request.studentId());
    }

    @GetMapping
    public List<WaitlistEntryResponse> list(@PathVariable UUID slotId) {
        return waitlistService.listBySlot(slotId);
    }
}
