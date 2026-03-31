package br.com.gerenciadorpilates.students.application;

import br.com.gerenciadorpilates.platform.domain.ResourceNotFoundException;
import br.com.gerenciadorpilates.platform.security.AuthenticatedActor;
import br.com.gerenciadorpilates.platform.security.SecurityActorUtils;
import br.com.gerenciadorpilates.students.api.RegisterStudentLegalAcceptanceRequest;
import br.com.gerenciadorpilates.students.api.StudentLegalAcceptanceResponse;
import br.com.gerenciadorpilates.students.domain.Student;
import br.com.gerenciadorpilates.students.domain.StudentLegalAcceptance;
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

@Service
public class StudentLegalAcceptanceService {

    private final StudentRepository studentRepository;
    private final StudentLegalAcceptanceRepository studentLegalAcceptanceRepository;

    public StudentLegalAcceptanceService(
            StudentRepository studentRepository,
            StudentLegalAcceptanceRepository studentLegalAcceptanceRepository
    ) {
        this.studentRepository = studentRepository;
        this.studentLegalAcceptanceRepository = studentLegalAcceptanceRepository;
    }

    @Transactional(readOnly = true)
    public List<StudentLegalAcceptanceResponse> listByStudent(UUID studentId) {
        ensureStudentExists(studentId);
        return studentLegalAcceptanceRepository.findAllByStudentIdOrderByCreatedAtDesc(studentId)
                .stream()
                .map(StudentLegalAcceptanceResponse::from)
                .toList();
    }

    @Transactional
    public StudentLegalAcceptanceResponse register(
            UUID studentId,
            Authentication authentication,
            RegisterStudentLegalAcceptanceRequest request
    ) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Aluno nao encontrado."));
        AuthenticatedActor actor = SecurityActorUtils.requireActor(authentication);
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

        StudentLegalAcceptance savedAcceptance = studentLegalAcceptanceRepository.save(acceptance);
        return StudentLegalAcceptanceResponse.from(savedAcceptance);
    }

    private void ensureStudentExists(UUID studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Aluno nao encontrado.");
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
