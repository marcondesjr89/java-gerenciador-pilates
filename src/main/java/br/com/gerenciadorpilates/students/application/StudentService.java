package br.com.gerenciadorpilates.students.application;

import br.com.gerenciadorpilates.students.api.CreateStudentRequest;
import br.com.gerenciadorpilates.students.api.StudentResponse;
import br.com.gerenciadorpilates.students.domain.Student;
import br.com.gerenciadorpilates.students.infrastructure.StudentRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
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
}
