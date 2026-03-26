import type { ReactNode } from "react";

type KpiCardProps = {
  label: string;
  value: string;
  helper: string;
  tone: "primary" | "success" | "warning";
  icon: ReactNode;
};

const toneClasses = {
  primary: "bg-brand-soft text-brand-primary",
  success: "bg-[rgba(25,135,84,0.12)] text-brand-success",
  warning: "bg-[rgba(255,193,7,0.18)] text-brand-secondary"
};

export function KpiCard({ label, value, helper, tone, icon }: KpiCardProps) {
  return (
    <article className="rounded-[24px] border border-brand-line bg-brand-panel p-5 shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand-subtext">{label}</p>
          <p className="mt-3 font-display text-4xl text-brand-ink">{value}</p>
          <p className="mt-3 text-sm leading-6 text-brand-subtext">{helper}</p>
        </div>
        <div className={`rounded-2xl p-3 ${toneClasses[tone]}`}>{icon}</div>
      </div>
    </article>
  );
}
