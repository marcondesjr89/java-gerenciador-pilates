package br.com.gerenciadorpilates.scheduling.api;

import br.com.gerenciadorpilates.clinical.api.StudentAnamnesisResponse;
import br.com.gerenciadorpilates.clinical.domain.StudentAnamnesis;
import br.com.gerenciadorpilates.clinical.domain.StudentProgressEntry;
import java.util.List;
import java.util.UUID;

public record InstructorDayClinicalSummaryResponse(
        UUID studentId,
        List<String> alerts,
        String generalObservations,
        InstructorDayLatestProgressEntryResponse latestProgressEntry
) {

    public static InstructorDayClinicalSummaryResponse from(
            UUID studentId,
            StudentAnamnesis anamnesis,
            StudentProgressEntry latestProgressEntry
    ) {
        StudentAnamnesisResponse anamnesisResponse = anamnesis == null ? null : StudentAnamnesisResponse.from(anamnesis);
        return new InstructorDayClinicalSummaryResponse(
                studentId,
                anamnesisResponse == null ? List.of() : anamnesisResponse.alerts(),
                anamnesisResponse == null ? null : anamnesisResponse.generalObservations(),
                latestProgressEntry == null ? null : InstructorDayLatestProgressEntryResponse.from(latestProgressEntry)
        );
    }
}
