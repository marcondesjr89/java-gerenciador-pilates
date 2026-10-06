import { redirect } from "next/navigation";
import { ArrowRight, HeartPulse, ShieldCheck } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LoginForm } from "@/app/login/login-form";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  forbidden: "Seu usuario autenticou, mas nao tem acesso ao painel interno."
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSessionUser();
  if (session && (session.role === "ADMIN" || session.role === "RECEPTION")) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const initialError = params?.error ? errorMessages[params.error] : undefined;

  return (
    <main className="min-h-screen bg-[var(--login-background)] px-4 py-8 text-brand-ink">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[32px] border border-brand-line bg-brand-surface/90 p-8 shadow-panel backdrop-blur lg:p-12">
          <div className="flex items-center justify-between gap-4">
            <span className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-secondary">
              Studio Intelligence
            </span>
            <ThemeToggle />
          </div>

          <h1 className="mt-6 max-w-xl font-display text-5xl leading-tight text-brand-secondary lg:text-6xl">
            Operacao clinica e financeira pensada para pilates.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-brand-subtext">
            A base do frontend ja nasce preparada para agenda, prontuario, indicadores e fluxo de caixa,
            com leitura rapida em desktop e tablet.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <article className="rounded-[24px] border border-brand-line bg-brand-panel p-5">
              <HeartPulse className="h-5 w-5 text-brand-primary" />
              <p className="mt-4 text-lg font-semibold">Prontuario acessivel</p>
              <p className="mt-2 text-sm leading-6 text-brand-subtext">
                Alertas clinicos e evolucao do aluno prontos para a interface do instrutor.
              </p>
            </article>

            <article className="rounded-[24px] border border-brand-line bg-brand-panel p-5">
              <ShieldCheck className="h-5 w-5 text-brand-primary" />
              <p className="mt-4 text-lg font-semibold">Fluxo seguro</p>
              <p className="mt-2 text-sm leading-6 text-brand-subtext">
                Estrutura preparada para autenticacao, perfis e crescimento modular.
              </p>
            </article>
          </div>
        </section>

        <section className="rounded-[32px] border border-brand-line bg-brand-surface p-8 text-brand-ink shadow-panel lg:p-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-brand-primary">Acesso</p>
              <h2 className="mt-2 font-display text-4xl text-brand-secondary">Entrar no painel</h2>
            </div>
            <div className="rounded-full bg-brand-soft p-3 text-brand-primary">
              <ArrowRight className="h-6 w-6" />
            </div>
          </div>

          <LoginForm initialError={initialError} />

          <div className="mt-8 rounded-[28px] border border-brand-line bg-brand-panel p-5">
            <p className="text-sm font-semibold text-brand-secondary">Acesso seguro ao estúdio</p>
            <p className="mt-2 text-sm leading-6 text-brand-subtext">
              Entre com suas credenciais cadastradas para gerenciar a agenda, prontuários clínicos e finanças.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
