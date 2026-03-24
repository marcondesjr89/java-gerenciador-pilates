package br.com.gerenciadorpilates.scheduling.infrastructure;

import br.com.gerenciadorpilates.scheduling.domain.ScheduleWaitlistEntry;
import br.com.gerenciadorpilates.scheduling.domain.WaitlistStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScheduleWaitlistEntryRepository extends JpaRepository<ScheduleWaitlistEntry, UUID> {

    Optional<ScheduleWaitlistEntry> findFirstBySlotIdAndStatusOrderByCreatedAtAsc(UUID slotId, WaitlistStatus status);

    Optional<ScheduleWaitlistEntry> findBySlotIdAndStudentIdAndStatus(UUID slotId, UUID studentId, WaitlistStatus status);

    List<ScheduleWaitlistEntry> findAllBySlotIdAndStatusOrderByCreatedAtAsc(UUID slotId, WaitlistStatus status);
}
