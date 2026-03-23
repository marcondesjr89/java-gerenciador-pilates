package br.com.gerenciadorpilates.clinical.api;

import br.com.gerenciadorpilates.clinical.application.ClinicalRecordService;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/students/{studentId}/clinical-record")
public class ClinicalRecordController {

    private final ClinicalRecordService clinicalRecordService;

    public ClinicalRecordController(ClinicalRecordService clinicalRecordService) {
        this.clinicalRecordService = clinicalRecordService;
    }

    @GetMapping
    public ClinicalRecordResponse getByStudentId(@PathVariable UUID studentId) {
        return clinicalRecordService.getByStudentId(studentId);
    }
}
