package br.com.gerenciadorpilates.students.api;

import br.com.gerenciadorpilates.students.domain.StudentStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import org.hibernate.validator.constraints.br.CPF;

public record CreateStudentRequest(
        @NotBlank(message = "Nome completo e obrigatorio") @Size(max = 255, message = "Nome completo excede 255 caracteres") String fullName,
        @NotBlank(message = "CPF e obrigatorio") @CPF(message = "CPF invalido (digitos verificadores incorretos)") String cpf,
        @NotBlank(message = "E-mail e obrigatorio") @Email(message = "E-mail invalido") String email,
        @NotBlank(message = "Telefone e obrigatorio") @Size(max = 20, message = "Telefone excede 20 caracteres") String phoneNumber,
        @Past(message = "Data de nascimento deve ser no passado") LocalDate birthDate,
        @NotNull(message = "Status e obrigatorio") StudentStatus status,
        boolean lgpdConsent
) {
}
