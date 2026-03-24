package br.com.gerenciadorpilates.scheduling.api;

import br.com.gerenciadorpilates.scheduling.domain.ScheduleWaitlistEntry;
import br.com.gerenciadorpilates.scheduling.domain.WaitlistStatus;
import java.time.OffsetDateTime;
import java.util.UUID;

public record WaitlistEntryResponse(
        UUID id,
        UUID slotId,
        UUID studentId,
        String studentName,
        WaitlistStatus status,
        OffsetDateTime promotedAt
) {

    public static WaitlistEntryResponse from(ScheduleWaitlistEntry entry) {
        return new WaitlistEntryResponse(
                entry.getId(),
                entry.getSlotId(),
                entry.getStudentId(),
                entry.getStudentName(),
                entry.getStatus(),
                entry.getPromotedAt()
        );
    }
}
