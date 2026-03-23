package br.com.gerenciadorpilates.clinical.api;

import br.com.gerenciadorpilates.clinical.domain.StudentProgressEntry;
import java.time.OffsetDateTime;
import java.util.UUID;

public record StudentProgressEntryResponse(
        UUID id,
        UUID studentId,
        OffsetDateTime recordedAt,
        String instructorNotes,
        Integer flexibilityScore,
        Integer strengthScore,
        Integer painLevel,
        UUID createdByUserId,
        String createdByUserName,
        OffsetDateTime createdAt
) {

    public static StudentProgressEntryResponse from(StudentProgressEntry entry) {
        return new StudentProgressEntryResponse(
                entry.getId(),
                entry.getStudentId(),
                entry.getRecordedAt(),
                entry.getInstructorNotes(),
                entry.getFlexibilityScore(),
                entry.getStrengthScore(),
                entry.getPainLevel(),
                entry.getCreatedByUserId(),
                entry.getCreatedByUserName(),
                entry.getCreatedAt()
        );
    }
}
