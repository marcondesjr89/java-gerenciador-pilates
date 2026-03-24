package br.com.gerenciadorpilates.scheduling.api;

import br.com.gerenciadorpilates.scheduling.domain.ScheduleBlock;
import java.time.OffsetDateTime;
import java.util.UUID;

public record ScheduleBlockResponse(
        UUID id,
        UUID instructorUserId,
        String instructorName,
        OffsetDateTime startTime,
        OffsetDateTime endTime,
        String reason
) {

    public static ScheduleBlockResponse from(ScheduleBlock block) {
        return new ScheduleBlockResponse(
                block.getId(),
                block.getInstructorUserId(),
                block.getInstructorName(),
                block.getStartTime(),
                block.getEndTime(),
                block.getReason()
        );
    }
}
