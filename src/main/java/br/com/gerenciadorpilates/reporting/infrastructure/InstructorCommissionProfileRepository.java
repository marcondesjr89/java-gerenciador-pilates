package br.com.gerenciadorpilates.reporting.infrastructure;

import br.com.gerenciadorpilates.reporting.domain.InstructorCommissionProfile;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InstructorCommissionProfileRepository extends JpaRepository<InstructorCommissionProfile, UUID> {

    Optional<InstructorCommissionProfile> findByInstructorUserId(UUID instructorUserId);

    List<InstructorCommissionProfile> findAllByActiveTrueOrderByInstructorNameAsc();
}
