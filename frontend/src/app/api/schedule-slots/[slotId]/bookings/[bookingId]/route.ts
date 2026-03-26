import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    slotId: string;
    bookingId: string;
  }>;
};

type BackendProblem = {
  detail?: string;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getSessionUser();

  if (!session || (session.role !== "ADMIN" && session.role !== "RECEPTION")) {
    return NextResponse.json({ message: "Sessao invalida para cancelar reserva." }, { status: 401 });
  }

  const { slotId, bookingId } = await context.params;
  const response = await fetch(`${API_BASE_URL}/api/v1/schedule-slots/${slotId}/bookings/${bookingId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${session.accessToken}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const problem = (await response.json().catch(() => ({}))) as BackendProblem;
    return NextResponse.json(
      { message: problem.detail || "Nao foi possivel cancelar a reserva." },
      { status: response.status }
    );
  }

  return NextResponse.json(await response.json());
}
