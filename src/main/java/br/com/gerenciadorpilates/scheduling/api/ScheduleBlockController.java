package br.com.gerenciadorpilates.scheduling.api;

import br.com.gerenciadorpilates.scheduling.application.ScheduleBlockService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/schedule-blocks")
public class ScheduleBlockController {

    private final ScheduleBlockService blockService;

    public ScheduleBlockController(ScheduleBlockService blockService) {
        this.blockService = blockService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ScheduleBlockResponse create(@Valid @RequestBody CreateScheduleBlockRequest request) {
        return blockService.create(request);
    }
}
