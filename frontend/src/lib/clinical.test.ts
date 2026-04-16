import { describe, expect, it } from "vitest";
import {
  getClinicalAlertSummary,
  getLatestClinicalEntry,
  getLatestClinicalEntrySummary,
  type ClinicalRecord
} from "@/lib/clinical";

const clinicalRecord: ClinicalRecord = {
  student: {
    id: "student-1",
    fullName: "Aluno Teste",
    cpf: "12345678901",
    email: "aluno@teste.local",
    phoneNumber: "85999999999",
    birthDate: "1990-01-01",
    status: "ACTIVE",
    lgpdConsent: true,
    createdAt: "2026-04-16T10:00:00Z"
  },
  anamnesis: {
    id: "anamnesis-1",
    studentId: "student-1",
    hasPathologies: false,
    pathologyDetails: null,
    hasSurgeries: false,
    surgeryDetails: null,
    hasPain: true,
    painDetails: "Dor lombar eventual.",
    hasHypertension: false,
    hasOsteoporosis: false,
    isPregnant: false,
    medicalClearanceRequired: false,
    generalObservations: "Evitar sobrecarga em flexao.",
    alerts: ["Dor lombar"],
    updatedAt: "2026-04-15T10:00:00Z"
  },
  progressEntries: [
    {
      id: "entry-1",
      studentId: "student-1",
      recordedAt: "2026-04-16T09:00:00Z",
      instructorNotes: "Boa resposta aos ajustes.",
      flexibilityScore: 75,
      strengthScore: 68,
      painLevel: 2,
      createdByUserId: "user-1",
      createdByUserName: "Instrutor Teste",
      createdAt: "2026-04-16T09:05:00Z",
      attachments: []
    }
  ]
};

describe("clinical helpers", () => {
  it("resume alertas clinicos sem expor a estrutura crua da anamnese", () => {
    expect(getClinicalAlertSummary(clinicalRecord)).toEqual({
      alerts: ["Dor lombar"],
      generalObservations: "Evitar sobrecarga em flexao.",
      hasActiveAlerts: true
    });
  });

  it("recupera a ultima evolucao clinica", () => {
    expect(getLatestClinicalEntry(clinicalRecord)?.id).toBe("entry-1");
  });

  it("monta resumo pronto para a tela do instrutor", () => {
    const summary = getLatestClinicalEntrySummary(clinicalRecord, () => "16/04/2026 09:00");

    expect(summary).toEqual({
      recordedAtLabel: "16/04/2026 09:00",
      scoreSummary: "Flexibilidade: 75 | Forca: 68 | Dor: 2",
      instructorNotes: "Boa resposta aos ajustes."
    });
  });

  it("retorna null quando nao existe evolucao ainda", () => {
    expect(getLatestClinicalEntrySummary({ ...clinicalRecord, progressEntries: [] }, () => "")).toBeNull();
  });
});
