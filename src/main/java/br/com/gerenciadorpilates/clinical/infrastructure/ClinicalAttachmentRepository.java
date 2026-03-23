package br.com.gerenciadorpilates.clinical.infrastructure;

import br.com.gerenciadorpilates.clinical.domain.ClinicalAttachment;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClinicalAttachmentRepository extends JpaRepository<ClinicalAttachment, UUID> {

    List<ClinicalAttachment> findAllByProgressEntryIdOrderByCreatedAtAsc(UUID progressEntryId);

    List<ClinicalAttachment> findAllByProgressEntryIdIn(Collection<UUID> progressEntryIds);

    Optional<ClinicalAttachment> findByIdAndStudentIdAndProgressEntryId(UUID id, UUID studentId, UUID progressEntryId);
}
