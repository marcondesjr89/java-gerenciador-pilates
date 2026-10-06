package br.com.gerenciadorpilates.notifications.api;

import br.com.gerenciadorpilates.notifications.application.NotificationOutboxService;
import br.com.gerenciadorpilates.notifications.domain.NotificationStatus;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notifications/outbox")
public class NotificationOutboxController {

    private final NotificationOutboxService outboxService;

    public NotificationOutboxController(NotificationOutboxService outboxService) {
        this.outboxService = outboxService;
    }

    @GetMapping
    public List<NotificationOutboxEntryResponse> list(
            @RequestParam(value = "status", required = false) NotificationStatus status
    ) {
        return outboxService.list(status)
                .stream()
                .map(NotificationOutboxEntryResponse::from)
                .toList();
    }

    @GetMapping("/summary")
    public NotificationOutboxSummaryResponse summary() {
        return outboxService.getSummary();
    }

    @org.springframework.web.bind.annotation.PostMapping("/{id}/retry")
    public NotificationOutboxEntryResponse retry(@org.springframework.web.bind.annotation.PathVariable java.util.UUID id) {
        return NotificationOutboxEntryResponse.from(outboxService.retry(id));
    }

    @org.springframework.web.bind.annotation.PostMapping("/process")
    public java.util.Map<String, Integer> process() {
        int processed = outboxService.processNow();
        return java.util.Map.of("processed", processed);
    }
}
