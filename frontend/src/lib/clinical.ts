import type { SessionUser } from "@/lib/auth";
import { fetchApiJson } from "@/lib/http";
import type { Student } from "@/lib/students";

export type ClinicalAttachment = {
  id: string;
  studentId: string;
  progressEntryId: string;
  originalFileName: string;
  contentType: string;
  fileSize: number;
  uploadedByUserId: string;
  uploadedByUserName: string;
  createdAt: string;
};

export type StudentAnamnesis = {
  id: string;
  studentId: string;
  hasPathologies: boolean;
  pathologyDetails: string | null;
  hasSurgeries: boolean;
  surgeryDetails: string | null;
  hasPain: boolean;
  painDetails: string | null;
  hasHypertension: boolean;
  hasOsteoporosis: boolean;
  isPregnant: boolean;
  medicalClearanceRequired: boolean;
  generalObservations: string | null;
  alerts: string[];
  updatedAt: string;
};

export type StudentProgressEntry = {
  id: string;
  studentId: string;
  recordedAt: string;
  instructorNotes: string;
  flexibilityScore: number | null;
  strengthScore: number | null;
  painLevel: number | null;
  createdByUserId: string;
  createdByUserName: string;
  createdAt: string;
  attachments: ClinicalAttachment[];
};

export type CreateStudentProgressEntryPayload = Pick<
  StudentProgressEntry,
  "recordedAt" | "instructorNotes" | "flexibilityScore" | "strengthScore" | "painLevel"
>;

export type ClinicalRecord = {
  student: Student;
  anamnesis: StudentAnamnesis | null;
  progressEntries: StudentProgressEntry[];
};

export type ClinicalAlertSummary = {
  alerts: string[];
  generalObservations: string;
  hasActiveAlerts: boolean;
};

export type ClinicalLatestEntrySummary = {
  recordedAtLabel: string;
  scoreSummary: string;
  instructorNotes: string;
} | null;

export async function fetchClinicalRecord(session: SessionUser, studentId: string) {
  return fetchApiJson<ClinicalRecord>(session, `/api/v1/students/${studentId}/clinical-record`, {
    errorMessage: "Nao foi possivel carregar o prontuario clinico."
  });
}

export type UpsertStudentAnamnesisPayload = {
  hasPathologies: boolean;
  pathologyDetails: string | null;
  hasSurgeries: boolean;
  surgeryDetails: string | null;
  hasPain: boolean;
  painDetails: string | null;
  hasHypertension: boolean;
  hasOsteoporosis: boolean;
  isPregnant: boolean;
  medicalClearanceRequired: boolean;
  generalObservations: string | null;
};

export async function saveStudentAnamnesis(
  session: SessionUser,
  studentId: string,
  payload: UpsertStudentAnamnesisPayload
) {
  return fetchApiJson<StudentAnamnesis>(session, `/api/v1/students/${studentId}/anamnesis`, {
    method: "PUT",
    body: JSON.stringify(payload),
    errorMessage: "Nao foi possivel salvar a anamnese do aluno."
  });
}

export function getClinicalAlertSummary(record: ClinicalRecord | null): ClinicalAlertSummary {
  const alerts = record?.anamnesis?.alerts ?? [];

  return {
    alerts,
    generalObservations: record?.anamnesis?.generalObservations || "Sem observacoes gerais registradas.",
    hasActiveAlerts: alerts.length > 0
  };
}

export function getLatestClinicalEntry(record: ClinicalRecord | null) {
  return record?.progressEntries[0] ?? null;
}

export function getLatestClinicalEntrySummary(
  record: ClinicalRecord | null,
  formatDateTime: (value: string, options?: Intl.DateTimeFormatOptions) => string
): ClinicalLatestEntrySummary {
  const latestEntry = getLatestClinicalEntry(record);

  if (!latestEntry) {
    return null;
  }

  return {
    recordedAtLabel: formatDateTime(latestEntry.recordedAt, {
      dateStyle: "short",
      timeStyle: "short"
    }),
    scoreSummary: `Flexibilidade: ${latestEntry.flexibilityScore ?? "-"} | Forca: ${latestEntry.strengthScore ?? "-"} | Dor: ${latestEntry.painLevel ?? "-"}`,
    instructorNotes: latestEntry.instructorNotes
  };
}
