"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Hourglass, LoaderCircle } from "lucide-react";

type JoinWaitlistButtonProps = {
  slotId: string;
};

export function JoinWaitlistButton({ slotId }: JoinWaitlistButtonProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            setErrorMessage("");

            const response = await fetch(`/api/student-portal/schedule-slots/${slotId}/waitlist`, {
              method: "POST"
            });

            if (!response.ok) {
              const payload = (await response.json().catch(() => ({ message: "" }))) as { message?: string };
              setErrorMessage(payload.message || "Nao foi possivel entrar na lista de espera.");
              return;
            }

            router.refresh();
          });
        }}
        className="flex items-center gap-2 rounded-2xl border border-brand-line bg-brand-panel px-4 py-2 text-sm font-semibold text-brand-secondary transition hover:border-brand-primary/30 hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Hourglass className="h-4 w-4" />}
        {isPending ? "Entrando..." : "Entrar na espera"}
      </button>

      {errorMessage ? <p className="text-sm text-brand-danger">{errorMessage}</p> : null}
    </div>
  );
}
