import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    slotId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await getSessionUser();

  if (!session || (session.role !== "ADMIN" && session.role !== "RECEPTION")) {
    return NextResponse.json({ message: "Sessao invalida para consultar reservas." }, { status: 401 });
  }

  const { slotId } = await context.params;
  const response = await fetch(`${API_BASE_URL}/api/v1/schedule-slots/${slotId}/bookings`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    return NextResponse.json(payload, { status: response.status });
  }

  return NextResponse.json(await response.json());
}
