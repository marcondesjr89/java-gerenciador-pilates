import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";

type BackendProblem = {
  detail?: string;
};

export async function POST(
  request: Request,
  context: { params: Promise<{ studentId: string; progressEntryId: string }> }
) {
  const session = await getSessionUser();

  if (!session || (session.role !== "ADMIN" && session.role !== "INSTRUCTOR")) {
    return NextResponse.json({ message: "Sessao invalida para anexar arquivo clinico." }, { status: 401 });
  }

  const { studentId, progressEntryId } = await context.params;
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Arquivo clinico nao informado." }, { status: 400 });
  }

  const backendFormData = new FormData();
  backendFormData.set("file", file);

  const response = await fetch(`${API_BASE_URL}/api/v1/students/${studentId}/progress-entries/${progressEntryId}/attachments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.accessToken}`
    },
    body: backendFormData,
    cache: "no-store"
  });

  if (!response.ok) {
    const problem = (await response.json().catch(() => ({}))) as BackendProblem;
    return NextResponse.json(
      { message: problem.detail || "Nao foi possivel anexar o arquivo clinico." },
      { status: response.status }
    );
  }

  return NextResponse.json(await response.json(), { status: response.status });
}
