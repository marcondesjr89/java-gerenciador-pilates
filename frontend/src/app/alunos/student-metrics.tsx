import { ShieldCheck, UserRound, UsersRound } from "lucide-react";

type StudentMetricsProps = {
  studentsCount: number;
  activeCount: number;
  inactiveCount: number;
  lgpdCount: number;
};

export function StudentMetrics({ studentsCount, activeCount, inactiveCount, lgpdCount }: StudentMetricsProps) {
  return (
    <section className="grid gap-5 xl:grid-cols-3">
      <article className="rounded-[24px] border border-brand-line bg-brand-panel p-5 shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-brand-subtext">Base total</p>
            <p className="mt-3 font-display text-4xl text-brand-ink">{studentsCount}</p>
            <p className="mt-3 text-sm leading-6 text-brand-subtext">Alunos cadastrados no backend.</p>
          </div>
          <div className="rounded-2xl bg-brand-soft p-3 text-brand-primary">
            <UsersRound className="h-5 w-5" />
          </div>
        </div>
      </article>

      <article className="rounded-[24px] border border-brand-line bg-brand-panel p-5 shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-brand-subtext">Ativos x inativos</p>
            <p className="mt-3 font-display text-4xl text-brand-ink">{activeCount}</p>
            <p className="mt-3 text-sm leading-6 text-brand-subtext">
              {inactiveCount} inativo(s) para acompanhamento comercial e clinico.
            </p>
          </div>
          <div className="rounded-2xl bg-[rgba(13,110,253,0.1)] p-3 text-brand-info">
            <UserRound className="h-5 w-5" />
          </div>
        </div>
      </article>

      <article className="rounded-[24px] border border-brand-line bg-brand-panel p-5 shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-brand-subtext">LGPD registrado</p>
            <p className="mt-3 font-display text-4xl text-brand-ink">{lgpdCount}</p>
            <p className="mt-3 text-sm leading-6 text-brand-subtext">
              {studentsCount - lgpdCount} cadastro(s) ainda sem consentimento marcado.
            </p>
          </div>
          <div className="rounded-2xl bg-[rgba(25,135,84,0.12)] p-3 text-brand-success">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
      </article>
    </section>
  );
}
