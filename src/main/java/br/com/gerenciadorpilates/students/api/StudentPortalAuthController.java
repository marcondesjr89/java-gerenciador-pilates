package br.com.gerenciadorpilates.students.api;

import br.com.gerenciadorpilates.students.application.StudentPortalAccountService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/student-portal/auth")
public class StudentPortalAuthController {

    private final StudentPortalAccountService portalAccountService;

    public StudentPortalAuthController(StudentPortalAccountService portalAccountService) {
        this.portalAccountService = portalAccountService;
    }

    @PostMapping("/login")
    public StudentPortalLoginResponse login(@Valid @RequestBody StudentPortalLoginRequest request) {
        return portalAccountService.login(request);
    }
}
