"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut, LoaderCircle } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(async () => {
          await fetch("/api/session/logout", { method: "POST" });
          router.replace("/login");
          router.refresh();
        });
      }}
      className="flex items-center gap-2 rounded-full border border-brand-line bg-brand-muted px-4 py-2 text-sm text-brand-subtext transition hover:border-brand-primary/40 hover:text-brand-secondary"
    >
      {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      Sair
    </button>
  );
}
