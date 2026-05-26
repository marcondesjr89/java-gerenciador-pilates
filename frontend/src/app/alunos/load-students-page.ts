import type { SessionUser } from "@/lib/auth";
import { fetchClinicalRecord } from "@/lib/clinical";
import { fetchStudentLegalAcceptances } from "@/lib/legal-acceptances";
import { fetchStudentPortalAccount } from "@/lib/student-portal";
import { fetchStudentById, searchStudents } from "@/lib/students";

export type StudentsSearchParams = {
  q?: string;
  studentId?: string;
  page?: string;
};

export async function loadStudentsPage(session: SessionUser, params?: StudentsSearchParams) {
  const searchTerm = params?.q?.trim() ?? "";
  const currentPage = Number.isFinite(Number(params?.page)) ? Math.max(Number(params?.page), 0) : 0;
  const searchResult = await searchStudents(session, {
    q: searchTerm,
    page: currentPage,
    size: 20
  });
  const filteredStudents = searchResult.items;
  const selectedStudentFromPage =
    filteredStudents.find((student) => student.id === params?.studentId) ?? filteredStudents[0] ?? null;
  const selectedStudent =
    !selectedStudentFromPage && params?.studentId
      ? await fetchStudentById(session, params.studentId).catch(() => null)
      : selectedStudentFromPage;
  const canViewClinicalRecord = session.role === "ADMIN";
  const selectedStudentId = selectedStudent?.id ?? null;
  const [portalAccount, clinicalRecord, legalAcceptances] = selectedStudentId
    ? await Promise.all([
        fetchStudentPortalAccount(session, selectedStudentId),
        canViewClinicalRecord ? fetchClinicalRecord(session, selectedStudentId) : Promise.resolve(null),
        fetchStudentLegalAcceptances(session, selectedStudentId)
      ])
    : [null, null, []];

  return {
    filteredStudents,
    selectedStudent,
    portalAccount,
    clinicalRecord,
    legalAcceptances,
    canViewClinicalRecord,
    pagination: {
      page: searchResult.page,
      size: searchResult.size,
      totalElements: searchResult.totalElements,
      totalPages: searchResult.totalPages
    },
    metrics: {
      totalCount: searchResult.summary.totalStudents,
      activeCount: searchResult.summary.activeStudents,
      inactiveCount: searchResult.summary.inactiveStudents,
      lgpdCount: searchResult.summary.lgpdStudents
    }
  };
}
