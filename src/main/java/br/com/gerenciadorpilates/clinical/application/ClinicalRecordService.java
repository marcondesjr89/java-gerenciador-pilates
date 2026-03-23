package br.com.gerenciadorpilates.clinical.application;

import br.com.gerenciadorpilates.clinical.api.ClinicalAttachmentResponse;
import br.com.gerenciadorpilates.clinical.api.ClinicalRecordResponse;
import br.com.gerenciadorpilates.clinical.api.StudentAnamnesisResponse;
import br.com.gerenciadorpilates.clinical.api.StudentProgressEntryResponse;
import br.com.gerenciadorpilates.clinical.api.StudentProgressEntryWithAttachmentsResponse;
import br.com.gerenciadorpilates.clinical.infrastructure.ClinicalAttachmentRepository;
import br.com.gerenciadorpilates.students.api.StudentResponse;
import br.com.gerenciadorpilates.students.application.StudentService;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClinicalRecordService {

    private final StudentService studentService;
    private final StudentAnamnesisService anamnesisService;
    private final StudentProgressEntryService progressEntryService;
    private final ClinicalAttachmentRepository attachmentRepository;

    public ClinicalRecordService(
            StudentService studentService,
            StudentAnamnesisService anamnesisService,
            StudentProgressEntryService progressEntryService,
            ClinicalAttachmentRepository attachmentRepository
    ) {
        this.studentService = studentService;
        this.anamnesisService = anamnesisService;
        this.progressEntryService = progressEntryService;
        this.attachmentRepository = attachmentRepository;
    }

    @Transactional(readOnly = true)
    public ClinicalRecordResponse getByStudentId(UUID studentId) {
        StudentResponse student = studentService.getById(studentId);
        StudentAnamnesisResponse anamnesis = anamnesisService.findOptionalByStudentId(studentId);
        List<StudentProgressEntryResponse> progressEntries = progressEntryService.listByStudentId(studentId);
        Map<UUID, List<ClinicalAttachmentResponse>> attachmentsByProgressEntry = attachmentRepository
                .findAllByProgressEntryIdIn(progressEntries.stream().map(StudentProgressEntryResponse::id).toList())
                .stream()
                .map(ClinicalAttachmentResponse::from)
                .collect(Collectors.groupingBy(ClinicalAttachmentResponse::progressEntryId));

        List<StudentProgressEntryWithAttachmentsResponse> progressEntriesWithAttachments = progressEntries.stream()
                .map(progressEntry -> StudentProgressEntryWithAttachmentsResponse.from(
                        progressEntry,
                        attachmentsByProgressEntry.getOrDefault(progressEntry.id(), List.of())
                ))
                .toList();

        return new ClinicalRecordResponse(student, anamnesis, progressEntriesWithAttachments);
    }
}
