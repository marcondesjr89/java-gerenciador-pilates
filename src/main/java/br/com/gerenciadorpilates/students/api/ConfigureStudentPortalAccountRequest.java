package br.com.gerenciadorpilates.students.api;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ConfigureStudentPortalAccountRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 72) String password
) {
}
