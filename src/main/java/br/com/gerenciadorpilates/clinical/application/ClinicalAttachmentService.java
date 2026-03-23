package br.com.gerenciadorpilates.clinical.application;

import br.com.gerenciadorpilates.clinical.api.ClinicalAttachmentResponse;
import br.com.gerenciadorpilates.clinical.domain.ClinicalAttachment;
import br.com.gerenciadorpilates.clinical.domain.StudentProgressEntry;
import br.com.gerenciadorpilates.clinical.infrastructure.ClinicalAttachmentRepository;
import br.com.gerenciadorpilates.clinical.infrastructure.StudentProgressEntryRepository;
import br.com.gerenciadorpilates.identityaccess.domain.AppUser;
import br.com.gerenciadorpilates.identityaccess.infrastructure.AppUserRepository;
import br.com.gerenciadorpilates.platform.domain.ResourceNotFoundException;
import br.com.gerenciadorpilates.platform.storage.ClinicalAttachmentStorage;
import br.com.gerenciadorpilates.platform.storage.ClinicalAttachmentStorageProperties;
import br.com.gerenciadorpilates.platform.storage.StoredFile;
import br.com.gerenciadorpilates.students.infrastructure.StudentRepository;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ClinicalAttachmentService {

    private final ClinicalAttachmentRepository attachmentRepository;
    private final StudentProgressEntryRepository progressEntryRepository;
    private final StudentRepository studentRepository;
    private final AppUserRepository userRepository;
    private final ClinicalAttachmentStorage storage;
    private final ClinicalAttachmentStorageProperties storageProperties;

    public ClinicalAttachmentService(
            ClinicalAttachmentRepository attachmentRepository,
            StudentProgressEntryRepository progressEntryRepository,
            StudentRepository studentRepository,
            AppUserRepository userRepository,
            ClinicalAttachmentStorage storage,
            ClinicalAttachmentStorageProperties storageProperties
    ) {
        this.attachmentRepository = attachmentRepository;
        this.progressEntryRepository = progressEntryRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.storage = storage;
        this.storageProperties = storageProperties;
    }

    @Transactional
    public ClinicalAttachmentResponse upload(
            UUID studentId,
            UUID progressEntryId,
            String authenticatedEmail,
            MultipartFile file
    ) {
        validateStudentAndProgressEntry(studentId, progressEntryId);
        validateFile(file);
        AppUser author = userRepository.findByEmailIgnoreCaseAndActiveTrue(authenticatedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario autenticado nao encontrado."));

        UUID attachmentId = UUID.randomUUID();
        String storageKey = buildStorageKey(studentId, progressEntryId, attachmentId, file.getOriginalFilename());

        StoredFile storedFile;
        try {
            storedFile = storage.save(storageKey, file.getContentType(), file.getInputStream());
        } catch (IOException exception) {
            throw new UncheckedIOException("Falha ao armazenar o arquivo.", exception);
        }

        ClinicalAttachment attachment = new ClinicalAttachment(
                attachmentId,
                studentId,
                progressEntryId,
                author.getId(),
                author.getFullName(),
                sanitizeFileName(file.getOriginalFilename()),
                storedFile.storageKey(),
                normalizeContentType(file.getContentType()),
                storedFile.size()
        );

        ClinicalAttachment savedAttachment = attachmentRepository.save(attachment);
        return ClinicalAttachmentResponse.from(savedAttachment);
    }

    @Transactional(readOnly = true)
    public List<ClinicalAttachmentResponse> listByProgressEntryId(UUID studentId, UUID progressEntryId) {
        validateStudentAndProgressEntry(studentId, progressEntryId);
        return attachmentRepository.findAllByProgressEntryIdOrderByCreatedAtAsc(progressEntryId)
                .stream()
                .map(ClinicalAttachmentResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public DownloadAttachmentResult download(UUID studentId, UUID progressEntryId, UUID attachmentId) {
        ClinicalAttachment attachment = attachmentRepository
                .findByIdAndStudentIdAndProgressEntryId(attachmentId, studentId, progressEntryId)
                .orElseThrow(() -> new ResourceNotFoundException("Anexo clinico nao encontrado."));

        try {
            StoredFile storedFile = storage.load(
                    attachment.getStorageKey(),
                    attachment.getContentType(),
                    attachment.getFileSize()
            );
            return new DownloadAttachmentResult(attachment.getOriginalFileName(), storedFile);
        } catch (IOException exception) {
            throw new UncheckedIOException("Falha ao carregar o arquivo.", exception);
        }
    }

    private void validateStudentAndProgressEntry(UUID studentId, UUID progressEntryId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Aluno nao encontrado.");
        }

        StudentProgressEntry progressEntry = progressEntryRepository.findById(progressEntryId)
                .orElseThrow(() -> new ResourceNotFoundException("Evolucao clinica nao encontrada."));

        if (!progressEntry.getStudentId().equals(studentId)) {
            throw new ResourceNotFoundException("A evolucao informada nao pertence ao aluno.");
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("O arquivo enviado esta vazio.");
        }

        if (file.getSize() > storageProperties.maxFileSizeBytes()) {
            throw new IllegalArgumentException("O arquivo excede o tamanho maximo permitido.");
        }

        String contentType = normalizeContentType(file.getContentType());
        if (!storageProperties.allowedContentTypes().contains(contentType)) {
            throw new IllegalArgumentException("Tipo de arquivo nao permitido.");
        }
    }

    private String buildStorageKey(UUID studentId, UUID progressEntryId, UUID attachmentId, String originalFileName) {
        String extension = extractExtension(originalFileName);
        return "students/%s/progress/%s/%s%s".formatted(studentId, progressEntryId, attachmentId, extension);
    }

    private String extractExtension(String originalFileName) {
        if (originalFileName == null || !originalFileName.contains(".")) {
            return "";
        }

        String extension = originalFileName.substring(originalFileName.lastIndexOf('.')).toLowerCase(Locale.ROOT);
        return extension.length() <= 10 ? extension : "";
    }

    private String sanitizeFileName(String originalFileName) {
        return originalFileName == null || originalFileName.isBlank() ? "arquivo" : originalFileName.trim();
    }

    private String normalizeContentType(String contentType) {
        return contentType == null ? "application/octet-stream" : contentType.toLowerCase(Locale.ROOT);
    }

    public record DownloadAttachmentResult(String fileName, StoredFile file) {
    }
}
