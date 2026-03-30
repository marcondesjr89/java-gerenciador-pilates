import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";
import { getStudentPortalSessionUser } from "@/lib/student-portal-auth";

type BackendProblem = {
  detail?: string;
};

export async function POST(request: Request, context: { params: Promise<{ bookingId: string }> }) {
  const session = await getStudentPortalSessionUser();

  if (!session) {
    return NextResponse.json({ message: "Sessao invalida para remarcacao." }, { status: 401 });
  }

  const { bookingId } = await context.params;
  const body = await request.json();
  const response = await fetch(`${API_BASE_URL}/api/v1/student-portal/me/bookings/${bookingId}/reschedule`, {
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
      { message: problem.detail || "Nao foi possivel remarcar a reserva." },
      { status: response.status }
    );
  }

  return NextResponse.json(await response.json(), { status: response.status });
}
