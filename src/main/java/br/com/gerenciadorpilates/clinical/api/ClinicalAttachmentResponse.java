package br.com.gerenciadorpilates.clinical.api;

import br.com.gerenciadorpilates.clinical.domain.ClinicalAttachment;
import java.time.OffsetDateTime;
import java.util.UUID;

public record ClinicalAttachmentResponse(
        UUID id,
        UUID studentId,
        UUID progressEntryId,
        String originalFileName,
        String contentType,
        long fileSize,
        UUID uploadedByUserId,
        String uploadedByUserName,
        OffsetDateTime createdAt
) {

    public static ClinicalAttachmentResponse from(ClinicalAttachment attachment) {
        return new ClinicalAttachmentResponse(
                attachment.getId(),
                attachment.getStudentId(),
                attachment.getProgressEntryId(),
                attachment.getOriginalFileName(),
                attachment.getContentType(),
                attachment.getFileSize(),
                attachment.getUploadedByUserId(),
                attachment.getUploadedByUserName(),
                attachment.getCreatedAt()
        );
    }
}
