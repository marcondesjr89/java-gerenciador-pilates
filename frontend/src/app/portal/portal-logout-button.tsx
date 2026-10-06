"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, LogOut } from "lucide-react";

export function PortalLogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      aria-busy={isPending}
      aria-label="Sair do portal do aluno"
      onClick={() => {
        startTransition(async () => {
          await fetch("/api/student-portal/session/logout", {
            method: "POST"
          });
          router.replace("/portal/login");
          router.refresh();
        });
      }}
      className="flex items-center gap-2 rounded-full border border-brand-line bg-brand-surface px-4 py-2 text-sm font-semibold text-brand-secondary transition hover:border-brand-primary/30 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      Sair
    </button>
  );
}
