import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    blockId: string;
  }>;
};

type BackendProblem = {
  detail?: string;
};

function forbidden(message: string) {
  return NextResponse.json({ message }, { status: 401 });
}

export async function PUT(request: Request, context: RouteContext) {
  const session = await getSessionUser();

  if (!session || (session.role !== "ADMIN" && session.role !== "RECEPTION")) {
    return forbidden("Sessao invalida para editar bloqueio.");
  }

  const { blockId } = await context.params;
  const body = await request.json();
  const response = await fetch(`${API_BASE_URL}/api/v1/schedule-blocks/${blockId}`, {
    method: "PUT",
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
      { message: problem.detail || "Nao foi possivel editar o bloqueio." },
      { status: response.status }
    );
  }

  return NextResponse.json(await response.json());
}

export async function DELETE(_: Request, context: RouteContext) {
  const session = await getSessionUser();

  if (!session || (session.role !== "ADMIN" && session.role !== "RECEPTION")) {
    return forbidden("Sessao invalida para remover bloqueio.");
  }

  const { blockId } = await context.params;
  const response = await fetch(`${API_BASE_URL}/api/v1/schedule-blocks/${blockId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${session.accessToken}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const problem = (await response.json().catch(() => ({}))) as BackendProblem;
    return NextResponse.json(
      { message: problem.detail || "Nao foi possivel remover o bloqueio." },
      { status: response.status }
    );
  }

  return new NextResponse(null, { status: 204 });
}
