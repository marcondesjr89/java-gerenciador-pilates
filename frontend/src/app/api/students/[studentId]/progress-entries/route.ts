import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";

type BackendProblem = {
  detail?: string;
};

export async function POST(request: Request, context: { params: Promise<{ studentId: string }> }) {
  const session = await getSessionUser();

  if (!session || (session.role !== "ADMIN" && session.role !== "INSTRUCTOR")) {
    return NextResponse.json({ message: "Sessao invalida para lancar evolucao." }, { status: 401 });
  }

  const { studentId } = await context.params;
  const body = await request.json();
  const response = await fetch(`${API_BASE_URL}/api/v1/students/${studentId}/progress-entries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`
    },
    body: JSON.stringify(body),
    cache: "no-store"
  });

  if (!response.ok) {
    const problem = (await response.json().catch(() => ({}))) as BackendProblem;
    return NextResponse.json(
      { message: problem.detail || "Nao foi possivel registrar a evolucao." },
      { status: response.status }
    );
  }

  return NextResponse.json(await response.json(), { status: response.status });
}
