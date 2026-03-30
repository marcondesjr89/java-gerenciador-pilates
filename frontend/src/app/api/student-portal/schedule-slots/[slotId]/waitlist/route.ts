import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";
import { getStudentPortalSessionUser } from "@/lib/student-portal-auth";

type BackendProblem = {
  detail?: string;
};

export async function POST(request: Request, context: { params: Promise<{ slotId: string }> }) {
  const session = await getStudentPortalSessionUser();

  if (!session) {
    return NextResponse.json({ message: "Sessao invalida para entrar na lista de espera." }, { status: 401 });
  }

  const { slotId } = await context.params;
  const response = await fetch(`${API_BASE_URL}/api/v1/student-portal/me/schedule-slots/${slotId}/waitlist`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.accessToken}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const problem = (await response.json().catch(() => ({}))) as BackendProblem;
    return NextResponse.json(
      { message: problem.detail || "Nao foi possivel entrar na lista de espera." },
      { status: response.status }
    );
  }

  return NextResponse.json(await response.json(), { status: response.status });
}
