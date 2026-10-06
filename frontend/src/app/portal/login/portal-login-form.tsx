"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { readActionErrorMessage } from "@/lib/action-responses";

type PortalLoginFormProps = {
  initialError?: string;
};

export function PortalLoginForm({ initialError }: PortalLoginFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState(initialError ?? "");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    setErrorMessage("");

    const response = await fetch("/api/student-portal/session/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      setErrorMessage(await readActionErrorMessage(response, "Nao foi possivel entrar no portal."));
      return;
    }

    startTransition(() => {
      router.replace("/portal");
      router.refresh();
    });
  }

  return (
    <form
      className="mt-10 space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(async () => {
          await handleSubmit(formData);
        });
      }}
    >
      <label htmlFor="portal-email" className="block">
        <span className="mb-2 block text-sm font-medium text-brand-subtext">E-mail</span>
        <input
          id="portal-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="aluno@exemplo.com"
          className="w-full rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-brand-ink outline-none transition placeholder:text-brand-subtext/70 focus-visible:border-brand-primary focus-visible:bg-brand-surface focus-visible:ring-2 focus-visible:ring-brand-primary"
          required
        />
      </label>

      <label htmlFor="portal-password" className="block">
        <span className="mb-2 block text-sm font-medium text-brand-subtext">Senha</span>
        <input
          id="portal-password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="********"
          className="w-full rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-brand-ink outline-none transition placeholder:text-brand-subtext/70 focus-visible:border-brand-primary focus-visible:bg-brand-surface focus-visible:ring-2 focus-visible:ring-brand-primary"
          required
        />
      </label>

      {errorMessage ? (
        <div role="alert" className="rounded-2xl border border-[rgba(220,53,69,0.22)] bg-[rgba(220,53,69,0.08)] px-4 py-3 text-sm font-medium text-[#b02a37] dark:text-[#ea868f]">
          {errorMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
        aria-label={isPending ? "Entrando no portal..." : "Entrar no portal"}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-primary px-4 py-3 font-semibold text-white transition hover:bg-brand-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-75"
      >
        {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
        {isPending ? "Entrando..." : "Entrar no portal"}
      </button>
    </form>
  );
}
