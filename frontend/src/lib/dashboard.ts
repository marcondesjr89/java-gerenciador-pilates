import { API_BASE_URL } from "@/lib/api";
import type { SessionUser } from "@/lib/auth";

export type DashboardIndicator = {
  key: string;
  label: string;
  value: number;
  unit: string;
  description: string;
};

export type DashboardKpiResponse = {
  startDate: string;
  endDate: string;
  indicators: DashboardIndicator[];
};

export async function fetchDashboardKpis(session: SessionUser, startDate: string, endDate: string) {
  const searchParams = new URLSearchParams({ startDate, endDate });
  const response = await fetch(`${API_BASE_URL}/api/v1/dashboard/kpis?${searchParams.toString()}`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`
    },
    cache: "no-store"
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("SESSION_FORBIDDEN");
  }

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar os indicadores do dashboard.");
  }

  return (await response.json()) as DashboardKpiResponse;
}
