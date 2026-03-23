package br.com.gerenciadorpilates.clinical.api;

import br.com.gerenciadorpilates.students.api.StudentResponse;
import java.util.List;

public record ClinicalRecordResponse(
        StudentResponse student,
        StudentAnamnesisResponse anamnesis,
        List<StudentProgressEntryWithAttachmentsResponse> progressEntries
) {
}
