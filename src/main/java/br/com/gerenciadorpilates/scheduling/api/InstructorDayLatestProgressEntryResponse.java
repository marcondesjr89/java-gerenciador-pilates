package br.com.gerenciadorpilates.scheduling.api;

import br.com.gerenciadorpilates.clinical.domain.StudentProgressEntry;
import java.time.OffsetDateTime;
import java.util.UUID;

public record InstructorDayLatestProgressEntryResponse(
        UUID id,
        OffsetDateTime recordedAt,
        String instructorNotes,
        Integer flexibilityScore,
        Integer strengthScore,
        Integer painLevel
) {

    public static InstructorDayLatestProgressEntryResponse from(StudentProgressEntry entry) {
        return new InstructorDayLatestProgressEntryResponse(
                entry.getId(),
                entry.getRecordedAt(),
                entry.getInstructorNotes(),
                entry.getFlexibilityScore(),
                entry.getStrengthScore(),
                entry.getPainLevel()
        );
    }
}
