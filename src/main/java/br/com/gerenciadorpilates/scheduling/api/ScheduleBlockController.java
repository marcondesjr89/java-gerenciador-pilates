package br.com.gerenciadorpilates.scheduling.api;

import br.com.gerenciadorpilates.scheduling.application.ScheduleBlockService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/schedule-blocks")
public class ScheduleBlockController {

    private final ScheduleBlockService blockService;

    public ScheduleBlockController(ScheduleBlockService blockService) {
        this.blockService = blockService;
    }

    @GetMapping
    public List<ScheduleBlockResponse> listByDate(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return blockService.listByDate(date);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ScheduleBlockResponse create(@Valid @RequestBody CreateScheduleBlockRequest request) {
        return blockService.create(request);
    }

    @PutMapping("/{blockId}")
    public ScheduleBlockResponse update(
            @PathVariable UUID blockId,
            @Valid @RequestBody CreateScheduleBlockRequest request
    ) {
        return blockService.update(blockId, request);
    }

    @DeleteMapping("/{blockId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID blockId) {
        blockService.delete(blockId);
    }
}
