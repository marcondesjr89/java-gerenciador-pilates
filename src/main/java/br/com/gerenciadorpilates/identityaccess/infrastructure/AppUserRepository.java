package br.com.gerenciadorpilates.identityaccess.infrastructure;

import br.com.gerenciadorpilates.identityaccess.domain.AppUser;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppUserRepository extends JpaRepository<AppUser, UUID> {

    Optional<AppUser> findByEmailIgnoreCase(String email);

    Optional<AppUser> findByEmailIgnoreCaseAndActiveTrue(String email);
}
