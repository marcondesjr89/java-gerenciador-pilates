package br.com.gerenciadorpilates.scheduling.infrastructure;

import br.com.gerenciadorpilates.scheduling.domain.ScheduleSlot;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ScheduleSlotRepository extends JpaRepository<ScheduleSlot, UUID> {

    @Query("""
            select slot from ScheduleSlot slot
            where slot.instructorUserId = :instructorUserId
              and slot.startTime < :endTime
              and slot.endTime > :startTime
            """)
    List<ScheduleSlot> findOverlappingSlots(
            @Param("instructorUserId") UUID instructorUserId,
            @Param("startTime") OffsetDateTime startTime,
            @Param("endTime") OffsetDateTime endTime
    );

    List<ScheduleSlot> findAllByStartTimeBetweenOrderByStartTimeAsc(OffsetDateTime start, OffsetDateTime end);
}
