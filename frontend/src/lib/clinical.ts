import type { SessionUser } from "@/lib/auth";
import { fetchApiJson } from "@/lib/http";

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

export type ClinicalRecord = {
  student: {
    id: string;
  };
  anamnesis: StudentAnamnesis | null;
  progressEntries: StudentProgressEntry[];
};

export async function fetchClinicalRecord(session: SessionUser, studentId: string) {
  return fetchApiJson<ClinicalRecord>(session, `/api/v1/students/${studentId}/clinical-record`, {
    errorMessage: "Nao foi possivel carregar o prontuario clinico."
  });
}
