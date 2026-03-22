package br.com.gerenciadorpilates.clinical.api;

import br.com.gerenciadorpilates.clinical.domain.StudentAnamnesis;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public record StudentAnamnesisResponse(
        UUID id,
        UUID studentId,
        boolean hasPathologies,
        String pathologyDetails,
        boolean hasSurgeries,
        String surgeryDetails,
        boolean hasPain,
        String painDetails,
        boolean hasHypertension,
        boolean hasOsteoporosis,
        boolean isPregnant,
        boolean medicalClearanceRequired,
        String generalObservations,
        List<String> alerts,
        OffsetDateTime updatedAt
) {

    public static StudentAnamnesisResponse from(StudentAnamnesis anamnesis) {
        return new StudentAnamnesisResponse(
                anamnesis.getId(),
                anamnesis.getStudentId(),
                anamnesis.isHasPathologies(),
                anamnesis.getPathologyDetails(),
                anamnesis.isHasSurgeries(),
                anamnesis.getSurgeryDetails(),
                anamnesis.isHasPain(),
                anamnesis.getPainDetails(),
                anamnesis.isHasHypertension(),
                anamnesis.isHasOsteoporosis(),
                anamnesis.isPregnant(),
                anamnesis.isMedicalClearanceRequired(),
                anamnesis.getGeneralObservations(),
                buildAlerts(anamnesis),
                anamnesis.getUpdatedAt()
        );
    }

    private static List<String> buildAlerts(StudentAnamnesis anamnesis) {
        List<String> alerts = new ArrayList<>();
        if (anamnesis.isHasPathologies()) {
            alerts.add("Patologias registradas");
        }
        if (anamnesis.isHasSurgeries()) {
            alerts.add("Cirurgias registradas");
        }
        if (anamnesis.isHasPain()) {
            alerts.add("Dor em acompanhamento");
        }
        if (anamnesis.isHasHypertension()) {
            alerts.add("Hipertensao");
        }
        if (anamnesis.isHasOsteoporosis()) {
            alerts.add("Osteoporose");
        }
        if (anamnesis.isPregnant()) {
            alerts.add("Gestacao");
        }
        if (anamnesis.isMedicalClearanceRequired()) {
            alerts.add("Exige liberacao medica");
        }
        return alerts;
    }
}
