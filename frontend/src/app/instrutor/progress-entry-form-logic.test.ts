import { describe, expect, it } from "vitest";
import {
  appendProgressEntryNoteTemplate,
  buildProgressEntryDraftFromLatest,
  applyProgressEntryScorePreset,
  buildProgressEntryPayload,
  getOptionalProgressEntryAttachment,
  PROGRESS_ENTRY_NOTE_TEMPLATES,
  PROGRESS_ENTRY_SCORE_PRESETS
} from "@/app/instrutor/progress-entry-form-logic";

describe("progress entry form logic", () => {
  it("normaliza o payload da evolucao para o formato esperado", () => {
    const formData = new FormData();
    formData.set("recordedAt", "2026-04-20T09:30");
    formData.set("instructorNotes", "  Sessao com boa resposta.  ");
    formData.set("flexibilityScore", "80");
    formData.set("strengthScore", "72");
    formData.set("painLevel", "1");

    expect(buildProgressEntryPayload(formData)).toEqual({
      recordedAt: new Date("2026-04-20T09:30").toISOString(),
      instructorNotes: "Sessao com boa resposta.",
      flexibilityScore: 80,
      strengthScore: 72,
      painLevel: 1
    });
  });

  it("ignora anexo vazio e retorna arquivo quando houver upload", () => {
    const emptyFormData = new FormData();
    emptyFormData.set("attachment", new File([], "vazio.pdf", { type: "application/pdf" }));
    expect(getOptionalProgressEntryAttachment(emptyFormData)).toBeNull();

    const filledFormData = new FormData();
    const file = new File(["pdf"], "evolucao.pdf", { type: "application/pdf" });
    filledFormData.set("attachment", file);

    expect(getOptionalProgressEntryAttachment(filledFormData)).toBe(file);
  });

  it("monta notas rapidas reaproveitando templates operacionais", () => {
    expect(PROGRESS_ENTRY_NOTE_TEMPLATES).toHaveLength(3);

    expect(appendProgressEntryNoteTemplate("", PROGRESS_ENTRY_NOTE_TEMPLATES[0].text)).toBe(
      PROGRESS_ENTRY_NOTE_TEMPLATES[0].text
    );
    expect(appendProgressEntryNoteTemplate("  Observacao inicial.  ", "  Complemento da sessao.  ")).toBe(
      "Observacao inicial.\n\nComplemento da sessao."
    );
  });

  it("aplica presets de pontuacao para lancamento em tablet", () => {
    expect(PROGRESS_ENTRY_SCORE_PRESETS.map((preset) => preset.label)).toEqual([
      "Base",
      "Boa resposta",
      "Dor leve",
      "Regredir carga"
    ]);

    expect(applyProgressEntryScorePreset(PROGRESS_ENTRY_SCORE_PRESETS[2])).toEqual({
      flexibilityScore: "65",
      strengthScore: "65",
      painLevel: "2"
    });
  });

  it("monta rascunho a partir da ultima evolucao clinica", () => {
    expect(buildProgressEntryDraftFromLatest(null)).toBeNull();

    expect(
      buildProgressEntryDraftFromLatest({
        id: "entry-1",
        recordedAt: "2026-05-20T09:00:00Z",
        instructorNotes: "Manter foco em mobilidade toracica.",
        flexibilityScore: 72,
        strengthScore: null,
        painLevel: 3
      })
    ).toEqual({
      instructorNotes: "Manter foco em mobilidade toracica.",
      scores: {
        flexibilityScore: "72",
        strengthScore: "70",
        painLevel: "3"
      }
    });
  });
});
