package br.com.gerenciadorpilates.students.api;

import br.com.gerenciadorpilates.students.application.StudentLegalAcceptanceDocumentService;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public/legal-acceptances")
public class PublicStudentLegalAcceptanceVerificationController {

    private final StudentLegalAcceptanceDocumentService documentService;

    public PublicStudentLegalAcceptanceVerificationController(StudentLegalAcceptanceDocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping("/{acceptanceId}/verification")
    public ResponseEntity<StudentLegalAcceptanceVerificationResponse> verify(
            @PathVariable UUID acceptanceId,
            @RequestParam String code
    ) {
        StudentLegalAcceptanceVerificationResponse response = documentService.verify(acceptanceId, code);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(1, TimeUnit.HOURS).cachePublic().staleWhileRevalidate(1, TimeUnit.DAYS))
                .body(response);
    }
}
