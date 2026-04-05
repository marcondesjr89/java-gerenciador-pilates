package br.com.gerenciadorpilates.students.api;

import br.com.gerenciadorpilates.platform.security.SecurityActorUtils;
import br.com.gerenciadorpilates.students.application.StudentLegalAcceptanceAttachmentService;
import br.com.gerenciadorpilates.students.application.StudentLegalAcceptanceService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.core.io.Resource;
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

    public StudentLegalAcceptanceController(
            StudentLegalAcceptanceService studentLegalAcceptanceService,
            StudentLegalAcceptanceAttachmentService attachmentService
    ) {
        this.studentLegalAcceptanceService = studentLegalAcceptanceService;
        this.attachmentService = attachmentService;
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
            Authentication authentication
    ) {
        return studentLegalAcceptanceService.register(studentId, authentication, request);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public StudentLegalAcceptanceResponse registerWithEvidence(
            @PathVariable UUID studentId,
            @Valid @RequestPart("request") RegisterStudentLegalAcceptanceRequest request,
            @RequestPart(value = "tabletSignatureFile", required = false) MultipartFile tabletSignatureFile,
            @RequestPart(value = "printedTermFile", required = false) MultipartFile printedTermFile,
            Authentication authentication
    ) {
        return studentLegalAcceptanceService.register(
                studentId,
                authentication,
                request,
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
                .contentType(mediaType)
                .contentLength(result.file().size())
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.inline()
                        .filename(result.fileName())
                        .build()
                        .toString())
                .body(result.file().resource());
    }
}
