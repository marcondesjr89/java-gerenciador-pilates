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
      action={(formData) => {
        startTransition(async () => {
          await handleSubmit(formData);
        });
      }}
    >
      <label className="block">
        <span className="mb-2 block text-sm text-brand-subtext">E-mail</span>
        <input
          name="email"
          type="email"
          placeholder="aluno@exemplo.com"
          className="w-full rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-brand-ink outline-none transition placeholder:text-brand-subtext/70 focus:border-brand-primary focus:bg-brand-surface"
          required
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm text-brand-subtext">Senha</span>
        <input
          name="password"
          type="password"
          placeholder="********"
          className="w-full rounded-2xl border border-brand-line bg-brand-panel px-4 py-3 text-brand-ink outline-none transition placeholder:text-brand-subtext/70 focus:border-brand-primary focus:bg-brand-surface"
          required
        />
      </label>

      {errorMessage ? (
        <div className="rounded-2xl border border-brand-line bg-brand-soft px-4 py-3 text-sm text-brand-secondary">
          {errorMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-primary px-4 py-3 font-semibold text-white transition hover:bg-brand-primaryHover disabled:cursor-not-allowed disabled:opacity-75"
      >
        {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
        {isPending ? "Entrando..." : "Entrar no portal"}
      </button>
    </form>
  );
}
