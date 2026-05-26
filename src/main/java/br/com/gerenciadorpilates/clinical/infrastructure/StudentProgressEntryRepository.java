package br.com.gerenciadorpilates.clinical.infrastructure;

import br.com.gerenciadorpilates.clinical.domain.StudentProgressEntry;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentProgressEntryRepository extends JpaRepository<StudentProgressEntry, UUID> {

    List<StudentProgressEntry> findAllByStudentIdOrderByRecordedAtDesc(UUID studentId);

    List<StudentProgressEntry> findAllByStudentIdInOrderByStudentIdAscRecordedAtDesc(Collection<UUID> studentIds);
}
