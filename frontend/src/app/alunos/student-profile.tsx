"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  FileDown,
  FileHeart,
  FileText,
  KeyRound,
  Pencil,
  ShieldCheck,
  UserX,
  X
} from "lucide-react";
import {
  formatCollectionMethod,
  formatCpf,
  formatDate,
  formatDateTime,
  formatDateTimeWithTimezone,
  formatLegalStatus,
  formatLegalTermType,
  formatLegalTermTypes,
  formatPhone,
  getAge
} from "@/app/alunos/helpers";
import { AnamnesisForm } from "@/app/alunos/anamnesis-form";
import { EditStudentModal } from "@/app/alunos/edit-student-modal";
import { LegalAcceptanceForm } from "@/app/alunos/legal-acceptance-form";
import { PortalAccountForm } from "@/app/alunos/portal-account-form";
import { StudentAnonymizePanel } from "@/app/alunos/student-anonymize-panel";
import type { ClinicalRecord } from "@/lib/clinical";
import type { StudentLegalAcceptance } from "@/lib/legal-acceptances";
import { formatStudentStatus, getStatusBadgeClass } from "@/lib/status";
import type { StudentPortalAccount } from "@/lib/student-portal";
import type { Student } from "@/lib/students";

type TabKey = "clinical" | "cadastral" | "legal" | "portal" | "privacy";

type StudentProfileProps = {
  student: Student | null;
  portalAccount: StudentPortalAccount | null;
  clinicalRecord: ClinicalRecord | null;
  legalAcceptances: StudentLegalAcceptance[];
  canViewClinicalRecord: boolean;
  canAnonymize?: boolean;
  initialTab?: TabKey;
  onClose?: () => void;
};

