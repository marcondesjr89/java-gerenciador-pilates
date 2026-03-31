import { API_BASE_URL } from "@/lib/api";
import type { SessionUser } from "@/lib/auth";

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

export async function fetchNotificationOutbox(session: SessionUser, status?: string) {
  const searchParams = new URLSearchParams();
  if (status) {
    searchParams.set("status", status);
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/notifications/outbox?${searchParams.toString()}`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`
    },
    cache: "no-store"
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("SESSION_FORBIDDEN");
  }

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar o outbox de notificacoes.");
  }

  return (await response.json()) as NotificationOutboxEntry[];
}
