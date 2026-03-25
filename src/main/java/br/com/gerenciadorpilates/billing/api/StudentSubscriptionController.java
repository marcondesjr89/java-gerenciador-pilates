package br.com.gerenciadorpilates.billing.api;

import br.com.gerenciadorpilates.billing.application.StudentSubscriptionService;
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
@RequestMapping("/api/v1/billing/subscriptions")
public class StudentSubscriptionController {

    private final StudentSubscriptionService subscriptionService;

    public StudentSubscriptionController(StudentSubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StudentSubscriptionResponse create(@Valid @RequestBody CreateStudentSubscriptionRequest request) {
        return subscriptionService.create(request);
    }

    @GetMapping("/student/{studentId}")
    public List<StudentSubscriptionResponse> listByStudent(@PathVariable UUID studentId) {
        return subscriptionService.listByStudent(studentId);
    }
}
