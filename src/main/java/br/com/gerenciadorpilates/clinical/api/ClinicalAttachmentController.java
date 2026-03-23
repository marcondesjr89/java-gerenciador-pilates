package br.com.gerenciadorpilates.clinical.api;

import br.com.gerenciadorpilates.clinical.application.ClinicalAttachmentService;
import java.security.Principal;
import java.util.List;
import java.util.UUID;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/students/{studentId}/progress-entries/{progressEntryId}/attachments")
public class ClinicalAttachmentController {

    private final ClinicalAttachmentService attachmentService;

    public ClinicalAttachmentController(ClinicalAttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ClinicalAttachmentResponse upload(
            @PathVariable UUID studentId,
            @PathVariable UUID progressEntryId,
            @RequestPart("file") MultipartFile file,
            Principal principal
    ) {
        return attachmentService.upload(studentId, progressEntryId, principal.getName(), file);
    }

    @GetMapping
    public List<ClinicalAttachmentResponse> list(
            @PathVariable UUID studentId,
            @PathVariable UUID progressEntryId
    ) {
        return attachmentService.listByProgressEntryId(studentId, progressEntryId);
    }

    @GetMapping("/{attachmentId}/download")
    public ResponseEntity<Resource> download(
            @PathVariable UUID studentId,
            @PathVariable UUID progressEntryId,
            @PathVariable UUID attachmentId
    ) {
        ClinicalAttachmentService.DownloadAttachmentResult result =
                attachmentService.download(studentId, progressEntryId, attachmentId);

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
