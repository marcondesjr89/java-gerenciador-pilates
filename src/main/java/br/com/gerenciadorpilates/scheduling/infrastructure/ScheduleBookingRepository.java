package br.com.gerenciadorpilates.scheduling.infrastructure;

import br.com.gerenciadorpilates.scheduling.domain.ScheduleBooking;
import br.com.gerenciadorpilates.scheduling.domain.ScheduleBookingStatus;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScheduleBookingRepository extends JpaRepository<ScheduleBooking, UUID> {

    long countBySlotIdAndStatus(UUID slotId, ScheduleBookingStatus status);

    Optional<ScheduleBooking> findBySlotIdAndStudentIdAndStatus(UUID slotId, UUID studentId, ScheduleBookingStatus status);

    List<ScheduleBooking> findAllBySlotIdAndStatusOrderByCreatedAtAsc(UUID slotId, ScheduleBookingStatus status);

    List<ScheduleBooking> findAllBySlotIdInAndStatusOrderByCreatedAtAsc(
            Collection<UUID> slotIds,
            ScheduleBookingStatus status
    );

    List<ScheduleBooking> findAllByStudentIdAndStatusOrderByCreatedAtDesc(UUID studentId, ScheduleBookingStatus status);

    long countBySlotIdInAndStatus(Collection<UUID> slotIds, ScheduleBookingStatus status);
}
