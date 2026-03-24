package br.com.gerenciadorpilates.identityaccess.api;

import br.com.gerenciadorpilates.identityaccess.domain.InstructorSpecialty;
import br.com.gerenciadorpilates.identityaccess.domain.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.Set;

public record CreateUserRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(max = 255) String fullName,
        @NotBlank @Size(min = 8, max = 72) String password,
        @NotNull UserRole role,
        Set<InstructorSpecialty> specialties
) {
}
