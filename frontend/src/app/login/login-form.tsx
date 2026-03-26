"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle } from "lucide-react";

type LoginFormProps = {
  initialError?: string;
};

export function LoginForm({ initialError }: LoginFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState(initialError ?? "");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    setErrorMessage("");

    const response = await fetch("/api/session/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({ message: "" }))) as { message?: string };
      setErrorMessage(payload.message || "Nao foi possivel entrar no painel.");
      return;
    }

    startTransition(() => {
      router.replace("/dashboard");
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
        <span className="mb-2 block text-sm text-white/74">E-mail</span>
        <input
          name="email"
          type="email"
          placeholder="admin@gerenciadorpilates.local"
          className="w-full rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-white outline-none transition focus:border-white/50 focus:bg-white/12"
          required
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm text-white/74">Senha</span>
        <input
          name="password"
          type="password"
          placeholder="********"
          className="w-full rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-white outline-none transition focus:border-white/50 focus:bg-white/12"
          required
        />
      </label>

      {errorMessage ? (
        <div className="rounded-2xl border border-white/18 bg-white/10 px-4 py-3 text-sm text-white/88">
          {errorMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-primary px-4 py-3 font-semibold text-white transition hover:bg-brand-primaryHover disabled:cursor-not-allowed disabled:opacity-75"
      >
        {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
        {isPending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
