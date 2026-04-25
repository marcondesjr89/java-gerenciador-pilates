import { describe, expect, it } from "vitest";
import { buildProgressEntryPayload, getOptionalProgressEntryAttachment } from "@/app/instrutor/progress-entry-form-logic";

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
});
