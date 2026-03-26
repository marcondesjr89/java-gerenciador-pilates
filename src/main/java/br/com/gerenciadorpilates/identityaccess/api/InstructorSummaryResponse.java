package br.com.gerenciadorpilates.identityaccess.api;

import br.com.gerenciadorpilates.identityaccess.domain.AppUser;
import br.com.gerenciadorpilates.identityaccess.domain.InstructorSpecialty;
import java.util.Set;
import java.util.UUID;

public record InstructorSummaryResponse(
        UUID id,
        String fullName,
        Set<InstructorSpecialty> specialties
) {

    public static InstructorSummaryResponse from(AppUser user) {
        return new InstructorSummaryResponse(
                user.getId(),
                user.getFullName(),
                user.getSpecialties()
        );
    }
}
