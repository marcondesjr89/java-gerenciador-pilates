package br.com.gerenciadorpilates.students.application;

import br.com.gerenciadorpilates.students.api.CreateStudentRequest;
import br.com.gerenciadorpilates.students.api.StudentResponse;
import br.com.gerenciadorpilates.students.api.StudentSearchResponse;
import br.com.gerenciadorpilates.students.api.StudentSearchSummary;
import br.com.gerenciadorpilates.students.domain.Student;
import br.com.gerenciadorpilates.students.domain.StudentStatus;
import br.com.gerenciadorpilates.students.infrastructure.StudentRepository;
import br.com.gerenciadorpilates.platform.domain.ResourceNotFoundException;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import br.com.gerenciadorpilates.students.api.AnonymizeStudentRequest;
import br.com.gerenciadorpilates.students.domain.StudentPortalAccount;
import br.com.gerenciadorpilates.students.infrastructure.StudentPortalAccountRepository;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final StudentPortalAccountRepository portalAccountRepository;
    private final StudentActiveObligationsPort activeObligationsPort;

    public StudentService(
            StudentRepository studentRepository,
            StudentPortalAccountRepository portalAccountRepository,
            StudentActiveObligationsPort activeObligationsPort
    ) {
        this.studentRepository = studentRepository;
        this.portalAccountRepository = portalAccountRepository;
        this.activeObligationsPort = activeObligationsPort;
    }

    @Transactional
    public StudentResponse create(CreateStudentRequest request) {
        String normalizedCpf = request.cpf().replaceAll("\\D", "");

        studentRepository.findByCpf(normalizedCpf)
                .ifPresent(student -> {
                    throw new IllegalArgumentException("Ja existe um aluno com este CPF.");
                });

        Student student = new Student(
                UUID.randomUUID(),
                request.fullName().trim(),
                normalizedCpf,
                request.email().trim().toLowerCase(),
                request.phoneNumber().trim(),
                request.birthDate(),
                request.status(),
                request.lgpdConsent()
        );

        Student savedStudent = studentRepository.save(student);
        return StudentResponse.from(savedStudent);
    }

    @Transactional(readOnly = true)
    public List<StudentResponse> list() {
        return studentRepository.findAll()
                .stream()
                .map(StudentResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public StudentSearchResponse search(String query, int page, int size) {
        int normalizedPage = Math.max(page, 0);
        int normalizedSize = Math.min(Math.max(size, 1), 50);
        String normalizedQuery = query == null ? null : query.trim().toLowerCase();
        String digitsQuery = normalizedQuery == null ? null : normalizedQuery.replaceAll("\\D", "");
        var resultPage = studentRepository.search(
                normalizedQuery,
                digitsQuery,
                PageRequest.of(normalizedPage, normalizedSize)
        );

        return new StudentSearchResponse(
                resultPage.getContent().stream().map(StudentResponse::from).toList(),
                resultPage.getTotalElements(),
                resultPage.getTotalPages(),
                resultPage.getNumber(),
                resultPage.getSize(),
                new StudentSearchSummary(
                        studentRepository.count(),
                        studentRepository.countByStatus(StudentStatus.ACTIVE),
                        studentRepository.countByStatus(StudentStatus.INACTIVE),
                        studentRepository.countByLgpdConsentTrue()
                )
        );
    }

    @Transactional(readOnly = true)
    public StudentResponse getById(UUID studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Aluno nao encontrado."));
        return StudentResponse.from(student);
    }

    @Transactional
    public StudentResponse anonymize(UUID studentId, AnonymizeStudentRequest request) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Aluno nao encontrado."));

        if (student.getStatus() == StudentStatus.ANONYMIZED) {
            throw new IllegalArgumentException("Aluno ja se encontra anonimizado.");
        }

        List<String> blockingReasons = activeObligationsPort.getBlockingReasons(studentId);
        if (!blockingReasons.isEmpty()) {
            throw new IllegalArgumentException(
                    "Nao e possivel anonimizar o aluno devido a pendencias ativas: " + String.join("; ", blockingReasons)
            );
        }

        student.anonymize(request != null ? request.reason() : null);
        portalAccountRepository.findByStudentId(studentId).ifPresent(StudentPortalAccount::deactivateForAnonymization);

        Student savedStudent = studentRepository.save(student);
        return StudentResponse.from(savedStudent);
    }
}
