package br.com.gerenciadorpilates.students.application;

import br.com.gerenciadorpilates.platform.domain.ResourceNotFoundException;
import br.com.gerenciadorpilates.platform.security.AuthenticatedActor;
import br.com.gerenciadorpilates.platform.security.SecurityActorUtils;
import br.com.gerenciadorpilates.students.api.RegisterStudentLegalAcceptanceRequest;
import br.com.gerenciadorpilates.students.api.StudentLegalAcceptanceResponse;
import br.com.gerenciadorpilates.students.domain.Student;
import br.com.gerenciadorpilates.students.domain.StudentLegalAcceptance;
import br.com.gerenciadorpilates.students.domain.StudentLegalCollectionMethod;
import br.com.gerenciadorpilates.students.domain.StudentLegalAcceptanceStatus;
import br.com.gerenciadorpilates.students.domain.StudentLegalTermType;
import br.com.gerenciadorpilates.students.infrastructure.StudentLegalAcceptanceRepository;
import br.com.gerenciadorpilates.students.infrastructure.StudentRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class StudentLegalAcceptanceService {

    private final StudentRepository studentRepository;
    private final StudentLegalAcceptanceRepository studentLegalAcceptanceRepository;
    private final StudentLegalAcceptanceAttachmentService attachmentService;

    public StudentLegalAcceptanceService(
            StudentRepository studentRepository,
            StudentLegalAcceptanceRepository studentLegalAcceptanceRepository,
            StudentLegalAcceptanceAttachmentService attachmentService
    ) {
        this.studentRepository = studentRepository;
        this.studentLegalAcceptanceRepository = studentLegalAcceptanceRepository;
        this.attachmentService = attachmentService;
    }

    @Transactional(readOnly = true)
    public List<StudentLegalAcceptanceResponse> listByStudent(UUID studentId) {
        ensureStudentExists(studentId);
        List<StudentLegalAcceptance> acceptances = studentLegalAcceptanceRepository.findAllByStudentIdOrderByCreatedAtDesc(studentId);
        var attachmentsByAcceptanceId = attachmentService.listByAcceptances(
                acceptances.stream().map(StudentLegalAcceptance::getId).toList()
        );

        return acceptances
                .stream()
                .map(acceptance -> StudentLegalAcceptanceResponse.from(
                        acceptance,
                        attachmentsByAcceptanceId.getOrDefault(acceptance.getId(), List.of())
                ))
                .toList();
    }

    @Transactional
    public StudentLegalAcceptanceResponse register(
            UUID studentId,
            Authentication authentication,
            RegisterStudentLegalAcceptanceRequest request
    ) {
        AuthenticatedActor actor = SecurityActorUtils.requireActor(authentication);
        StudentLegalAcceptance savedAcceptance = studentLegalAcceptanceRepository.save(
                createAcceptance(studentId, actor, request)
        );
        return StudentLegalAcceptanceResponse.from(savedAcceptance, List.of());
    }

    @Transactional
    public StudentLegalAcceptanceResponse register(
            UUID studentId,
            Authentication authentication,
            RegisterStudentLegalAcceptanceRequest request,
            MultipartFile tabletSignatureFile,
            MultipartFile printedTermFile
    ) {
        AuthenticatedActor actor = SecurityActorUtils.requireActor(authentication);
        validateEvidenceConsistency(request, tabletSignatureFile, printedTermFile);

        StudentLegalAcceptance savedAcceptance = studentLegalAcceptanceRepository.save(
                createAcceptance(studentId, actor, request)
        );

        return StudentLegalAcceptanceResponse.from(
                savedAcceptance,
                attachmentService.upload(
                        studentId,
                        savedAcceptance.getId(),
                        actor,
                        tabletSignatureFile,
                        printedTermFile
                )
        );
    }

    private void ensureStudentExists(UUID studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Aluno nao encontrado.");
        }
    }

    private StudentLegalAcceptance createAcceptance(
            UUID studentId,
            AuthenticatedActor actor,
            RegisterStudentLegalAcceptanceRequest request
    ) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Aluno nao encontrado."));
        StudentLegalAcceptanceStatus status = request.status();

        if (status == StudentLegalAcceptanceStatus.ACCEPTED && request.collectionMethod() == null) {
            throw new IllegalArgumentException("Metodo de coleta obrigatorio quando o termo ja foi aceito.");
        }

        StudentLegalAcceptance acceptance = new StudentLegalAcceptance(
                UUID.randomUUID(),
                student.getId(),
                request.termType(),
                request.title().trim(),
                request.termsVersion().trim(),
                trimToNull(request.legalBasis()),
                sha256(request.termBody().trim()),
                request.termBody().trim(),
                status,
                request.collectionMethod(),
                status == StudentLegalAcceptanceStatus.ACCEPTED ? OffsetDateTime.now() : null,
                trimToNull(request.evidenceNote()),
                actor.principalId(),
                actor.name()
        );

        if (request.termType() == StudentLegalTermType.LGPD_DATA_PROCESSING
                && status == StudentLegalAcceptanceStatus.ACCEPTED) {
            student.updateLgpdConsent(true);
        }

        return acceptance;
    }

    private void validateEvidenceConsistency(
            RegisterStudentLegalAcceptanceRequest request,
            MultipartFile tabletSignatureFile,
            MultipartFile printedTermFile
    ) {
        if (request.status() != StudentLegalAcceptanceStatus.ACCEPTED) {
            return;
        }

        StudentLegalCollectionMethod collectionMethod = request.collectionMethod();
        if (collectionMethod == StudentLegalCollectionMethod.TABLET_SIGNATURE
                && (tabletSignatureFile == null || tabletSignatureFile.isEmpty())) {
            throw new IllegalArgumentException("Assinatura no tablet obrigatoria para concluir este aceite.");
        }

        if (collectionMethod == StudentLegalCollectionMethod.PRINTED_SIGNATURE
                && (printedTermFile == null || printedTermFile.isEmpty())) {
            throw new IllegalArgumentException("Anexo do termo assinado em papel obrigatorio para concluir este aceite.");
        }
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 indisponivel no ambiente atual.", exception);
        }
    }
}
