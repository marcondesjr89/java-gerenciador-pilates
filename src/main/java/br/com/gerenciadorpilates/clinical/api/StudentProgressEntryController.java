package br.com.gerenciadorpilates.clinical.api;

import br.com.gerenciadorpilates.clinical.application.StudentProgressEntryService;
import jakarta.validation.Valid;
import java.security.Principal;
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
@RequestMapping("/api/v1/students/{studentId}/progress-entries")
public class StudentProgressEntryController {

    private final StudentProgressEntryService progressEntryService;

    public StudentProgressEntryController(StudentProgressEntryService progressEntryService) {
        this.progressEntryService = progressEntryService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StudentProgressEntryResponse create(
            @PathVariable UUID studentId,
            @Valid @RequestBody CreateStudentProgressEntryRequest request,
            Principal principal
    ) {
        return progressEntryService.create(studentId, principal.getName(), request);
    }

    @GetMapping
    public List<StudentProgressEntryResponse> list(@PathVariable UUID studentId) {
        return progressEntryService.listByStudentId(studentId);
    }
}
