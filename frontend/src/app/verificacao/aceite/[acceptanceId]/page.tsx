import { ShieldCheck, ShieldX, FileCheck2, Fingerprint, ScanSearch } from "lucide-react";
import {
  formatCollectionMethod,
  formatDateTimeWithTimezone,
  formatLegalStatus,
  formatLegalTermType,
  formatLegalTermTypes
} from "@/app/alunos/helpers";
import { fetchStudentLegalAcceptanceVerification } from "@/lib/legal-acceptances";

type VerificationPageProps = {
  params: Promise<{ acceptanceId: string }>;
  searchParams?: Promise<{ code?: string }>;
};

export default async function LegalAcceptanceVerificationPage({
  params,
  searchParams
}: VerificationPageProps) {
  const { acceptanceId } = await params;
  const resolvedSearchParams = await searchParams;
  const code = resolvedSearchParams?.code?.trim() ?? "";

  if (!acceptanceId || !code) {
    return <VerificationState title="Link incompleto" description="O QR Code informado nao contem os dados minimos para validar o aceite." tone="warning" />;
  }

  try {
    const verification = await fetchStudentLegalAcceptanceVerification(acceptanceId, code);

    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#fff_0%,#fcf6fa_45%,#f7eff4_100%)] px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[28px] border border-brand-line bg-brand-surface shadow-[0_24px_80px_rgba(109,33,60,0.08)]">
            <section className="rounded-t-[28px] bg-[linear-gradient(135deg,rgba(109,33,60,0.96),rgba(199,21,133,0.9))] px-6 py-8 text-white md:px-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/75">Verificacao publica</p>
                  <h1 className="mt-3 font-display text-3xl md:text-4xl">Aceite legal do aluno</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-white/84">
                    Esta pagina confirma se o QR Code vinculado ao PDF consolidado corresponde a um registro juridico valido
                    no sistema.
                  </p>
                </div>

                <div
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                    verification.verified ? "bg-white/16 text-white" : "bg-[rgba(255,193,7,0.18)] text-white"
                  }`}
                >
                  {verification.verified ? <ShieldCheck className="h-4 w-4" /> : <ShieldX className="h-4 w-4" />}
                  {verification.verified ? "Registro verificado" : "Codigo divergente"}
                </div>
              </div>
            </section>

            <section className="grid gap-4 px-6 py-6 md:grid-cols-3 md:px-8">
              <MetricCard
                label="Aluno"
                value={verification.studentName}
                helper={`CPF mascarado: ${verification.studentCpfMasked}`}
                icon={<FileCheck2 className="h-4 w-4" />}
              />
              <MetricCard
                label="Status do termo"
                value={formatLegalStatus(verification.status)}
                helper={`Metodo: ${formatCollectionMethod(verification.collectionMethod)}`}
                icon={<ShieldCheck className="h-4 w-4" />}
              />
              <MetricCard
                label="Codigo de verificacao"
                value={verification.verificationCode}
                helper={verification.documentReference}
                icon={<Fingerprint className="h-4 w-4" />}
              />
            </section>

            <section className="grid gap-4 border-t border-brand-line px-6 py-6 md:grid-cols-2 md:px-8">
              <InfoCard
                title="Identificacao juridica"
                rows={[
                  ["Titulo", verification.title],
                  [
                    "Abrangencia",
                    verification.coveredTermTypes.length > 1
                      ? "Aceite consolidado em coleta unica"
                      : "Aceite individual"
                  ],
                  [
                    verification.coveredTermTypes.length > 1 ? "Tipos cobertos" : "Tipo",
                    verification.coveredTermTypes.length > 1
                      ? formatLegalTermTypes(verification.coveredTermTypes)
                      : formatLegalTermType(verification.termType)
                  ],
                  ["Versao", verification.termsVersion],
                  ["Base legal", verification.legalBasis || "Nao informada neste registro."]
                ]}
              />
              <InfoCard
                title="Linha do tempo"
                rows={[
                  ["Capturado em", formatDateTimeWithTimezone(verification.createdAt)],
                  [
                    "Aceite formal",
                    verification.acceptedAt ? formatDateTimeWithTimezone(verification.acceptedAt) : "Aguardando assinatura"
                  ],
                  ["Operador", verification.capturedByUserName || "Nao identificado"],
                  ["Hash SHA-256", verification.documentHash]
                ]}
                monoLastRow
              />
            </section>

            <section className="grid gap-4 border-t border-brand-line px-6 py-6 md:grid-cols-2 md:px-8">
              <InfoCard
                title="Emitente institucional"
                rows={[
                  ["Emitente", verification.issuerName],
                  ["Documento institucional", verification.issuerDocument],
                  ["Referencia formal", verification.documentReference],
                  ["Codigo lido", verification.verificationCode]
                ]}
              />
              <InfoCard
                title="Declaracao de integridade"
                rows={[
                  ["Resultado", verification.verified ? "Documento consistente com o registro" : "Documento com divergencia de codigo"],
                  ["Declaracao", verification.verificationStatement]
                ]}
              />
            </section>

            <section className="border-t border-brand-line px-6 py-6 md:px-8">
              <div className="rounded-3xl border border-brand-line bg-[linear-gradient(135deg,rgba(246,220,235,0.58),rgba(255,255,255,0.96))] p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-brand-soft p-3 text-brand-secondary">
                    <ScanSearch className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-brand-secondary">Leitura desta verificacao</p>
                    <p className="mt-2 text-sm leading-6 text-brand-subtext">
                      {verification.verified
                        ? verification.verificationStatement
                        : "O registro existe, mas o codigo informado nao coincide com o identificador esperado para esta versao do termo. O documento apresentado deve ser tratado como divergente ate revisao operacional."}
                    </p>
                    {verification.coveredTermTypes.length > 1 ? (
                      <p className="mt-3 text-sm leading-6 text-brand-subtext">
                        Esta validacao cobre, em um unico documento, os seguintes consentimentos:{" "}
                        {formatLegalTermTypes(verification.coveredTermTypes)}.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    );
  } catch {
    return (
      <VerificationState
        title="Nao foi possivel validar o aceite"
        description="O registro juridico nao foi localizado ou o servico de verificacao esta indisponivel neste momento."
        tone="danger"
      />
    );
  }
}

function MetricCard({
  label,
  value,
  helper,
  icon
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="rounded-3xl border border-brand-line bg-brand-panel p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-brand-subtext">
        <span className="rounded-full bg-brand-soft p-2 text-brand-secondary">{icon}</span>
        {label}
      </div>
      <p className="mt-4 break-words font-display text-xl text-brand-secondary">{value}</p>
      <p className="mt-2 text-sm leading-6 text-brand-subtext">{helper}</p>
    </article>
  );
}

function InfoCard({
  title,
  rows,
  monoLastRow = false
}: {
  title: string;
  rows: [string, string][];
  monoLastRow?: boolean;
}) {
  return (
    <article className="rounded-3xl border border-brand-line bg-brand-panel p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">{title}</p>
      <div className="mt-4 space-y-4">
        {rows.map(([label, value], index) => (
          <div key={label}>
            <p className="text-xs uppercase tracking-[0.14em] text-brand-subtext">{label}</p>
            <p className={`mt-1 text-sm leading-6 text-brand-ink ${monoLastRow && index === rows.length - 1 ? "break-all font-mono text-xs" : ""}`}>
              {value}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

function VerificationState({
  title,
  description,
  tone
}: {
  title: string;
  description: string;
  tone: "warning" | "danger";
}) {
  const palette =
    tone === "danger"
      ? "border-[rgba(220,53,69,0.22)] bg-[rgba(220,53,69,0.08)] text-[#842029] dark:text-[#ff8591]"
      : "border-[rgba(255,193,7,0.25)] bg-[rgba(255,193,7,0.16)] text-[#744210] dark:text-[#ffcd39]";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fff_0%,#fcf6fa_45%,#f7eff4_100%)] px-4">
      <div className={`max-w-xl rounded-[28px] border p-8 shadow-[0_18px_60px_rgba(109,33,60,0.08)] ${palette}`}>
        <p className="text-xs uppercase tracking-[0.22em]">Verificacao publica</p>
        <h1 className="mt-3 font-display text-3xl">{title}</h1>
        <p className="mt-4 text-sm leading-6">{description}</p>
      </div>
    </main>
  );
}
