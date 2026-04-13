import type { SessionUser } from "@/lib/auth";
import { fetchApiJson } from "@/lib/http";

export type StudentLegalAcceptance = {
  id: string;
  studentId: string;
  termType: "LGPD_DATA_PROCESSING" | "WHATSAPP_COMMUNICATION" | "CLINICAL_RECORD_SHARING" | "EVOLUTION_IMAGE_CAPTURE";
  title: string;
  termsVersion: string;
  legalBasis: string | null;
  documentHash: string;
  termBody: string;
  status: "PENDING_SIGNATURE" | "ACCEPTED";
  collectionMethod: "TABLET_SIGNATURE" | "PRINTED_SIGNATURE" | "INTERNAL_RECORD" | null;
  acceptedAt: string | null;
  evidenceNote: string | null;
  capturedByUserId: string | null;
  capturedByUserName: string | null;
  attachments: StudentLegalAcceptanceAttachment[];
  createdAt: string;
  updatedAt: string;
};

export type StudentLegalAcceptanceAttachment = {
  id: string;
  studentId: string;
  legalAcceptanceId: string;
  attachmentType: "TABLET_SIGNATURE" | "PRINTED_SIGNED_TERM";
  originalFileName: string;
  contentType: string;
  fileSize: number;
  uploadedByUserId: string;
  uploadedByUserName: string;
  createdAt: string;
};

export async function fetchStudentLegalAcceptances(session: SessionUser, studentId: string) {
  return fetchApiJson<StudentLegalAcceptance[]>(session, `/api/v1/students/${studentId}/legal-acceptances`, {
    errorMessage: "Nao foi possivel carregar os termos legais do aluno."
  });
}
