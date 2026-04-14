package br.com.gerenciadorpilates.students.api;

import br.com.gerenciadorpilates.students.application.StudentLegalAcceptanceDocumentService;
import java.util.UUID;
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
    public StudentLegalAcceptanceVerificationResponse verify(
            @PathVariable UUID acceptanceId,
            @RequestParam String code
    ) {
        return documentService.verify(acceptanceId, code);
    }
}
