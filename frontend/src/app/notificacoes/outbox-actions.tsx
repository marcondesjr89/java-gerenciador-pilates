"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Play, RotateCw } from "lucide-react";
import { readActionErrorMessage } from "@/lib/action-responses";

export function ProcessOutboxButton() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleProcess() {
    startTransition(async () => {
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch("/api/notifications/outbox/process", {
        method: "POST"
      });

      if (!response.ok) {
        setErrorMessage(await readActionErrorMessage(response, "Não foi possível processar a fila."));
        return;
      }

      const data = (await response.json().catch(() => ({}))) as { processed?: number };
      const count = data.processed ?? 0;
      setSuccessMessage(
        count > 0
          ? `${count} notificação(ões) processada(s) com sucesso.`
          : "Nenhuma notificação pendente para processar no momento."
      );
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        disabled={isPending}
        aria-busy={isPending}
        onClick={handleProcess}
        className="flex items-center gap-2 rounded-2xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
        {isPending ? "Processando..." : "Processar fila agora"}
      </button>

      {successMessage ? (
        <span role="status" className="text-xs text-brand-success font-medium">
          {successMessage}
        </span>
      ) : null}

      {errorMessage ? (
        <span role="alert" className="text-xs text-brand-danger font-medium">
          {errorMessage}
        </span>
      ) : null}
    </div>
  );
}

export function RetryNotificationButton({ entryId }: { entryId: string }) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleRetry() {
    startTransition(async () => {
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(`/api/notifications/outbox/${entryId}/retry`, {
        method: "POST"
      });

      if (!response.ok) {
        setErrorMessage(await readActionErrorMessage(response, "Falha ao reenviar notificação."));
        return;
      }

      setSuccessMessage("Reenvio solicitado.");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={isPending}
        aria-busy={isPending}
        onClick={handleRetry}
        className="flex items-center gap-1.5 rounded-xl border border-brand-line bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand-ink transition hover:border-brand-primary hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <RotateCw className="h-3.5 w-3.5" />}
        {isPending ? "Reenviando..." : "Tentar novamente"}
      </button>

      {successMessage ? (
        <span role="status" className="text-[11px] text-brand-success font-medium">
          {successMessage}
        </span>
      ) : null}

      {errorMessage ? (
        <span role="alert" className="text-[11px] text-brand-danger font-medium">
          {errorMessage}
        </span>
      ) : null}
    </div>
  );
}
