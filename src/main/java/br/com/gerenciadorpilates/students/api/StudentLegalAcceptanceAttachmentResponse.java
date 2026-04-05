package br.com.gerenciadorpilates.students.api;

import br.com.gerenciadorpilates.students.domain.StudentLegalAcceptanceAttachment;
import br.com.gerenciadorpilates.students.domain.StudentLegalAcceptanceAttachmentType;
import java.time.OffsetDateTime;
import java.util.UUID;

public record StudentLegalAcceptanceAttachmentResponse(
        UUID id,
        UUID studentId,
        UUID legalAcceptanceId,
        StudentLegalAcceptanceAttachmentType attachmentType,
        String originalFileName,
        String contentType,
        long fileSize,
        UUID uploadedByUserId,
        String uploadedByUserName,
        OffsetDateTime createdAt
) {

    public static StudentLegalAcceptanceAttachmentResponse from(StudentLegalAcceptanceAttachment attachment) {
        return new StudentLegalAcceptanceAttachmentResponse(
                attachment.getId(),
                attachment.getStudentId(),
                attachment.getLegalAcceptanceId(),
                attachment.getAttachmentType(),
                attachment.getOriginalFileName(),
                attachment.getContentType(),
                attachment.getFileSize(),
                attachment.getUploadedByUserId(),
                attachment.getUploadedByUserName(),
                attachment.getCreatedAt()
        );
    }
}
