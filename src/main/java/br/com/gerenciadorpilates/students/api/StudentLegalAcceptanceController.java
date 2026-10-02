package br.com.gerenciadorpilates.students.api;

import br.com.gerenciadorpilates.platform.security.SecurityActorUtils;
import br.com.gerenciadorpilates.students.application.StudentLegalAcceptanceAttachmentService;
import br.com.gerenciadorpilates.students.application.StudentLegalAcceptanceAuditMetadata;
import br.com.gerenciadorpilates.students.application.StudentLegalAcceptanceDocumentService;
import br.com.gerenciadorpilates.students.application.StudentLegalAcceptanceService;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.UUID;
import java.util.HexFormat;
import java.util.concurrent.TimeUnit;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/students/{studentId}/legal-acceptances")
public class StudentLegalAcceptanceController {

    private final StudentLegalAcceptanceService studentLegalAcceptanceService;
    private final StudentLegalAcceptanceAttachmentService attachmentService;
    private final StudentLegalAcceptanceDocumentService documentService;

    public StudentLegalAcceptanceController(
            StudentLegalAcceptanceService studentLegalAcceptanceService,
            StudentLegalAcceptanceAttachmentService attachmentService,
            StudentLegalAcceptanceDocumentService documentService
    ) {
        this.studentLegalAcceptanceService = studentLegalAcceptanceService;
        this.attachmentService = attachmentService;
        this.documentService = documentService;
    }

    @GetMapping
    public List<StudentLegalAcceptanceResponse> list(@PathVariable UUID studentId) {
        return studentLegalAcceptanceService.listByStudent(studentId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StudentLegalAcceptanceResponse register(
            @PathVariable UUID studentId,
            @Valid @RequestBody RegisterStudentLegalAcceptanceRequest request,
            Authentication authentication,
            HttpServletRequest httpServletRequest
    ) {
        return studentLegalAcceptanceService.register(
                studentId,
                authentication,
                request,
                buildAuditMetadata(httpServletRequest)
        );
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public StudentLegalAcceptanceResponse registerWithEvidence(
            @PathVariable UUID studentId,
            @Valid @RequestPart("request") RegisterStudentLegalAcceptanceRequest request,
            @RequestPart(value = "tabletSignatureFile", required = false) MultipartFile tabletSignatureFile,
            @RequestPart(value = "printedTermFile", required = false) MultipartFile printedTermFile,
            Authentication authentication,
            HttpServletRequest httpServletRequest
    ) {
        return studentLegalAcceptanceService.register(
                studentId,
                authentication,
                request,
                buildAuditMetadata(httpServletRequest),
                tabletSignatureFile,
                printedTermFile
        );
    }

    @GetMapping("/{acceptanceId}/attachments")
    public List<StudentLegalAcceptanceAttachmentResponse> listAttachments(
            @PathVariable UUID studentId,
            @PathVariable UUID acceptanceId
    ) {
        return attachmentService.listByAcceptance(studentId, acceptanceId);
    }

    @PostMapping(path = "/{acceptanceId}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public List<StudentLegalAcceptanceAttachmentResponse> uploadAttachments(
            @PathVariable UUID studentId,
            @PathVariable UUID acceptanceId,
            @RequestPart(value = "tabletSignatureFile", required = false) MultipartFile tabletSignatureFile,
            @RequestPart(value = "printedTermFile", required = false) MultipartFile printedTermFile,
            Authentication authentication
    ) {
        return attachmentService.upload(
                studentId,
                acceptanceId,
                SecurityActorUtils.requireActor(authentication),
                tabletSignatureFile,
                printedTermFile
        );
    }

    @GetMapping("/{acceptanceId}/attachments/{attachmentId}/download")
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable UUID studentId,
            @PathVariable UUID acceptanceId,
            @PathVariable UUID attachmentId
    ) {
        var result = attachmentService.download(studentId, acceptanceId, attachmentId);
        MediaType mediaType = MediaType.parseMediaType(result.file().contentType());
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).cachePrivate())
                .contentType(mediaType)
                .contentLength(result.file().size())
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.inline()
                        .filename(result.fileName())
                        .build()
                        .toString())
                .body(result.file().resource());
    }

    @GetMapping("/{acceptanceId}/document")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable UUID studentId,
            @PathVariable UUID acceptanceId
    ) {
        var document = documentService.generatePdf(studentId, acceptanceId);
        Resource resource = new org.springframework.core.io.ByteArrayResource(document.content());
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).cachePrivate())
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(document.content().length)
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename(document.fileName())
                        .build()
                        .toString())
                .body(resource);
    }

    private StudentLegalAcceptanceAuditMetadata buildAuditMetadata(HttpServletRequest request) {
        String clientIp = firstNonBlank(
                extractForwardedIp(request.getHeader("X-Forwarded-For")),
                request.getHeader("X-Real-IP"),
                request.getRemoteAddr()
        );
        String clientUserAgent = firstNonBlank(
                request.getHeader("X-GP-Client-User-Agent"),
                request.getHeader(HttpHeaders.USER_AGENT)
        );
        String collectionOrigin = firstNonBlank(
                request.getHeader("X-GP-Collection-Origin"),
                inferCollectionOrigin(clientUserAgent)
        );

        return new StudentLegalAcceptanceAuditMetadata(
                clientIp,
                clientUserAgent,
                fingerprintAuthorizationHeader(request.getHeader(HttpHeaders.AUTHORIZATION)),
                collectionOrigin
        );
    }

    private String extractForwardedIp(String forwardedFor) {
        if (forwardedFor == null || forwardedFor.isBlank()) {
            return null;
        }

        String[] ips = forwardedFor.split(",");
        return ips.length > 0 ? ips[0].trim() : null;
    }

    private String inferCollectionOrigin(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) {
            return "internal-web-unknown";
        }

        String normalized = userAgent.toLowerCase();
        if (normalized.contains("ipad") || normalized.contains("tablet")) {
          return "internal-web-tablet";
        }

        if (normalized.contains("mobi") || normalized.contains("android")) {
            return "internal-web-mobile";
        }

        return "internal-web-desktop";
    }

    private String fingerprintAuthorizationHeader(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return null;
        }

        String token = authorizationHeader.substring("Bearer ".length()).trim();
        if (token.isEmpty()) {
            return null;
        }

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 indisponivel no ambiente atual.", exception);
        }
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }

        return null;
    }
}
