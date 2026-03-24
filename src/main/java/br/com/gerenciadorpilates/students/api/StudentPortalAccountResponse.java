package br.com.gerenciadorpilates.students.api;

import br.com.gerenciadorpilates.students.domain.StudentPortalAccount;
import java.util.UUID;

public record StudentPortalAccountResponse(
        UUID id,
        UUID studentId,
        String email,
        boolean active
) {

    public static StudentPortalAccountResponse from(StudentPortalAccount account) {
        return new StudentPortalAccountResponse(
                account.getId(),
                account.getStudentId(),
                account.getEmail(),
                account.isActive()
        );
    }
}
