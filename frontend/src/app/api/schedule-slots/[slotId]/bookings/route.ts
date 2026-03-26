import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    slotId: string;
  }>;
};

type BackendProblem = {
  detail?: string;
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

export async function POST(request: Request, context: RouteContext) {
  const session = await getSessionUser();

  if (!session || (session.role !== "ADMIN" && session.role !== "RECEPTION")) {
    return NextResponse.json({ message: "Sessao invalida para reservar aluno." }, { status: 401 });
  }

  const { slotId } = await context.params;
  const body = (await request.json()) as {
    studentId?: string;
  };

  const response = await fetch(`${API_BASE_URL}/api/v1/schedule-slots/${slotId}/bookings`, {
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
      { message: problem.detail || "Nao foi possivel reservar o aluno." },
      { status: response.status }
    );
  }

  return NextResponse.json(await response.json(), { status: 201 });
}
