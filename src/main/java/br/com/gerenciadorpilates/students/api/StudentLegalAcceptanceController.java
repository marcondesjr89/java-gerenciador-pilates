package br.com.gerenciadorpilates.students.api;

import br.com.gerenciadorpilates.students.application.StudentLegalAcceptanceService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/students/{studentId}/legal-acceptances")
public class StudentLegalAcceptanceController {

    private final StudentLegalAcceptanceService studentLegalAcceptanceService;

    public StudentLegalAcceptanceController(StudentLegalAcceptanceService studentLegalAcceptanceService) {
        this.studentLegalAcceptanceService = studentLegalAcceptanceService;
    }

    @GetMapping
    public List<StudentLegalAcceptanceResponse> list(@PathVariable UUID studentId) {
        return studentLegalAcceptanceService.listByStudent(studentId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StudentLegalAcceptanceResponse register(
            @PathVariable UUID studentId,
            @Valid @RequestBody RegisterStudentLegalAcceptanceRequest request,
            Authentication authentication
    ) {
        return studentLegalAcceptanceService.register(studentId, authentication, request);
    }
}
