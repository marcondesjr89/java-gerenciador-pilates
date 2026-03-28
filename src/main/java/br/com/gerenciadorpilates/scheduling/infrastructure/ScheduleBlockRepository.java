package br.com.gerenciadorpilates.scheduling.infrastructure;

import br.com.gerenciadorpilates.scheduling.domain.ScheduleBlock;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ScheduleBlockRepository extends JpaRepository<ScheduleBlock, UUID> {

    @Query("""
            select block from ScheduleBlock block
            where block.instructorUserId = :instructorUserId
              and block.startTime < :endTime
              and block.endTime > :startTime
            """)
    List<ScheduleBlock> findOverlappingBlocks(
            @Param("instructorUserId") UUID instructorUserId,
            @Param("startTime") OffsetDateTime startTime,
            @Param("endTime") OffsetDateTime endTime
    );

    List<ScheduleBlock> findAllByStartTimeBetweenOrderByStartTimeAsc(OffsetDateTime startTime, OffsetDateTime endTime);
}
