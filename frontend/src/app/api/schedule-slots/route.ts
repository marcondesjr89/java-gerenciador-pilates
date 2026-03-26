import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";

type BackendProblem = {
  detail?: string;
};

export async function POST(request: Request) {
  const session = await getSessionUser();

  if (!session || (session.role !== "ADMIN" && session.role !== "RECEPTION")) {
    return NextResponse.json({ message: "Sessao invalida para criar horario." }, { status: 401 });
  }

  const body = (await request.json()) as {
    instructorUserId?: string;
    requiredSpecialty?: string;
    startTime?: string;
    endTime?: string;
    capacity?: number;
  };

  const response = await fetch(`${API_BASE_URL}/api/v1/schedule-slots`, {
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
      { message: problem.detail || "Nao foi possivel criar o horario." },
      { status: response.status }
    );
  }

  const payload = await response.json();
  return NextResponse.json(payload, { status: 201 });
}
