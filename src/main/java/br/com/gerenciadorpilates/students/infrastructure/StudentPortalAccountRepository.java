package br.com.gerenciadorpilates.students.infrastructure;

import br.com.gerenciadorpilates.students.domain.StudentPortalAccount;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentPortalAccountRepository extends JpaRepository<StudentPortalAccount, UUID> {

    Optional<StudentPortalAccount> findByStudentId(UUID studentId);

    Optional<StudentPortalAccount> findByEmailIgnoreCaseAndActiveTrue(String email);
}
