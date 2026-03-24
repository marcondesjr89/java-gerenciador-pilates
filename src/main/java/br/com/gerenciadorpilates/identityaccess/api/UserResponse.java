package br.com.gerenciadorpilates.identityaccess.api;

import br.com.gerenciadorpilates.identityaccess.domain.InstructorSpecialty;
import br.com.gerenciadorpilates.identityaccess.domain.AppUser;
import br.com.gerenciadorpilates.identityaccess.domain.UserRole;
import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String email,
        String fullName,
        UserRole role,
        Set<InstructorSpecialty> specialties,
        boolean active,
        OffsetDateTime createdAt
) {

    public static UserResponse from(AppUser user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getSpecialties(),
                user.isActive(),
                user.getCreatedAt()
        );
    }
}
