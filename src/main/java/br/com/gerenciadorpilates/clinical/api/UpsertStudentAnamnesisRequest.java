package br.com.gerenciadorpilates.clinical.api;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Size;

public record UpsertStudentAnamnesisRequest(
        boolean hasPathologies,
        @Size(max = 1000) String pathologyDetails,
        boolean hasSurgeries,
        @Size(max = 1000) String surgeryDetails,
        boolean hasPain,
        @Size(max = 1000) String painDetails,
        boolean hasHypertension,
        boolean hasOsteoporosis,
        boolean isPregnant,
        boolean medicalClearanceRequired,
        @Size(max = 1500) String generalObservations
) {

    @AssertTrue(message = "Informe os detalhes das patologias quando o campo estiver marcado.")
    public boolean isPathologyDetailsConsistent() {
        return !hasPathologies || hasText(pathologyDetails);
    }

    @AssertTrue(message = "Informe os detalhes das cirurgias quando o campo estiver marcado.")
    public boolean isSurgeryDetailsConsistent() {
        return !hasSurgeries || hasText(surgeryDetails);
    }

    @AssertTrue(message = "Informe os detalhes da dor quando o campo estiver marcado.")
    public boolean isPainDetailsConsistent() {
        return !hasPain || hasText(painDetails);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
