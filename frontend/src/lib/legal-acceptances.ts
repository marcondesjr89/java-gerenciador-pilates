import { API_BASE_URL } from "@/lib/api";
import type { SessionUser } from "@/lib/auth";

export type StudentLegalAcceptance = {
  id: string;
  studentId: string;
  termType: "LGPD_DATA_PROCESSING" | "WHATSAPP_COMMUNICATION" | "CLINICAL_RECORD_SHARING";
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
  createdAt: string;
  updatedAt: string;
};

export async function fetchStudentLegalAcceptances(session: SessionUser, studentId: string) {
  const response = await fetch(`${API_BASE_URL}/api/v1/students/${studentId}/legal-acceptances`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`
    },
    cache: "no-store"
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("SESSION_FORBIDDEN");
  }

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar os termos legais do aluno.");
  }

  return (await response.json()) as StudentLegalAcceptance[];
}
