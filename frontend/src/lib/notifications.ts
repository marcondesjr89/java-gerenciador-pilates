import type { SessionUser } from "@/lib/auth";
import { fetchApiJson } from "@/lib/http";

export type NotificationOutboxEntry = {
  id: string;
  channel: "WHATSAPP";
  status: "PENDING" | "SENT" | "FAILED";
  recipientReference: string;
  messageTemplate: string;
  payloadJson: string;
  attemptedAt: string | null;
  sentAt: string | null;
  errorMessage: string | null;
  createdAt: string;
};

export type NotificationOutboxSummary = {
  total: number;
  pending: number;
  sent: number;
  failed: number;
  lastAttemptedAt: string | null;
};

export async function fetchNotificationOutbox(session: SessionUser, status?: string) {
  const searchParams = new URLSearchParams();
  if (status) {
    searchParams.set("status", status);
  }

  return fetchApiJson<NotificationOutboxEntry[]>(
    session,
    `/api/v1/notifications/outbox?${searchParams.toString()}`,
    { errorMessage: "Nao foi possivel carregar o outbox de notificacoes." }
  );
}

export async function fetchNotificationOutboxSummary(session: SessionUser) {
  return fetchApiJson<NotificationOutboxSummary>(
    session,
    "/api/v1/notifications/outbox/summary",
    { errorMessage: "Nao foi possivel carregar as metricas do outbox." }
  );
}
