package br.com.gerenciadorpilates.students.application;

import br.com.gerenciadorpilates.platform.domain.ResourceNotFoundException;
import br.com.gerenciadorpilates.platform.security.AuthenticatedActor;
import br.com.gerenciadorpilates.platform.storage.ClinicalAttachmentStorage;
import br.com.gerenciadorpilates.platform.storage.ClinicalAttachmentStorageProperties;
import br.com.gerenciadorpilates.platform.storage.StoredFile;
import br.com.gerenciadorpilates.students.api.StudentLegalAcceptanceAttachmentResponse;
import br.com.gerenciadorpilates.students.domain.StudentLegalAcceptance;
import br.com.gerenciadorpilates.students.domain.StudentLegalAcceptanceAttachment;
import br.com.gerenciadorpilates.students.domain.StudentLegalAcceptanceAttachmentType;
import br.com.gerenciadorpilates.students.infrastructure.StudentLegalAcceptanceAttachmentRepository;
import br.com.gerenciadorpilates.students.infrastructure.StudentLegalAcceptanceRepository;
import br.com.gerenciadorpilates.students.infrastructure.StudentRepository;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class StudentLegalAcceptanceAttachmentService {

    private final StudentRepository studentRepository;
    private final StudentLegalAcceptanceRepository legalAcceptanceRepository;
    private final StudentLegalAcceptanceAttachmentRepository attachmentRepository;
    private final ClinicalAttachmentStorage storage;
    private final ClinicalAttachmentStorageProperties storageProperties;

    public StudentLegalAcceptanceAttachmentService(
            StudentRepository studentRepository,
            StudentLegalAcceptanceRepository legalAcceptanceRepository,
            StudentLegalAcceptanceAttachmentRepository attachmentRepository,
            ClinicalAttachmentStorage storage,
            ClinicalAttachmentStorageProperties storageProperties
    ) {
        this.studentRepository = studentRepository;
        this.legalAcceptanceRepository = legalAcceptanceRepository;
        this.attachmentRepository = attachmentRepository;
        this.storage = storage;
        this.storageProperties = storageProperties;
    }

    @Transactional(readOnly = true)
    public List<StudentLegalAcceptanceAttachmentResponse> listByAcceptance(UUID studentId, UUID legalAcceptanceId) {
        ensureAcceptanceBelongsToStudent(studentId, legalAcceptanceId);
        return attachmentRepository.findAllByLegalAcceptanceIdOrderByCreatedAtAsc(legalAcceptanceId)
                .stream()
                .map(StudentLegalAcceptanceAttachmentResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<UUID, List<StudentLegalAcceptanceAttachmentResponse>> listByAcceptances(Collection<UUID> legalAcceptanceIds) {
        if (legalAcceptanceIds.isEmpty()) {
            return Map.of();
        }

        return attachmentRepository.findAllByLegalAcceptanceIdInOrderByCreatedAtAsc(legalAcceptanceIds)
                .stream()
                .map(StudentLegalAcceptanceAttachmentResponse::from)
                .collect(Collectors.groupingBy(
                        StudentLegalAcceptanceAttachmentResponse::legalAcceptanceId,
                        Collectors.toList()
                ));
    }

    @Transactional
    public List<StudentLegalAcceptanceAttachmentResponse> upload(
            UUID studentId,
            UUID legalAcceptanceId,
            AuthenticatedActor actor,
            MultipartFile tabletSignatureFile,
            MultipartFile printedTermFile
    ) {
        StudentLegalAcceptance acceptance = ensureAcceptanceBelongsToStudent(studentId, legalAcceptanceId);
        var attachments = new java.util.ArrayList<StudentLegalAcceptanceAttachment>();
        StudentLegalAcceptanceAttachment tabletSignature = createAttachmentIfPresent(
                acceptance,
                actor,
                tabletSignatureFile,
                StudentLegalAcceptanceAttachmentType.TABLET_SIGNATURE
        );
        if (tabletSignature != null) {
            attachments.add(tabletSignature);
        }

        StudentLegalAcceptanceAttachment printedTerm = createAttachmentIfPresent(
                acceptance,
                actor,
                printedTermFile,
                StudentLegalAcceptanceAttachmentType.PRINTED_SIGNED_TERM
        );
        if (printedTerm != null) {
            attachments.add(printedTerm);
        }

        if (attachments.isEmpty()) {
            throw new IllegalArgumentException("Informe ao menos uma evidencia: assinatura no tablet ou termo assinado.");
        }

        return attachmentRepository.saveAll(attachments)
                .stream()
                .map(StudentLegalAcceptanceAttachmentResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public DownloadAttachmentResult download(UUID studentId, UUID legalAcceptanceId, UUID attachmentId) {
        ensureAcceptanceBelongsToStudent(studentId, legalAcceptanceId);
        StudentLegalAcceptanceAttachment attachment = attachmentRepository
                .findByIdAndStudentIdAndLegalAcceptanceId(attachmentId, studentId, legalAcceptanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Anexo do aceite legal nao encontrado."));

        try {
            StoredFile storedFile = storage.load(
                    attachment.getStorageKey(),
                    attachment.getContentType(),
                    attachment.getFileSize()
            );
            return new DownloadAttachmentResult(attachment.getOriginalFileName(), storedFile);
        } catch (IOException exception) {
            throw new UncheckedIOException("Falha ao carregar o anexo do aceite legal.", exception);
        }
    }

    private StudentLegalAcceptanceAttachment createAttachmentIfPresent(
            StudentLegalAcceptance acceptance,
            AuthenticatedActor actor,
            MultipartFile file,
            StudentLegalAcceptanceAttachmentType attachmentType
    ) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        validateFile(file, attachmentType);
        UUID attachmentId = UUID.randomUUID();
        String storageKey = buildStorageKey(
                acceptance.getStudentId(),
                acceptance.getId(),
                attachmentId,
                attachmentType,
                file.getOriginalFilename()
        );

        StoredFile storedFile;
        try {
            storedFile = storage.save(storageKey, file.getContentType(), file.getInputStream());
        } catch (IOException exception) {
            throw new UncheckedIOException("Falha ao armazenar a evidencia do aceite legal.", exception);
        }

        return new StudentLegalAcceptanceAttachment(
                attachmentId,
                acceptance.getStudentId(),
                acceptance.getId(),
                attachmentType,
                sanitizeFileName(file.getOriginalFilename(), attachmentType),
                storedFile.storageKey(),
                normalizeContentType(file.getContentType()),
                storedFile.size(),
                actor.principalId(),
                actor.name()
        );
    }

    private void validateFile(MultipartFile file, StudentLegalAcceptanceAttachmentType attachmentType) {
        if (file.getSize() > storageProperties.maxFileSizeBytes()) {
            throw new IllegalArgumentException("A evidencia enviada excede o tamanho maximo permitido.");
        }

        String contentType = normalizeContentType(file.getContentType());
        if (!storageProperties.allowedContentTypes().contains(contentType)) {
            throw new IllegalArgumentException("Tipo de arquivo nao permitido para " + describeType(attachmentType) + ".");
        }
    }

    private StudentLegalAcceptance ensureAcceptanceBelongsToStudent(UUID studentId, UUID legalAcceptanceId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Aluno nao encontrado.");
        }

        StudentLegalAcceptance acceptance = legalAcceptanceRepository.findById(legalAcceptanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Aceite legal nao encontrado."));

        if (!acceptance.getStudentId().equals(studentId)) {
            throw new ResourceNotFoundException("O aceite legal nao pertence ao aluno informado.");
        }

        return acceptance;
    }

    private String buildStorageKey(
            UUID studentId,
            UUID legalAcceptanceId,
            UUID attachmentId,
            StudentLegalAcceptanceAttachmentType attachmentType,
            String originalFileName
    ) {
        return "students/%s/legal-acceptances/%s/%s/%s%s".formatted(
                studentId,
                legalAcceptanceId,
                attachmentType.name().toLowerCase(Locale.ROOT),
                attachmentId,
                extractExtension(originalFileName)
        );
    }

    private String extractExtension(String originalFileName) {
        if (originalFileName == null || !originalFileName.contains(".")) {
            return "";
        }

        String extension = originalFileName.substring(originalFileName.lastIndexOf('.')).toLowerCase(Locale.ROOT);
        return extension.length() <= 10 ? extension : "";
    }

    private String sanitizeFileName(String originalFileName, StudentLegalAcceptanceAttachmentType attachmentType) {
        if (originalFileName != null && !originalFileName.isBlank()) {
            return originalFileName.trim();
        }

        return switch (attachmentType) {
            case TABLET_SIGNATURE -> "assinatura-tablet.png";
            case PRINTED_SIGNED_TERM -> "termo-assinado.pdf";
        };
    }

    private String normalizeContentType(String contentType) {
        return contentType == null ? "application/octet-stream" : contentType.toLowerCase(Locale.ROOT);
    }

    private String describeType(StudentLegalAcceptanceAttachmentType attachmentType) {
        return switch (attachmentType) {
            case TABLET_SIGNATURE -> "assinatura no tablet";
            case PRINTED_SIGNED_TERM -> "termo assinado";
        };
    }

    public record DownloadAttachmentResult(String fileName, StoredFile file) {
    }
}
