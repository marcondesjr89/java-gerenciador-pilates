package br.com.gerenciadorpilates.clinical.api;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record StudentProgressEntryWithAttachmentsResponse(
        UUID id,
        UUID studentId,
        OffsetDateTime recordedAt,
        String instructorNotes,
        Integer flexibilityScore,
        Integer strengthScore,
        Integer painLevel,
        UUID createdByUserId,
        String createdByUserName,
        OffsetDateTime createdAt,
        List<ClinicalAttachmentResponse> attachments
) {

    public static StudentProgressEntryWithAttachmentsResponse from(
            StudentProgressEntryResponse progressEntry,
            List<ClinicalAttachmentResponse> attachments
    ) {
        return new StudentProgressEntryWithAttachmentsResponse(
                progressEntry.id(),
                progressEntry.studentId(),
                progressEntry.recordedAt(),
                progressEntry.instructorNotes(),
                progressEntry.flexibilityScore(),
                progressEntry.strengthScore(),
                progressEntry.painLevel(),
                progressEntry.createdByUserId(),
                progressEntry.createdByUserName(),
                progressEntry.createdAt(),
                attachments
        );
    }
}
