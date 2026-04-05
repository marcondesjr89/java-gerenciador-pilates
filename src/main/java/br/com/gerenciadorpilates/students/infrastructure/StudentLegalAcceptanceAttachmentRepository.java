package br.com.gerenciadorpilates.students.infrastructure;

import br.com.gerenciadorpilates.students.domain.StudentLegalAcceptanceAttachment;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentLegalAcceptanceAttachmentRepository extends JpaRepository<StudentLegalAcceptanceAttachment, UUID> {

    List<StudentLegalAcceptanceAttachment> findAllByLegalAcceptanceIdOrderByCreatedAtAsc(UUID legalAcceptanceId);

    List<StudentLegalAcceptanceAttachment> findAllByLegalAcceptanceIdInOrderByCreatedAtAsc(Collection<UUID> legalAcceptanceIds);

    Optional<StudentLegalAcceptanceAttachment> findByIdAndStudentIdAndLegalAcceptanceId(
            UUID id,
            UUID studentId,
            UUID legalAcceptanceId
    );
}
