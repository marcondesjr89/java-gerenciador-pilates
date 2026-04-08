import { NextResponse } from "next/server";
import { proxyFormDataToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";

export async function POST(
  request: Request,
  context: { params: Promise<{ studentId: string; progressEntryId: string }> }
) {
  const session = await requireInternalApiSession(["ADMIN", "INSTRUCTOR"], "Sessao invalida para anexar arquivo clinico.");

  if (session instanceof Response) {
    return session;
  }

  const { studentId, progressEntryId } = await context.params;
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Arquivo clinico nao informado." }, { status: 400 });
  }

  const backendFormData = new FormData();
  backendFormData.set("file", file);

  return proxyFormDataToBackend({
    session,
    path: `/api/v1/students/${studentId}/progress-entries/${progressEntryId}/attachments`,
    formData: backendFormData,
    errorMessage: "Nao foi possivel anexar o arquivo clinico."
  });
}
