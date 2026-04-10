import type { SessionUser } from "@/lib/auth";
import { fetchApiJson } from "@/lib/http";

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
  return fetchApiJson<DashboardKpiResponse>(session, `/api/v1/dashboard/kpis?${searchParams.toString()}`, {
    errorMessage: "Nao foi possivel carregar os indicadores do dashboard."
  });
}
