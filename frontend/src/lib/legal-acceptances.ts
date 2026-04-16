import { API_BASE_URL } from "@/lib/api";
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
  auditIpAddress: string | null;
  auditUserAgent: string | null;
  auditSessionKey: string | null;
  auditCollectionOrigin: string | null;
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

export type StudentLegalAcceptanceVerification = {
  acceptanceId: string;
  studentId: string;
  studentName: string;
  studentCpfMasked: string;
  issuerName: string;
  issuerDocument: string;
  termType: StudentLegalAcceptance["termType"];
  title: string;
  termsVersion: string;
  legalBasis: string | null;
  documentHash: string;
  status: StudentLegalAcceptance["status"];
  collectionMethod: StudentLegalAcceptance["collectionMethod"];
  acceptedAt: string | null;
  createdAt: string;
  capturedByUserName: string | null;
  verificationCode: string;
  documentReference: string;
  verificationStatement: string;
  verified: boolean;
};

export async function fetchStudentLegalAcceptances(session: SessionUser, studentId: string) {
  return fetchApiJson<StudentLegalAcceptance[]>(session, `/api/v1/students/${studentId}/legal-acceptances`, {
    errorMessage: "Nao foi possivel carregar os termos legais do aluno."
  });
}

export async function fetchStudentLegalAcceptanceVerification(acceptanceId: string, code: string) {
  const searchParams = new URLSearchParams({ code });
  const response = await fetch(
    `${API_BASE_URL}/api/v1/public/legal-acceptances/${acceptanceId}/verification?${searchParams.toString()}`,
    {
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error("Nao foi possivel validar o QR Code do aceite legal.");
  }

  return response.json() as Promise<StudentLegalAcceptanceVerification>;
}
