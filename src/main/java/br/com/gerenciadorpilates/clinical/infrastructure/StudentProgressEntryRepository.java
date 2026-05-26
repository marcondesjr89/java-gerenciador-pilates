package br.com.gerenciadorpilates.clinical.infrastructure;

import br.com.gerenciadorpilates.clinical.domain.StudentProgressEntry;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StudentProgressEntryRepository extends JpaRepository<StudentProgressEntry, UUID> {

    List<StudentProgressEntry> findAllByStudentIdOrderByRecordedAtDesc(UUID studentId);

    @Query("""
            select entry
            from StudentProgressEntry entry
            where entry.studentId in :studentIds
              and entry.recordedAt = (
                select max(latest.recordedAt)
                from StudentProgressEntry latest
                where latest.studentId = entry.studentId
              )
            """)
    List<StudentProgressEntry> findLatestByStudentIds(@Param("studentIds") Collection<UUID> studentIds);
}
