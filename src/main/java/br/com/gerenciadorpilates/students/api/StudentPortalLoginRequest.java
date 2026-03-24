package br.com.gerenciadorpilates.students.api;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record StudentPortalLoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password
) {
}
