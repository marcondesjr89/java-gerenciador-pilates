import type { ReactNode } from "react";

export function SectionCard({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-brand-line bg-brand-panel p-6 shadow-panel">
      <div className="mb-5">
        <h2 className="font-display text-2xl text-brand-secondary">{title}</h2>
        <p className="mt-1 text-sm text-brand-subtext">{description}</p>
      </div>
      {children}
    </section>
  );
}
