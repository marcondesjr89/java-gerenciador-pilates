package br.com.gerenciadorpilates.students.api;

import jakarta.validation.constraints.Size;

public record AnonymizeStudentRequest(
        @Size(max = 500, message = "O motivo da anonimizacao deve ter no maximo 500 caracteres.")
        String reason
) {
}
