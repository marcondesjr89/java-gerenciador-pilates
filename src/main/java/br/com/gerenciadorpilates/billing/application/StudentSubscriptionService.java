package br.com.gerenciadorpilates.billing.application;

import br.com.gerenciadorpilates.billing.api.CreateStudentSubscriptionRequest;
import br.com.gerenciadorpilates.billing.api.StudentSubscriptionResponse;
import br.com.gerenciadorpilates.billing.domain.BillingPlan;
import br.com.gerenciadorpilates.billing.domain.StudentSubscription;
import br.com.gerenciadorpilates.billing.domain.SubscriptionStatus;
import br.com.gerenciadorpilates.billing.infrastructure.BillingPlanRepository;
import br.com.gerenciadorpilates.billing.infrastructure.StudentSubscriptionRepository;
import br.com.gerenciadorpilates.platform.domain.ResourceNotFoundException;
import br.com.gerenciadorpilates.students.domain.Student;
import br.com.gerenciadorpilates.students.infrastructure.StudentRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StudentSubscriptionService {

    private final StudentSubscriptionRepository subscriptionRepository;
    private final StudentRepository studentRepository;
    private final BillingPlanRepository planRepository;

    public StudentSubscriptionService(
            StudentSubscriptionRepository subscriptionRepository,
            StudentRepository studentRepository,
            BillingPlanRepository planRepository
    ) {
        this.subscriptionRepository = subscriptionRepository;
        this.studentRepository = studentRepository;
        this.planRepository = planRepository;
    }

    @Transactional
    public StudentSubscriptionResponse create(CreateStudentSubscriptionRequest request) {
        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> new ResourceNotFoundException("Aluno nao encontrado."));
        BillingPlan plan = planRepository.findById(request.planId())
                .orElseThrow(() -> new ResourceNotFoundException("Plano nao encontrado."));

        if (!plan.isActive()) {
            throw new IllegalArgumentException("Nao e possivel assinar um plano inativo.");
        }

        subscriptionRepository.findByStudentIdAndStatus(request.studentId(), SubscriptionStatus.ACTIVE)
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("O aluno ja possui uma assinatura ativa.");
                });

        StudentSubscription subscription = new StudentSubscription(
                UUID.randomUUID(),
                student.getId(),
                student.getFullName(),
                plan.getId(),
                plan.getName(),
                request.startDate(),
                request.startDate()
        );
        return StudentSubscriptionResponse.from(subscriptionRepository.save(subscription));
    }

    @Transactional(readOnly = true)
    public List<StudentSubscriptionResponse> listByStudent(UUID studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Aluno nao encontrado.");
        }
        return subscriptionRepository.findAllByStudentIdOrderByStartDateDesc(studentId)
                .stream()
                .map(StudentSubscriptionResponse::from)
                .toList();
    }
}
