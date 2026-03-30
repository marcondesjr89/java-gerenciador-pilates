package br.com.gerenciadorpilates.students.api;

import br.com.gerenciadorpilates.students.application.StudentPortalAccountService;
import jakarta.validation.Valid;
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
@RequestMapping("/api/v1/students/{studentId}/portal-account")
public class StudentPortalAccountController {

    private final StudentPortalAccountService portalAccountService;

    public StudentPortalAccountController(StudentPortalAccountService portalAccountService) {
        this.portalAccountService = portalAccountService;
    }

    @GetMapping
    public StudentPortalAccountResponse getByStudentId(@PathVariable UUID studentId) {
        return portalAccountService.getByStudentId(studentId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StudentPortalAccountResponse configure(
            @PathVariable UUID studentId,
            @Valid @RequestBody ConfigureStudentPortalAccountRequest request
    ) {
        return portalAccountService.configure(studentId, request);
    }
}
