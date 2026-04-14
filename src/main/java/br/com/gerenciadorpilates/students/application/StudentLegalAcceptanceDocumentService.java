package br.com.gerenciadorpilates.students.application;

import br.com.gerenciadorpilates.platform.config.ApplicationProperties;
import br.com.gerenciadorpilates.platform.domain.ResourceNotFoundException;
import br.com.gerenciadorpilates.students.api.StudentLegalAcceptanceAttachmentResponse;
import br.com.gerenciadorpilates.students.api.StudentLegalAcceptanceVerificationResponse;
import br.com.gerenciadorpilates.students.domain.Student;
import br.com.gerenciadorpilates.students.domain.StudentLegalAcceptance;
import br.com.gerenciadorpilates.students.domain.StudentLegalAcceptanceStatus;
import br.com.gerenciadorpilates.students.infrastructure.StudentLegalAcceptancePdfGenerator;
import br.com.gerenciadorpilates.students.infrastructure.StudentLegalAcceptanceRepository;
import br.com.gerenciadorpilates.students.infrastructure.StudentRepository;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import java.awt.image.BufferedImage;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class StudentLegalAcceptanceDocumentService {

    private static final DateTimeFormatter DATE_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss", new Locale("pt", "BR"));
    private static final Map<br.com.gerenciadorpilates.students.domain.StudentLegalTermType, String> TERM_TYPE_LABELS =
            Map.of(
                    br.com.gerenciadorpilates.students.domain.StudentLegalTermType.LGPD_DATA_PROCESSING, "Tratamento de dados (LGPD)",
                    br.com.gerenciadorpilates.students.domain.StudentLegalTermType.WHATSAPP_COMMUNICATION, "Comunicacao via WhatsApp",
                    br.com.gerenciadorpilates.students.domain.StudentLegalTermType.CLINICAL_RECORD_SHARING, "Compartilhamento de prontuario clinico",
                    br.com.gerenciadorpilates.students.domain.StudentLegalTermType.EVOLUTION_IMAGE_CAPTURE, "Captura de imagem da evolucao clinica"
            );
    private static final Map<br.com.gerenciadorpilates.students.domain.StudentLegalCollectionMethod, String> COLLECTION_METHOD_LABELS =
            Map.of(
                    br.com.gerenciadorpilates.students.domain.StudentLegalCollectionMethod.TABLET_SIGNATURE, "Assinatura no tablet",
                    br.com.gerenciadorpilates.students.domain.StudentLegalCollectionMethod.PRINTED_SIGNATURE, "Assinatura em papel",
                    br.com.gerenciadorpilates.students.domain.StudentLegalCollectionMethod.INTERNAL_RECORD, "Registro interno"
            );

    private final StudentRepository studentRepository;
    private final StudentLegalAcceptanceRepository acceptanceRepository;
    private final StudentLegalAcceptanceAttachmentService attachmentService;
    private final StudentLegalAcceptancePdfGenerator pdfGenerator;
    private final ApplicationProperties applicationProperties;
    private final StudentLegalAcceptanceDocumentProperties documentProperties;

    public StudentLegalAcceptanceDocumentService(
            StudentRepository studentRepository,
            StudentLegalAcceptanceRepository acceptanceRepository,
            StudentLegalAcceptanceAttachmentService attachmentService,
            StudentLegalAcceptancePdfGenerator pdfGenerator,
            ApplicationProperties applicationProperties,
            StudentLegalAcceptanceDocumentProperties documentProperties
    ) {
        this.studentRepository = studentRepository;
        this.acceptanceRepository = acceptanceRepository;
        this.attachmentService = attachmentService;
        this.pdfGenerator = pdfGenerator;
        this.applicationProperties = applicationProperties;
        this.documentProperties = documentProperties;
    }

    @Transactional(readOnly = true)
    public GeneratedDocument generatePdf(UUID studentId, UUID acceptanceId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Aluno nao encontrado."));
        StudentLegalAcceptance acceptance = findAcceptance(studentId, acceptanceId);
        List<StudentLegalAcceptanceAttachmentResponse> attachments = attachmentService.listByAcceptance(studentId, acceptanceId);
        String verificationCode = buildVerificationCode(acceptance);
        String verificationUrl = buildVerificationUrl(acceptanceId, verificationCode);

        byte[] pdfBytes = pdfGenerator.generate(new StudentLegalAcceptancePdfGenerator.DocumentData(
                applicationProperties.name(),
                student.getFullName(),
                maskCpf(student.getCpf()),
                acceptance.getTitle(),
                TERM_TYPE_LABELS.getOrDefault(acceptance.getTermType(), acceptance.getTermType().name()),
                acceptance.getTermsVersion(),
                acceptance.getStatus(),
                describeCollectionMethod(acceptance),
                formatDateTime(acceptance.getAcceptedAt(), "Aguardando assinatura"),
                defaultValue(acceptance.getCapturedByUserName(), "Usuario interno nao identificado"),
                acceptance.getDocumentHash(),
                verificationCode,
                verificationUrl,
                defaultValue(acceptance.getAuditCollectionOrigin(), "Nao registrada"),
                defaultValue(acceptance.getAuditIpAddress(), "Nao registrado"),
                abbreviate(defaultValue(acceptance.getAuditSessionKey(), "Nao registrada"), 32),
                abbreviate(defaultValue(acceptance.getAuditUserAgent(), "Nao registrado"), 180),
                defaultValue(acceptance.getEvidenceNote(), "Nenhuma observacao adicional registrada."),
                attachments.stream()
                        .map(this::describeAttachment)
                        .toList(),
                acceptance.getTermBody(),
                generateQrCodeImage(verificationUrl),
                buildFooterText(acceptance, student)
        ));

        String fileName = "aceite-legal-%s-%s.pdf".formatted(
                acceptance.getTermsVersion().replaceAll("[^a-zA-Z0-9._-]", "-"),
                acceptance.getId()
        );

        return new GeneratedDocument(fileName, pdfBytes);
    }

    @Transactional(readOnly = true)
    public StudentLegalAcceptanceVerificationResponse verify(UUID acceptanceId, String code) {
        StudentLegalAcceptance acceptance = acceptanceRepository.findById(acceptanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Aceite legal nao encontrado."));
        Student student = studentRepository.findById(acceptance.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Aluno nao encontrado."));
        String expectedCode = buildVerificationCode(acceptance);

        return StudentLegalAcceptanceVerificationResponse.from(
                acceptance,
                student.getFullName(),
                maskCpf(student.getCpf()),
                expectedCode,
                expectedCode.equals(code)
        );
    }

    private StudentLegalAcceptance findAcceptance(UUID studentId, UUID acceptanceId) {
        StudentLegalAcceptance acceptance = acceptanceRepository.findById(acceptanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Aceite legal nao encontrado."));
        if (!acceptance.getStudentId().equals(studentId)) {
            throw new ResourceNotFoundException("O aceite legal nao pertence ao aluno informado.");
        }
        return acceptance;
    }

    private String buildVerificationUrl(UUID acceptanceId, String verificationCode) {
        return UriComponentsBuilder.fromUriString(documentProperties.verificationBaseUrl())
                .pathSegment("api", "v1", "public", "legal-acceptances", acceptanceId.toString(), "verification")
                .queryParam("code", verificationCode)
                .build()
                .toUriString();
    }

    private String buildVerificationCode(StudentLegalAcceptance acceptance) {
        return sha256("%s|%s|%s|%s".formatted(
                acceptance.getId(),
                acceptance.getTermsVersion(),
                acceptance.getDocumentHash(),
                acceptance.getAcceptedAt() == null ? "pending" : acceptance.getAcceptedAt().toInstant()
        )).substring(0, 16).toUpperCase(Locale.ROOT);
    }

    private BufferedImage generateQrCodeImage(String value) {
        try {
            BitMatrix bitMatrix = new MultiFormatWriter().encode(
                    value,
                    BarcodeFormat.QR_CODE,
                    256,
                    256,
                    Map.of(EncodeHintType.MARGIN, 1)
            );
            return MatrixToImageWriter.toBufferedImage(bitMatrix);
        } catch (Exception exception) {
            throw new IllegalStateException("Falha ao gerar o QR Code do aceite legal.", exception);
        }
    }

    private String describeAttachment(StudentLegalAcceptanceAttachmentResponse attachment) {
        String type = switch (attachment.attachmentType()) {
            case TABLET_SIGNATURE -> "Assinatura em tablet";
            case PRINTED_SIGNED_TERM -> "Termo assinado em papel";
        };
        return "%s: %s (%s bytes)".formatted(type, attachment.originalFileName(), attachment.fileSize());
    }

    private String buildFooterText(StudentLegalAcceptance acceptance, Student student) {
        return "Registro juridico %s vinculado ao aluno %s (%s).".formatted(
                acceptance.getId(),
                student.getFullName(),
                maskCpf(student.getCpf())
        );
    }

    private String describeCollectionMethod(StudentLegalAcceptance acceptance) {
        if (acceptance.getCollectionMethod() == null) {
            return acceptance.getStatus() == StudentLegalAcceptanceStatus.ACCEPTED
                    ? "Nao informado"
                    : "Aguardando definicao";
        }
        return COLLECTION_METHOD_LABELS.getOrDefault(acceptance.getCollectionMethod(), acceptance.getCollectionMethod().name());
    }

    private String formatDateTime(OffsetDateTime value, String defaultValue) {
        if (value == null) {
            return defaultValue;
        }
        return DATE_TIME_FORMATTER.format(value.atZoneSameInstant(ZoneId.of(applicationProperties.timezone())));
    }

    private String maskCpf(String cpf) {
        if (cpf == null || cpf.length() != 11) {
            return "***";
        }
        return "***.%s.%s-**".formatted(cpf.substring(3, 6), cpf.substring(6, 9));
    }

    private String defaultValue(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private String abbreviate(String value, int maxLength) {
        if (value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength - 3) + "...";
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 indisponivel no ambiente atual.", exception);
        }
    }

    public record GeneratedDocument(String fileName, byte[] content) {
    }
}
