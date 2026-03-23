package br.com.gerenciadorpilates.scheduling.api;

import br.com.gerenciadorpilates.scheduling.application.ScheduleSlotService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/schedule-slots")
public class ScheduleSlotController {

    private final ScheduleSlotService slotService;

    public ScheduleSlotController(ScheduleSlotService slotService) {
        this.slotService = slotService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ScheduleSlotResponse create(@Valid @RequestBody CreateScheduleSlotRequest request) {
        return slotService.create(request);
    }

    @GetMapping
    public List<ScheduleSlotResponse> listByDate(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return slotService.listByDate(date);
    }
}
