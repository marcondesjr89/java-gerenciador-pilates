package br.com.gerenciadorpilates.identityaccess.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangeUserPasswordRequest(
        @NotBlank @Size(min = 8, max = 72) String newPassword
) {
}
