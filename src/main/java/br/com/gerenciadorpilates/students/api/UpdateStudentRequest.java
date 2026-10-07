package br.com.gerenciadorpilates.students.api;

import br.com.gerenciadorpilates.students.domain.StudentStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record UpdateStudentRequest(
        @NotBlank @Size(max = 255) String fullName,
        @NotBlank @Email String email,
        @NotBlank @Size(max = 20) String phoneNumber,
        @Past LocalDate birthDate,
        @NotNull StudentStatus status
) {
}
