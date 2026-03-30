import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";
import { getStudentPortalSessionUser } from "@/lib/student-portal-auth";

type BackendProblem = {
  detail?: string;
};

export async function GET(request: Request, context: { params: Promise<{ bookingId: string }> }) {
  const session = await getStudentPortalSessionUser();

  if (!session) {
    return NextResponse.json({ message: "Sessao invalida para consultar remarcacao." }, { status: 401 });
  }

  const { bookingId } = await context.params;
  const url = new URL(request.url);
  const date = url.searchParams.get("date");

  if (!date) {
    return NextResponse.json({ message: "Informe a data desejada." }, { status: 400 });
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/student-portal/me/bookings/${bookingId}/reschedule-options?date=${encodeURIComponent(date)}`,
    {
      headers: {
        Authorization: `Bearer ${session.accessToken}`
      },
      cache: "no-store"
    }
  );

  if (!response.ok) {
    const problem = (await response.json().catch(() => ({}))) as BackendProblem;
    return NextResponse.json(
      { message: problem.detail || "Nao foi possivel carregar opcoes de remarcacao." },
      { status: response.status }
    );
  }

  return NextResponse.json(await response.json(), { status: response.status });
}
