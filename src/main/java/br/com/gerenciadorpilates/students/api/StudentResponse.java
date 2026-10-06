package br.com.gerenciadorpilates.students.api;

import br.com.gerenciadorpilates.students.domain.Student;
import br.com.gerenciadorpilates.students.domain.StudentStatus;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record StudentResponse(
        UUID id,
        String fullName,
        String cpf,
        String email,
        String phoneNumber,
        LocalDate birthDate,
        StudentStatus status,
        boolean lgpdConsent,
        OffsetDateTime createdAt,
        OffsetDateTime anonymizedAt,
        String anonymizedReason
) {

    public StudentResponse(
            UUID id,
            String fullName,
            String cpf,
            String email,
            String phoneNumber,
            LocalDate birthDate,
            StudentStatus status,
            boolean lgpdConsent,
            OffsetDateTime createdAt
    ) {
        this(id, fullName, cpf, email, phoneNumber, birthDate, status, lgpdConsent, createdAt, null, null);
    }

    public static StudentResponse from(Student student) {
        return new StudentResponse(
                student.getId(),
                student.getFullName(),
                student.getCpf(),
                student.getEmail(),
                student.getPhoneNumber(),
                student.getBirthDate(),
                student.getStatus(),
                student.isLgpdConsent(),
                student.getCreatedAt(),
                student.getAnonymizedAt(),
                student.getAnonymizedReason()
        );
    }
}
