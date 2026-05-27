import type { CreateStudentProgressEntryPayload } from "@/lib/clinical";

export type ProgressEntryNoteTemplate = {
  label: string;
  text: string;
};

export type ProgressEntryScoreState = {
  flexibilityScore: string;
  strengthScore: string;
  painLevel: string;
};

export type ProgressEntryScorePreset = {
  label: string;
  values: ProgressEntryScoreState;
};

export const PROGRESS_ENTRY_NOTE_TEMPLATES: ProgressEntryNoteTemplate[] = [
  {
    label: "Estavel",
    text: "Sessao realizada sem intercorrencias. Aluno manteve boa tolerancia aos exercicios propostos."
  },
  {
    label: "Dor relatada",
    text: "Aluno relatou desconforto durante a sessao. Carga ajustada e foco mantido em controle, mobilidade e seguranca."
  },
  {
    label: "Progressao",
    text: "Aluno apresentou boa resposta e pode evoluir gradualmente complexidade, amplitude ou resistencia na proxima sessao."
  }
];

export const PROGRESS_ENTRY_SCORE_PRESETS: ProgressEntryScorePreset[] = [
  {
    label: "Base",
    values: {
      flexibilityScore: "70",
      strengthScore: "70",
      painLevel: "0"
    }
  },
  {
    label: "Boa resposta",
    values: {
      flexibilityScore: "80",
      strengthScore: "80",
      painLevel: "0"
    }
  },
  {
    label: "Dor leve",
    values: {
      flexibilityScore: "65",
      strengthScore: "65",
      painLevel: "2"
    }
  },
  {
    label: "Regredir carga",
    values: {
      flexibilityScore: "50",
      strengthScore: "50",
      painLevel: "5"
    }
  }
];

export function appendProgressEntryNoteTemplate(currentNotes: string, templateText: string) {
  const normalizedCurrentNotes = currentNotes.trim();
  const normalizedTemplateText = templateText.trim();

  if (!normalizedCurrentNotes) {
    return normalizedTemplateText;
  }

  if (!normalizedTemplateText) {
    return normalizedCurrentNotes;
  }

  return `${normalizedCurrentNotes}\n\n${normalizedTemplateText}`;
}

export function applyProgressEntryScorePreset(preset: ProgressEntryScorePreset): ProgressEntryScoreState {
  return {
    flexibilityScore: preset.values.flexibilityScore,
    strengthScore: preset.values.strengthScore,
    painLevel: preset.values.painLevel
  };
}

export function buildProgressEntryPayload(formData: FormData): CreateStudentProgressEntryPayload {
  const recordedAtValue = String(formData.get("recordedAt") ?? "");

  return {
    recordedAt: new Date(recordedAtValue).toISOString(),
    instructorNotes: String(formData.get("instructorNotes") ?? "").trim(),
    flexibilityScore: Number(formData.get("flexibilityScore") ?? 0),
    strengthScore: Number(formData.get("strengthScore") ?? 0),
    painLevel: Number(formData.get("painLevel") ?? 0)
  };
}

export function getOptionalProgressEntryAttachment(formData: FormData) {
  const attachment = formData.get("attachment");
  return attachment instanceof File && attachment.size > 0 ? attachment : null;
}
