import { AlertTriangle, FileDown, FileHeart } from "lucide-react";
import {
  formatAttachmentType,
  formatCollectionMethod,
  formatCpf,
  formatDate,
  formatDateTime,
  formatDateTimeWithTimezone,
  formatLegalStatus,
  formatLegalTermType,
  formatPhone,
  getAge
} from "@/app/alunos/helpers";
import { LegalAcceptanceForm } from "@/app/alunos/legal-acceptance-form";
import { PortalAccountForm } from "@/app/alunos/portal-account-form";
import type { ClinicalRecord } from "@/lib/clinical";
import type { StudentLegalAcceptance } from "@/lib/legal-acceptances";
import type { StudentPortalAccount } from "@/lib/student-portal";
import type { Student } from "@/lib/students";

type StudentProfileProps = {
  student: Student | null;
  portalAccount: StudentPortalAccount | null;
  clinicalRecord: ClinicalRecord | null;
  legalAcceptances: StudentLegalAcceptance[];
  canViewClinicalRecord: boolean;
};

export function StudentProfile({
  student,
  portalAccount,
  clinicalRecord,
  legalAcceptances,
  canViewClinicalRecord
}: StudentProfileProps) {
  if (!student) {
    return (
      <div className="rounded-[20px] border border-dashed border-brand-line bg-brand-surface px-5 py-10 text-center text-sm text-brand-subtext">
        Nenhum aluno encontrado para o filtro informado.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[20px] border border-brand-line bg-brand-surface px-5 py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-brand-primary">Aluno selecionado</p>
            <h2 className="mt-2 font-display text-3xl text-brand-secondary">{student.fullName}</h2>
            <p className="mt-2 text-sm text-brand-subtext">
              {student.status === "ACTIVE" ? "Ativo na operacao atual" : "Inativo na base interna"}
            </p>
          </div>

          <span
            className={
              student.status === "ACTIVE"
                ? "rounded-full bg-[rgba(25,135,84,0.12)] px-3 py-1 text-xs font-semibold text-brand-success"
                : "rounded-full bg-[rgba(220,53,69,0.08)] px-3 py-1 text-xs font-semibold text-brand-danger"
            }
          >
            {student.status === "ACTIVE" ? "Ativo" : "Inativo"}
          </span>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-brand-line bg-brand-surface px-4 py-4">
          <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">CPF</p>
          <p className="mt-2 font-semibold text-brand-ink">{formatCpf(student.cpf)}</p>
        </div>
        <div className="rounded-2xl border border-brand-line bg-brand-surface px-4 py-4">
          <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Telefone</p>
          <p className="mt-2 font-semibold text-brand-ink">{formatPhone(student.phoneNumber)}</p>
        </div>
        <div className="rounded-2xl border border-brand-line bg-brand-surface px-4 py-4">
          <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Nascimento</p>
          <p className="mt-2 font-semibold text-brand-ink">
            {formatDate(student.birthDate)} ({getAge(student.birthDate)} anos)
          </p>
        </div>
        <div className="rounded-2xl border border-brand-line bg-brand-surface px-4 py-4">
          <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">LGPD</p>
          <p className="mt-2 font-semibold text-brand-ink">
            {student.lgpdConsent ? "Consentimento registrado" : "Consentimento pendente"}
          </p>
        </div>
      </div>

      <div className="rounded-[20px] border border-brand-line bg-brand-surface px-5 py-5">
        <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Contato principal</p>
        <p className="mt-3 font-semibold text-brand-ink">{student.email}</p>
        <p className="mt-2 text-sm text-brand-subtext">{formatPhone(student.phoneNumber)}</p>
        <p className="mt-4 text-xs text-brand-subtext">Cadastro criado em {formatDateTime(student.createdAt)}</p>
      </div>

      <div className="rounded-[20px] border border-brand-line bg-brand-surface px-5 py-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">LGPD e termos</p>
            <h3 className="mt-2 font-display text-2xl text-brand-secondary">Trilha juridica do aluno</h3>
            <p className="mt-2 text-sm leading-6 text-brand-subtext">
              Registre o texto exibido ao aluno, a versao do termo e o metodo usado para coleta no papel ou no tablet.
            </p>
          </div>

          <span
            className={
              student.lgpdConsent
                ? "rounded-full bg-[rgba(25,135,84,0.12)] px-3 py-1 text-xs font-semibold text-brand-success"
                : "rounded-full bg-[rgba(255,193,7,0.16)] px-3 py-1 text-xs font-semibold text-[#a06b00]"
            }
          >
            {student.lgpdConsent ? "Consentimento resumido ativo" : "Consentimento resumido pendente"}
          </span>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-brand-line bg-brand-panel px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Termos registrados</p>
            <p className="mt-2 font-semibold text-brand-ink">{legalAcceptances.length}</p>
            <p className="mt-2 text-sm text-brand-subtext">
              {legalAcceptances.filter((item) => item.status === "ACCEPTED").length} aceite(s) ja formalizados na trilha.
            </p>
          </div>

          <div className="rounded-2xl border border-brand-line bg-brand-panel px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Ultima captura</p>
            <p className="mt-2 font-semibold text-brand-ink">
              {legalAcceptances[0] ? formatDateTimeWithTimezone(legalAcceptances[0].createdAt) : "Sem registro"}
            </p>
            <p className="mt-2 text-sm text-brand-subtext">
              {legalAcceptances[0]
                ? `${formatLegalStatus(legalAcceptances[0].status)} por ${legalAcceptances[0].capturedByUserName ?? "usuario interno"}`
                : "Use a ficha abaixo para abrir a trilha do primeiro termo."}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <LegalAcceptanceForm studentId={student.id} studentName={student.fullName} />
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-brand-secondary">Historico de termos</p>
            <span className="text-xs text-brand-subtext">{legalAcceptances.length} registro(s)</span>
          </div>

          {legalAcceptances.length > 0 ? (
            legalAcceptances.map((acceptance) => (
              <article key={acceptance.id} className="rounded-2xl border border-brand-line bg-brand-panel px-4 py-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold text-brand-ink">{acceptance.title}</p>
                    <p className="mt-1 text-sm text-brand-subtext">
                      {formatLegalTermType(acceptance.termType)} - versao {acceptance.termsVersion}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span
                      className={
                        acceptance.status === "ACCEPTED"
                          ? "rounded-full bg-[rgba(25,135,84,0.12)] px-3 py-1 font-semibold text-brand-success"
                          : "rounded-full bg-[rgba(255,193,7,0.16)] px-3 py-1 font-semibold text-[#a06b00]"
                      }
                    >
                      {formatLegalStatus(acceptance.status)}
                    </span>
                    <span className="rounded-full bg-brand-soft px-3 py-1 font-semibold text-brand-secondary">
                      {formatCollectionMethod(acceptance.collectionMethod)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-brand-line bg-brand-surface px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Base legal</p>
                    <p className="mt-2 text-sm leading-6 text-brand-subtext">
                      {acceptance.legalBasis || "Nao informada neste registro."}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-brand-line bg-brand-surface px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Hash do documento</p>
                    <p className="mt-2 break-all font-mono text-xs text-brand-subtext">{acceptance.documentHash}</p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-brand-subtext">
                  {acceptance.termBody.length > 220 ? `${acceptance.termBody.slice(0, 220)}...` : acceptance.termBody}
                </p>

                <div className="mt-4 space-y-1 text-xs text-brand-subtext">
                  <p>Capturado em {formatDateTimeWithTimezone(acceptance.createdAt)}</p>
                  <p>Operador: {acceptance.capturedByUserName ?? "Nao identificado"}</p>
                  <p>
                    Aceite formal:{" "}
                    {acceptance.acceptedAt ? formatDateTimeWithTimezone(acceptance.acceptedAt) : "aguardando assinatura"}
                  </p>
                  <p>Evidencia: {acceptance.evidenceNote || "Nenhuma observacao adicional registrada."}</p>
                  <p>Origem tecnica: {acceptance.auditCollectionOrigin || "Nao registrada"}</p>
                  <p>IP da coleta: {acceptance.auditIpAddress || "Nao registrado"}</p>
                  <p>
                    Sessao tecnica:{" "}
                    {acceptance.auditSessionKey ? acceptance.auditSessionKey.slice(0, 16) : "Nao registrada"}
                  </p>
                  <p>
                    User-Agent:{" "}
                    {acceptance.auditUserAgent
                      ? acceptance.auditUserAgent.slice(0, 120)
                      : "Nao registrado"}
                  </p>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`/api/students/${student.id}/legal-acceptances/${acceptance.id}/document/download`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-brand-secondary px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-primary"
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      Baixar PDF consolidado
                    </a>
                  </div>

                  <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Arquivos de evidencia</p>
                  {acceptance.attachments.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {acceptance.attachments.map((attachment) => (
                        <a
                          key={attachment.id}
                          href={`/api/students/${student.id}/legal-acceptances/${acceptance.id}/attachments/${attachment.id}/download`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full bg-brand-soft px-3 py-2 text-xs font-semibold text-brand-secondary transition hover:bg-brand-primary hover:text-white"
                        >
                          {formatAttachmentType(attachment.attachmentType)}: {attachment.originalFileName}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-brand-subtext">Nenhum arquivo anexado a este aceite.</p>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-brand-line bg-brand-panel px-4 py-8 text-sm text-brand-subtext">
              Nenhum termo juridico arquivado para este aluno.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[20px] border border-brand-line bg-brand-surface px-5 py-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Portal do aluno</p>
            <h3 className="mt-2 font-display text-2xl text-brand-secondary">Conta de acesso</h3>
            <p className="mt-2 text-sm leading-6 text-brand-subtext">
              Configure o login do aluno para habilitar o portal com o e-mail e a senha inicial.
            </p>
          </div>

          <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-secondary">
            {portalAccount?.active ? "Configurado" : "Aguardando ativacao"}
          </span>
        </div>

        <div className="mt-5">
          <PortalAccountForm studentId={student.id} defaultEmail={student.email} currentAccount={portalAccount} />
        </div>
      </div>

      <div className="rounded-[20px] border border-brand-line bg-brand-surface px-5 py-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Prontuario clinico</p>
            <h3 className="mt-2 font-display text-2xl text-brand-secondary">Anamnese e historico</h3>
            <p className="mt-2 text-sm leading-6 text-brand-subtext">
              Resumo de alertas clinicos e evolucoes mais recentes do aluno.
            </p>
          </div>
          <div className="rounded-2xl bg-brand-soft p-3 text-brand-primary">
            <FileHeart className="h-5 w-5" />
          </div>
        </div>

        {canViewClinicalRecord ? (
          <div className="mt-5 space-y-5">
            {clinicalRecord?.anamnesis ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {clinicalRecord.anamnesis.alerts.length > 0 ? (
                    clinicalRecord.anamnesis.alerts.map((alert) => (
                      <span
                        key={alert}
                        className="rounded-full bg-[rgba(220,53,69,0.08)] px-3 py-1 text-xs font-semibold text-brand-danger"
                      >
                        {alert}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full bg-[rgba(25,135,84,0.12)] px-3 py-1 text-xs font-semibold text-brand-success">
                      Nenhum alerta clinico ativo
                    </span>
                  )}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-brand-line bg-brand-panel px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Patologias</p>
                    <p className="mt-2 font-semibold text-brand-ink">{clinicalRecord.anamnesis.hasPathologies ? "Sim" : "Nao"}</p>
                    {clinicalRecord.anamnesis.pathologyDetails ? (
                      <p className="mt-2 text-sm leading-6 text-brand-subtext">{clinicalRecord.anamnesis.pathologyDetails}</p>
                    ) : null}
                  </div>

                  <div className="rounded-2xl border border-brand-line bg-brand-panel px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Cirurgias</p>
                    <p className="mt-2 font-semibold text-brand-ink">{clinicalRecord.anamnesis.hasSurgeries ? "Sim" : "Nao"}</p>
                    {clinicalRecord.anamnesis.surgeryDetails ? (
                      <p className="mt-2 text-sm leading-6 text-brand-subtext">{clinicalRecord.anamnesis.surgeryDetails}</p>
                    ) : null}
                  </div>

                  <div className="rounded-2xl border border-brand-line bg-brand-panel px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Dor em acompanhamento</p>
                    <p className="mt-2 font-semibold text-brand-ink">{clinicalRecord.anamnesis.hasPain ? "Sim" : "Nao"}</p>
                    {clinicalRecord.anamnesis.painDetails ? (
                      <p className="mt-2 text-sm leading-6 text-brand-subtext">{clinicalRecord.anamnesis.painDetails}</p>
                    ) : null}
                  </div>

                  <div className="rounded-2xl border border-brand-line bg-brand-panel px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Marcadores de atencao</p>
                    <div className="mt-2 space-y-1 text-sm text-brand-subtext">
                      <p>Hipertensao: {clinicalRecord.anamnesis.hasHypertension ? "Sim" : "Nao"}</p>
                      <p>Osteoporose: {clinicalRecord.anamnesis.hasOsteoporosis ? "Sim" : "Nao"}</p>
                      <p>Gestacao: {clinicalRecord.anamnesis.isPregnant ? "Sim" : "Nao"}</p>
                      <p>Liberacao medica: {clinicalRecord.anamnesis.medicalClearanceRequired ? "Obrigatoria" : "Nao"}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-brand-line bg-brand-panel px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Observacoes gerais</p>
                  <p className="mt-2 text-sm leading-6 text-brand-subtext">
                    {clinicalRecord.anamnesis.generalObservations || "Nenhuma observacao registrada ate o momento."}
                  </p>
                  <p className="mt-4 text-xs text-brand-subtext">
                    Anamnese atualizada em {formatDateTimeWithTimezone(clinicalRecord.anamnesis.updatedAt)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-brand-line bg-brand-panel px-4 py-8 text-sm text-brand-subtext">
                Nenhuma anamnese cadastrada para este aluno.
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-brand-secondary">Historico de evolucao</p>
                <span className="text-xs text-brand-subtext">{clinicalRecord?.progressEntries.length ?? 0} registro(s)</span>
              </div>

              {clinicalRecord && clinicalRecord.progressEntries.length > 0 ? (
                clinicalRecord.progressEntries.map((entry) => (
                  <article key={entry.id} className="rounded-2xl border border-brand-line bg-brand-panel px-4 py-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-semibold text-brand-ink">Registro de {formatDateTimeWithTimezone(entry.recordedAt)}</p>
                        <p className="mt-1 text-sm text-brand-subtext">
                          Lancado por {entry.createdByUserName} em {formatDateTimeWithTimezone(entry.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-brand-soft px-3 py-1 font-semibold text-brand-secondary">
                          Flexibilidade: {entry.flexibilityScore ?? "-"}
                        </span>
                        <span className="rounded-full bg-brand-soft px-3 py-1 font-semibold text-brand-secondary">
                          Forca: {entry.strengthScore ?? "-"}
                        </span>
                        <span className="rounded-full bg-brand-soft px-3 py-1 font-semibold text-brand-secondary">
                          Dor: {entry.painLevel ?? "-"}
                        </span>
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-brand-subtext">{entry.instructorNotes}</p>

                    <p className="mt-4 text-xs text-brand-subtext">
                      {entry.attachments.length > 0
                        ? `${entry.attachments.length} anexo(s): ${entry.attachments.map((attachment) => attachment.originalFileName).join(", ")}`
                        : "Sem anexos neste registro."}
                    </p>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-brand-line bg-brand-panel px-4 py-8 text-sm text-brand-subtext">
                  Nenhuma evolucao clinica registrada para este aluno.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-brand-line bg-brand-panel px-4 py-5">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-[rgba(255,193,7,0.16)] p-2 text-[#a06b00]">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-brand-ink">Leitura clinica restrita neste perfil</p>
                <p className="mt-2 text-sm leading-6 text-brand-subtext">
                  O backend libera anamnese e evolucao apenas para administracao e instrutores. Neste painel de recepcao,
                  a ficha clinica permanece protegida.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
