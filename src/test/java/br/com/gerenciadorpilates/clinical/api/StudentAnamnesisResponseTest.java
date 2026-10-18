package br.com.gerenciadorpilates.clinical.api;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.gerenciadorpilates.clinical.domain.StudentAnamnesis;
import br.com.gerenciadorpilates.scheduling.api.InstructorDayClinicalSummaryResponse;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class StudentAnamnesisResponseTest {

    @Test
    void deveGerarAlertaDePatologiaEnriquecidoComDetalheOuFallbackGenerico() {
        UUID id = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();

        StudentAnamnesis comDetalhe = new StudentAnamnesis(
                id,
                studentId,
                true,
                "  Hérnia de disco L4-L5  ",
                false,
                null,
                false,
                null,
                false,
                false,
                false,
                false,
                null
        );

        StudentAnamnesis semDetalheNulo = new StudentAnamnesis(
                id,
                studentId,
                true,
                null,
                false,
                null,
                false,
                null,
                false,
                false,
                false,
                false,
                null
        );

        StudentAnamnesis semDetalheEmBranco = new StudentAnamnesis(
                id,
                studentId,
                true,
                "   ",
                false,
                null,
                false,
                null,
                false,
                false,
                false,
                false,
                null
        );

        assertThat(StudentAnamnesisResponse.from(comDetalhe).alerts())
                .containsExactly("Patologia: Hérnia de disco L4-L5");
        assertThat(StudentAnamnesisResponse.from(semDetalheNulo).alerts())
                .containsExactly("Patologias registradas");
        assertThat(StudentAnamnesisResponse.from(semDetalheEmBranco).alerts())
                .containsExactly("Patologias registradas");
    }

    @Test
    void deveGerarAlertasDeCirurgiaEDorComDetalhePreenchidoOuFallbackGenerico() {
        UUID id = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();

        StudentAnamnesis comDetalhes = new StudentAnamnesis(
                id,
                studentId,
                false,
                null,
                true,
                " Artroscopia de joelho direito ",
                true,
                " Cervicalgia irradiada ",
                false,
                false,
                false,
                false,
                null
        );

        StudentAnamnesis comFallbacks = new StudentAnamnesis(
                id,
                studentId,
                false,
                null,
                true,
                "  ",
                true,
                null,
                false,
                false,
                false,
                false,
                null
        );

        assertThat(StudentAnamnesisResponse.from(comDetalhes).alerts())
                .containsExactly(
                        "Cirurgia: Artroscopia de joelho direito",
                        "Dor: Cervicalgia irradiada"
                );
        assertThat(StudentAnamnesisResponse.from(comFallbacks).alerts())
                .containsExactly(
                        "Cirurgias registradas",
                        "Dor em acompanhamento"
                );
    }

    @Test
    void deveMapearTodasAsFlagsBooleanasClinicasNaOrdemEsperada() {
        StudentAnamnesis anamnesis = new StudentAnamnesis(
                UUID.randomUUID(),
                UUID.randomUUID(),
                false,
                null,
                false,
                null,
                false,
                null,
                true,
                true,
                true,
                true,
                "Acompanhamento multidisciplinar."
        );

        StudentAnamnesisResponse response = StudentAnamnesisResponse.from(anamnesis);

        assertThat(response.alerts()).containsExactly(
                "Hipertensao",
                "Osteoporose",
                "Gestacao",
                "Exige liberacao medica"
        );
    }

    @Test
    void deveRetornarListaDeAlertasVaziaQuandoAlunoNaoPossuiCondicoesAtivas() {
        StudentAnamnesis semAlertas = new StudentAnamnesis(
                UUID.randomUUID(),
                UUID.randomUUID(),
                false,
                "Texto residual ignorado quando flag desativada",
                false,
                "Cirurgia residual ignorada",
                false,
                "Dor residual ignorada",
                false,
                false,
                false,
                false,
                "Aluno apto sem restrições."
        );

        StudentAnamnesisResponse response = StudentAnamnesisResponse.from(semAlertas);

        assertThat(response.alerts()).isEmpty();
        assertThat(response.generalObservations()).isEqualTo("Aluno apto sem restrições.");
    }

    @Test
    void devePreservarIntegridadeDeContratoNoMapeamentoCompletoEntreEntidadeEDto() {
        UUID id = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();

        StudentAnamnesis anamnesis = new StudentAnamnesis(
                id,
                studentId,
                true,
                "Escoliose lombar",
                true,
                "Meniscectomia",
                true,
                "Dor lombar leve",
                true,
                false,
                true,
                true,
                "Evitar hiperextensão lombar."
        );

        StudentAnamnesisResponse response = StudentAnamnesisResponse.from(anamnesis);

        assertThat(response.id()).isEqualTo(id);
        assertThat(response.studentId()).isEqualTo(studentId);
        assertThat(response.hasPathologies()).isTrue();
        assertThat(response.pathologyDetails()).isEqualTo("Escoliose lombar");
        assertThat(response.hasSurgeries()).isTrue();
        assertThat(response.surgeryDetails()).isEqualTo("Meniscectomia");
        assertThat(response.hasPain()).isTrue();
        assertThat(response.painDetails()).isEqualTo("Dor lombar leve");
        assertThat(response.hasHypertension()).isTrue();
        assertThat(response.hasOsteoporosis()).isFalse();
        assertThat(response.isPregnant()).isTrue();
        assertThat(response.medicalClearanceRequired()).isTrue();
        assertThat(response.generalObservations()).isEqualTo("Evitar hiperextensão lombar.");
        assertThat(response.alerts()).containsExactly(
                "Patologia: Escoliose lombar",
                "Cirurgia: Meniscectomia",
                "Dor: Dor lombar leve",
                "Hipertensao",
                "Gestacao",
                "Exige liberacao medica"
        );

        InstructorDayClinicalSummaryResponse instructorSummary = InstructorDayClinicalSummaryResponse.from(
                studentId,
                anamnesis,
                null
        );
        assertThat(instructorSummary.alerts()).isEqualTo(response.alerts());
        assertThat(instructorSummary.generalObservations()).isEqualTo("Evitar hiperextensão lombar.");
    }
}
