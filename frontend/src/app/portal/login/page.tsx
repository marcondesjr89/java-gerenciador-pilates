import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, HeartHandshake, ShieldCheck } from "lucide-react";
import { getStudentPortalSessionUser } from "@/lib/student-portal-auth";
import { PortalLoginForm } from "@/app/portal/login/portal-login-form";

type PortalLoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function PortalLoginPage({ searchParams }: PortalLoginPageProps) {
  const session = await getStudentPortalSessionUser();

  if (session) {
    redirect("/portal");
  }

  const params = await searchParams;
  const initialError =
    params?.error === "forbidden" ? "Sua sessao do portal nao esta valida." : undefined;

  return (
    <main className="min-h-screen bg-[var(--login-background)] px-4 py-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[32px] bg-[var(--hero-background)] p-8 text-white shadow-panel lg:p-10">
          <div className="flex h-full flex-col justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-white/72">Portal do aluno</p>
              <h1 className="mt-5 max-w-xl font-display text-5xl leading-tight">
                Sua rotina no Pilates, com reservas e acompanhamento em um so lugar.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-8 text-white/82">
                Consulte suas reservas ativas, acompanhe seus horarios e cancele com antecedencia
                minima quando precisar reorganizar a semana.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <article className="rounded-[24px] border border-white/14 bg-white/10 p-4 backdrop-blur">
                <CalendarDays className="h-5 w-5 text-white/80" />
                <p className="mt-4 text-sm font-semibold">Agenda clara</p>
                <p className="mt-2 text-sm leading-6 text-white/70">Veja aulas confirmadas com horario e instrutor.</p>
              </article>

              <article className="rounded-[24px] border border-white/14 bg-white/10 p-4 backdrop-blur">
                <HeartHandshake className="h-5 w-5 text-white/80" />
                <p className="mt-4 text-sm font-semibold">Autonomia com seguranca</p>
                <p className="mt-2 text-sm leading-6 text-white/70">Cancele reservas dentro da politica configurada.</p>
              </article>

              <article className="rounded-[24px] border border-white/14 bg-white/10 p-4 backdrop-blur">
                <ShieldCheck className="h-5 w-5 text-white/80" />
                <p className="mt-4 text-sm font-semibold">Acesso individual</p>
                <p className="mt-2 text-sm leading-6 text-white/70">Entre com o e-mail e a senha criados pela recepcao.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-brand-line bg-brand-surface p-8 shadow-panel lg:p-10">
          <div className="max-w-md">
            <p className="text-sm uppercase tracking-[0.28em] text-brand-primary">Acesso pessoal</p>
            <h2 className="mt-4 font-display text-4xl text-brand-secondary">Entrar no portal</h2>
            <p className="mt-3 text-sm leading-7 text-brand-subtext">
              Use o e-mail e a senha enviados para a sua conta do portal do aluno.
            </p>

            <PortalLoginForm initialError={initialError} />

            <div className="mt-8 rounded-[24px] border border-brand-line bg-brand-soft px-5 py-4 text-sm text-brand-secondary">
              Se ainda nao recebeu acesso, entre em contato com a recepcao do studio.
            </div>

            <p className="mt-6 text-sm text-brand-subtext">
              Painel interno? <Link href="/login" className="font-semibold text-brand-primary">Acessar administracao</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
