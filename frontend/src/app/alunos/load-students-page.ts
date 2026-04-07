import type { SessionUser } from "@/lib/auth";
import { fetchClinicalRecord } from "@/lib/clinical";
import { fetchStudentLegalAcceptances } from "@/lib/legal-acceptances";
import { fetchStudentPortalAccount } from "@/lib/student-portal";
import { fetchStudents, type Student } from "@/lib/students";

export type StudentsSearchParams = {
  q?: string;
  studentId?: string;
};

function filterStudents(students: Student[], searchTerm: string) {
  if (!searchTerm) {
    return students;
  }

  return students.filter((student) => {
    const searchable = [student.fullName, student.email, student.cpf, student.phoneNumber].join(" ").toLowerCase();
    return searchable.includes(searchTerm);
  });
}

function selectStudent(students: Student[], filteredStudents: Student[], studentId?: string) {
  return (
    filteredStudents.find((student) => student.id === studentId) ??
    filteredStudents[0] ??
    students.find((student) => student.id === studentId) ??
    null
  );
}

export async function loadStudentsPage(session: SessionUser, params?: StudentsSearchParams) {
  const searchTerm = params?.q?.trim().toLowerCase() ?? "";
  const students = await fetchStudents(session);
  const filteredStudents = filterStudents(students, searchTerm);
  const selectedStudent = selectStudent(students, filteredStudents, params?.studentId);
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
    students,
    filteredStudents,
    selectedStudent,
    portalAccount,
    clinicalRecord,
    legalAcceptances,
    canViewClinicalRecord,
    metrics: {
      activeCount: students.filter((student) => student.status === "ACTIVE").length,
      inactiveCount: students.filter((student) => student.status === "INACTIVE").length,
      lgpdCount: students.filter((student) => student.lgpdConsent).length
    }
  };
}
