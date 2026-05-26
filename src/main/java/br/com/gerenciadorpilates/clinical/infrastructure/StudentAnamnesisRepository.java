package br.com.gerenciadorpilates.clinical.infrastructure;

import br.com.gerenciadorpilates.clinical.domain.StudentAnamnesis;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentAnamnesisRepository extends JpaRepository<StudentAnamnesis, UUID> {

    Optional<StudentAnamnesis> findByStudentId(UUID studentId);

    List<StudentAnamnesis> findAllByStudentIdIn(Collection<UUID> studentIds);
}