export function StudentProfile({
  student,
  portalAccount,
  clinicalRecord,
  legalAcceptances,
  canViewClinicalRecord,
  canAnonymize,
  initialTab,
  onClose
}: StudentProfileProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab ?? "clinical");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!student) {
    return (
      <div className="rounded-[20px] border border-dashed border-brand-line bg-brand-surface px-5 py-10 text-center text-sm text-brand-subtext">
        Nenhum aluno selecionado. Clique em um aluno da lista para abrir a ficha.
      </div>
    );
  }

  function handleCloseProfile() {
    if (onClose) {
      onClose();
    } else {
      router.push("/alunos");
    }
  }

  const activeAlerts = clinicalRecord?.anamnesis?.alerts ?? [];

  return (
    <div className="space-y-6">
      {/* Modal de Edição de Dados */}
      {student && (
        <EditStudentModal
          student={student}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {/* Cabeçalho do Aluno com Ações Rápidas */}
      <div className="rounded-[24px] border border-brand-line bg-brand-surface p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-[0.18em] text-brand-primary font-semibold">
                Ficha do Aluno
              </span>
              <span className={getStatusBadgeClass(student.status)}>
                {formatStudentStatus(student.status)}
              </span>
              {activeAlerts.length > 0 && (
                <span className="rounded-full bg-[rgba(220,53,69,0.12)] px-2.5 py-0.5 text-xs font-semibold text-brand-danger">
                  {activeAlerts.length} alerta{activeAlerts.length > 1 ? "s" : ""} clínico{activeAlerts.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <h2 className="font-display text-3xl text-brand-secondary">{student.fullName}</h2>
            <p className="text-sm text-brand-subtext">
              CPF: <strong className="text-brand-ink">{formatCpf(student.cpf)}</strong> • Tel: <strong className="text-brand-ink">{formatPhone(student.phoneNumber)}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 rounded-2xl border border-brand-line bg-brand-soft px-3.5 py-2 text-xs font-semibold text-brand-secondary transition hover:bg-brand-panel hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              aria-label="Editar dados cadastrais do aluno"
            >
              <Pencil className="h-3.5 w-3.5" />
              Editar Dados
            </button>
            <button
              type="button"
              onClick={handleCloseProfile}
              className="rounded-full p-2 text-brand-subtext hover:bg-brand-soft hover:text-brand-ink transition"
              aria-label="Fechar ficha do aluno"
              title="Fechar ficha"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Abas de Navegação */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-brand-line pb-2" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "clinical"}
            onClick={() => setActiveTab("clinical")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === "clinical"
                ? "bg-brand-primary text-white shadow-sm"
                : "text-brand-subtext hover:bg-brand-soft hover:text-brand-ink"
            }`}
          >
            <FileHeart className="h-4 w-4" />
            Clínico & Anamnese
            {activeAlerts.length > 0 && (
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${activeTab === "clinical" ? "bg-white text-brand-primary" : "bg-brand-danger text-white"}`}>
                {activeAlerts.length}
              </span>
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "cadastral"}
            onClick={() => setActiveTab("cadastral")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === "cadastral"
                ? "bg-brand-primary text-white shadow-sm"
                : "text-brand-subtext hover:bg-brand-soft hover:text-brand-ink"
            }`}
          >
            <FileText className="h-4 w-4" />
            Dados Cadastrais
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "legal"}
            onClick={() => setActiveTab("legal")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === "legal"
                ? "bg-brand-primary text-white shadow-sm"
                : "text-brand-subtext hover:bg-brand-soft hover:text-brand-ink"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            LGPD & Termos
            <span className="text-[10px] opacity-80">({legalAcceptances.length})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "portal"}
            onClick={() => setActiveTab("portal")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === "portal"
                ? "bg-brand-primary text-white shadow-sm"
                : "text-brand-subtext hover:bg-brand-soft hover:text-brand-ink"
            }`}
          >
            <KeyRound className="h-4 w-4" />
            Portal do Aluno
          </button>

          {canAnonymize && (
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "privacy"}
              onClick={() => setActiveTab("privacy")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === "privacy"
                  ? "bg-brand-primary text-white shadow-sm"
                  : "text-brand-subtext hover:bg-brand-soft hover:text-brand-ink"
              }`}
            >
              <UserX className="h-4 w-4" />
              Privacidade (LGPD)
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo da Aba Ativa */}

      {/* 1. ABA CLÍNICO & ANAMNESE */}
      {activeTab === "clinical" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Card de Alertas Clínicos Ativos */}
          <div className="rounded-[20px] border border-brand-line bg-brand-surface p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Sinais e Atenção</p>
                <h3 className="text-xl font-display text-brand-secondary mt-1">Alertas Clínicos Ativos</h3>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  activeAlerts.length > 0
                    ? "bg-[rgba(220,53,69,0.12)] text-brand-danger"
                    : "bg-[rgba(25,135,84,0.12)] text-brand-success"
                }`}
              >
                {activeAlerts.length > 0 ? `${activeAlerts.length} alerta(s)` : "Sem alertas clínicos"}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {activeAlerts.length > 0 ? (
                activeAlerts.map((alert) => (
                  <span
                    key={alert}
                    className="flex items-center gap-1.5 rounded-full border border-brand-danger/30 bg-[rgba(220,53,69,0.08)] px-3 py-1 text-xs font-semibold text-brand-danger"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {alert}
                  </span>
                ))
              ) : (
                <p className="text-sm text-brand-subtext">
                  Nenhum alerta crítico ativo. Preencha a anamnese abaixo para registrar patologias ou dores.
                </p>
              )}
            </div>
          </div>

          {/* Formulário de Anamnese */}
          {canViewClinicalRecord ? (
            <div className="rounded-[20px] border border-brand-line bg-brand-surface p-6 shadow-sm">
              <AnamnesisForm
                studentId={student.id}
                studentName={student.fullName}
                initialAnamnesis={clinicalRecord?.anamnesis ?? null}
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-brand-line bg-brand-panel p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-[#a06b00]" />
                <div>
                  <p className="font-semibold text-brand-ink">Acesso clínico restrito</p>
                  <p className="text-sm text-brand-subtext mt-1">
                    Anamnese e alertas clínicos são restritos aos perfis de Administrador e Instrutores.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Histórico de Evoluções Clínicas */}
          {canViewClinicalRecord && (
            <div className="rounded-[20px] border border-brand-line bg-brand-surface p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Acompanhamento</p>
                  <h3 className="text-xl font-display text-brand-secondary mt-1">Histórico de Evolução Clínica</h3>
                </div>
                <span className="text-xs text-brand-subtext">
                  {clinicalRecord?.progressEntries.length ?? 0} registro(s)
                </span>
              </div>

              {clinicalRecord && clinicalRecord.progressEntries.length > 0 ? (
                <div className="space-y-3">
                  {clinicalRecord.progressEntries.map((entry) => (
                    <article key={entry.id} className="rounded-2xl border border-brand-line bg-brand-panel p-4">
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="font-semibold text-brand-ink">
                            Registro de {formatDateTimeWithTimezone(entry.recordedAt)}
                          </p>
                          <p className="text-xs text-brand-subtext mt-0.5">
                            Lançado por {entry.createdByUserName} em {formatDateTimeWithTimezone(entry.createdAt)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full bg-brand-soft px-3 py-1 font-semibold text-brand-secondary">
                            Flexibilidade: {entry.flexibilityScore ?? "-"}
                          </span>
                          <span className="rounded-full bg-brand-soft px-3 py-1 font-semibold text-brand-secondary">
                            Força: {entry.strengthScore ?? "-"}
                          </span>
                          <span className="rounded-full bg-brand-soft px-3 py-1 font-semibold text-brand-secondary">
                            Dor: {entry.painLevel ?? "-"}
                          </span>
                        </div>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-brand-subtext">{entry.instructorNotes}</p>

                      <p className="mt-3 text-xs text-brand-subtext">
                        {entry.attachments.length > 0
                          ? `${entry.attachments.length} anexo(s): ${entry.attachments.map((a) => a.originalFileName).join(", ")}`
                          : "Sem anexos neste registro."}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-brand-line bg-brand-panel p-6 text-center text-sm text-brand-subtext">
                  Nenhuma evolução clínica registrada ainda para este aluno.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. ABA DADOS CADASTRAIS */}
      {activeTab === "cadastral" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="rounded-[20px] border border-brand-line bg-brand-surface p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-brand-line pb-4 mb-4">
              <h3 className="font-display text-xl text-brand-secondary">Informações Cadastrais</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 rounded-2xl bg-brand-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-primaryHover"
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar Dados
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-brand-line bg-brand-panel p-4">
                <p className="text-xs uppercase tracking-wider text-brand-subtext">Nome Completo</p>
                <p className="mt-1 font-semibold text-brand-ink">{student.fullName}</p>
              </div>

              <div className="rounded-2xl border border-brand-line bg-brand-panel p-4">
                <p className="text-xs uppercase tracking-wider text-brand-subtext">CPF</p>
                <p className="mt-1 font-semibold text-brand-ink">{formatCpf(student.cpf)}</p>
              </div>

              <div className="rounded-2xl border border-brand-line bg-brand-panel p-4">
                <p className="text-xs uppercase tracking-wider text-brand-subtext">Telefone / WhatsApp</p>
                <p className="mt-1 font-semibold text-brand-ink">{formatPhone(student.phoneNumber)}</p>
              </div>

              <div className="rounded-2xl border border-brand-line bg-brand-panel p-4">
                <p className="text-xs uppercase tracking-wider text-brand-subtext">E-mail</p>
                <p className="mt-1 font-semibold text-brand-ink">{student.email}</p>
              </div>

              <div className="rounded-2xl border border-brand-line bg-brand-panel p-4">
                <p className="text-xs uppercase tracking-wider text-brand-subtext">Nascimento</p>
                <p className="mt-1 font-semibold text-brand-ink">
                  {student.birthDate ? `${formatDate(student.birthDate)} (${getAge(student.birthDate)} anos)` : "Não informado"}
                </p>
              </div>

              <div className="rounded-2xl border border-brand-line bg-brand-panel p-4">
                <p className="text-xs uppercase tracking-wider text-brand-subtext">Data de Cadastro</p>
                <p className="mt-1 font-semibold text-brand-ink">{formatDateTime(student.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. ABA LGPD & TERMOS */}
      {activeTab === "legal" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="rounded-[20px] border border-brand-line bg-brand-surface p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Compliance & Jurídico</p>
                <h3 className="mt-1 font-display text-2xl text-brand-secondary">Trilha Jurídica do Aluno</h3>
                <p className="mt-1 text-sm text-brand-subtext">
                  Registro de consentimentos, termos de adesão, imagem e assinaturas digitais avançadas.
                </p>
              </div>

              <span
                className={
                  student.lgpdConsent
                    ? "rounded-full bg-[rgba(25,135,84,0.12)] px-3 py-1 text-xs font-semibold text-brand-success"
                    : "rounded-full bg-[rgba(255,193,7,0.16)] px-3 py-1 text-xs font-semibold text-[#a06b00]"
                }
              >
                {student.lgpdConsent ? "Consentimento geral ativo" : "Consentimento geral pendente"}
              </span>
            </div>

            <div className="mt-6">
              <LegalAcceptanceForm studentId={student.id} studentName={student.fullName} />
            </div>

            <div className="mt-8 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-brand-secondary">Histórico de Termos Cadastrados</p>
                <span className="text-xs text-brand-subtext">{legalAcceptances.length} registro(s)</span>
              </div>

              {legalAcceptances.length > 0 ? (
                legalAcceptances.map((acceptance) => (
                  <article key={acceptance.id} className="rounded-2xl border border-brand-line bg-brand-panel p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-semibold text-brand-ink">{acceptance.title}</p>
                        <p className="mt-1 text-xs text-brand-subtext">
                          {acceptance.coveredTermTypes.length > 1
                            ? `${formatLegalTermTypes(acceptance.coveredTermTypes)} - versão ${acceptance.termsVersion}`
                            : `${formatLegalTermType(acceptance.termType)} - versão ${acceptance.termsVersion}`}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs">
                        {acceptance.coveredTermTypes.length > 1 && (
                          <span className="rounded-full border border-brand-line bg-brand-surface px-3 py-1 font-semibold text-brand-secondary">
                            Coleta consolidada ({acceptance.coveredTermTypes.length} termos)
                          </span>
                        )}
                        <span
                          className={
                            acceptance.status === "ACCEPTED"
                              ? "rounded-full bg-[rgba(25,135,84,0.12)] px-3 py-1 font-semibold text-brand-success"
                              : "rounded-full bg-[rgba(255,193,7,0.18)] px-3 py-1 font-semibold text-[#855700]"
                          }
                        >
                          {formatLegalStatus(acceptance.status)}
                        </span>
                        <span className="rounded-full bg-brand-soft px-3 py-1 font-semibold text-brand-secondary">
                          {formatCollectionMethod(acceptance.collectionMethod)}
                        </span>
                      </div>
                    </div>

                    {acceptance.coveredTermTypes.length > 1 ? (
                      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-brand-subtext">
                        <span className="font-semibold text-brand-secondary">Termos cobertos:</span>
                        {acceptance.coveredTermTypes.map((type) => (
                          <span
                            key={type}
                            className="rounded-lg bg-brand-soft/70 px-2 py-0.5 text-brand-secondary"
                          >
                            {formatLegalTermType(type)}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <a
                        href={`/api/students/${student.id}/legal-acceptances/${acceptance.id}/document/download`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Baixar PDF consolidado: ${acceptance.title}`}
                        className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-brand-soft px-3.5 py-1.5 text-xs font-semibold text-brand-secondary transition hover:border-brand-primary hover:bg-brand-primary hover:text-white"
                      >
                        <FileDown className="h-3.5 w-3.5" />
                        Baixar PDF consolidado assinado
                      </a>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-brand-line bg-brand-panel p-6 text-center text-sm text-brand-subtext">
                  Nenhum termo arquivado para este aluno.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. ABA PORTAL DO ALUNO */}
      {activeTab === "portal" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="rounded-[20px] border border-brand-line bg-brand-surface p-6 shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Autosserviço</p>
                <h3 className="mt-1 font-display text-2xl text-brand-secondary">Conta do Portal do Aluno</h3>
                <p className="mt-1 text-sm text-brand-subtext">
                  Habilite o acesso do aluno ao portal para visualização de faturas e marcação de aulas.
                </p>
              </div>

              <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-secondary">
                {portalAccount?.active ? "Conta Ativa" : "Aguardando Ativação"}
              </span>
            </div>

            <div className="mt-6">
              <PortalAccountForm studentId={student.id} defaultEmail={student.email} currentAccount={portalAccount} />
            </div>
          </div>
        </div>
      )}

      {/* 5. ABA PRIVACIDADE (LGPD) */}
      {activeTab === "privacy" && canAnonymize && (
        <div className="space-y-6 animate-in fade-in">
          <StudentAnonymizePanel student={student} canAnonymize={Boolean(canAnonymize)} />
        </div>
      )}
    </div>
  );
}
