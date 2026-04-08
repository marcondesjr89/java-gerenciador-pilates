import { NextResponse } from "next/server";
import { proxyJsonToBackend, requireStudentPortalApiSession } from "@/app/api/_lib/proxy";

export async function GET(request: Request, context: { params: Promise<{ bookingId: string }> }) {
  const session = await requireStudentPortalApiSession("Sessao invalida para consultar remarcacao.");

  if (session instanceof Response) {
    return session;
  }

  const { bookingId } = await context.params;
  const url = new URL(request.url);
  const date = url.searchParams.get("date");

  if (!date) {
    return NextResponse.json({ message: "Informe a data desejada." }, { status: 400 });
  }

  return proxyJsonToBackend({
    session,
    path: `/api/v1/student-portal/me/bookings/${bookingId}/reschedule-options?date=${encodeURIComponent(date)}`,
    errorMessage: "Nao foi possivel carregar opcoes de remarcacao."
  });
}
