package br.com.gerenciadorpilates.clinical.api;

import br.com.gerenciadorpilates.clinical.application.StudentAnamnesisService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/students/{studentId}/anamnesis")
public class StudentAnamnesisController {

    private final StudentAnamnesisService anamnesisService;

    public StudentAnamnesisController(StudentAnamnesisService anamnesisService) {
        this.anamnesisService = anamnesisService;
    }

    @PutMapping
    public StudentAnamnesisResponse upsert(
            @PathVariable UUID studentId,
            @Valid @RequestBody UpsertStudentAnamnesisRequest request
    ) {
        return anamnesisService.upsert(studentId, request);
    }

    @GetMapping
    public StudentAnamnesisResponse getByStudentId(@PathVariable UUID studentId) {
        return anamnesisService.getByStudentId(studentId);
    }
}
