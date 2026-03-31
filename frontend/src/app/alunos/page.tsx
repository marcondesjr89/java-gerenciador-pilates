import { AlertTriangle, FileHeart, Search, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import { AppShell } from "@/components/ui/app-shell";
import { SectionCard } from "@/components/ui/section-card";
import { requireInternalSession } from "@/lib/auth";
import { fetchStudents } from "@/lib/students";
import { CreateStudentForm } from "@/app/alunos/create-student-form";
import { LegalAcceptanceForm } from "@/app/alunos/legal-acceptance-form";
import { PortalAccountForm } from "@/app/alunos/portal-account-form";
import { fetchClinicalRecord } from "@/lib/clinical";
import { fetchStudentLegalAcceptances } from "@/lib/legal-acceptances";
import { fetchStudentPortalAccount } from "@/lib/student-portal";

type StudentsPageProps = {
  searchParams?: Promise<{
    q?: string;
    studentId?: string;
  }>;
};

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  return value;
}

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR");
}

function formatDateTimeWithTimezone(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

function formatLegalTermType(value: string) {
  switch (value) {
    case "LGPD_DATA_PROCESSING":
      return "Tratamento de dados LGPD";
    case "WHATSAPP_COMMUNICATION":
      return "Comunicacao por WhatsApp";
    case "CLINICAL_RECORD_SHARING":
      return "Compartilhamento clinico";
    default:
      return value;
  }
}

function formatLegalStatus(value: string) {
  switch (value) {
    case "ACCEPTED":
      return "Aceito";
    case "PENDING_SIGNATURE":
      return "Pendente";
    default:
      return value;
  }
}

function formatCollectionMethod(value: string | null) {
  switch (value) {
    case "TABLET_SIGNATURE":
      return "Tablet";
    case "PRINTED_SIGNATURE":
      return "Papel";
    case "INTERNAL_RECORD":
      return "Registro interno";
    default:
      return "Ainda nao definido";
  }
}

function getAge(value: string) {
  const today = new Date();
  const birthDate = new Date(`${value}T12:00:00`);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
}

export default async function StudentsPage({ searchParams }: StudentsPageProps) {
  const session = await requireInternalSession();
  const params = await searchParams;
  const searchTerm = params?.q?.trim().toLowerCase() ?? "";
  const students = await fetchStudents(session);
  const filteredStudents = students.filter((student) => {
    if (!searchTerm) {
      return true;
    }

    const searchable = [student.fullName, student.email, student.cpf, student.phoneNumber].join(" ").toLowerCase();
    return searchable.includes(searchTerm);
  });
  const selectedStudent =
    filteredStudents.find((student) => student.id === params?.studentId) ??
    filteredStudents[0] ??
    students.find((student) => student.id === params?.studentId) ??
    null;
  const activeCount = students.filter((student) => student.status === "ACTIVE").length;
  const inactiveCount = students.length - activeCount;
  const lgpdCount = students.filter((student) => student.lgpdConsent).length;
  const canViewClinicalRecord = session.role === "ADMIN";
  const selectedStudentId = selectedStudent?.id ?? null;
  const [portalAccount, clinicalRecord, legalAcceptances] = selectedStudentId
    ? await Promise.all([
        fetchStudentPortalAccount(session, selectedStudentId),
        canViewClinicalRecord ? fetchClinicalRecord(session, selectedStudentId) : Promise.resolve(null),
        fetchStudentLegalAcceptances(session, selectedStudentId)
      ])
    : [null, null, []];

  return (
    <AppShell currentPath="/alunos">
      <div className="space-y-6">
        <section className="rounded-[26px] border border-brand-line bg-brand-surface p-6 shadow-panel lg:p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-brand-primary">Modulo de alunos</p>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-4xl text-brand-secondary lg:text-5xl">Cadastro e leitura operacional</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-brand-subtext">
                Primeira entrega do modulo de alunos conectada ao backend real para recepcao consultar a base,
                abrir novos cadastros e validar dados essenciais do aluno.
              </p>
            </div>

            <form className="flex flex-col gap-2 rounded-[22px] bg-brand-soft px-5 py-4 text-sm text-brand-secondary">
              <span className="font-semibold">Buscar aluno</span>
              <div className="flex items-center gap-2 rounded-2xl border border-brand-line bg-brand-surface px-4 py-2">
                <Search className="h-4 w-4 text-brand-subtext" />
                <input
                  name="q"
                  type="search"
                  defaultValue={params?.q ?? ""}
                  placeholder="Nome, CPF, telefone ou e-mail"
                  className="w-full bg-transparent text-brand-ink outline-none"
                />
              </div>
              <button
                type="submit"
                className="rounded-2xl bg-brand-primary px-4 py-2 font-semibold text-white transition hover:bg-brand-primaryHover"
              >
                Filtrar base
              </button>
            </form>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-3">
          <article className="rounded-[24px] border border-brand-line bg-brand-panel p-5 shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-brand-subtext">Base total</p>
                <p className="mt-3 font-display text-4xl text-brand-ink">{students.length}</p>
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
                  {students.length - lgpdCount} cadastro(s) ainda sem consentimento marcado.
                </p>
              </div>
              <div className="rounded-2xl bg-[rgba(25,135,84,0.12)] p-3 text-brand-success">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
          </article>
        </section>

        <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <SectionCard
            title="Cadastrar aluno"
            description="Entrada operacional para recepcao criar alunos na base principal com os campos essenciais."
          >
            <CreateStudentForm />
          </SectionCard>

          <SectionCard
            title="Ficha do aluno"
            description="Leitura operacional do cadastro, acesso ao portal e sinais clinicos do aluno selecionado."
          >
            {selectedStudent ? (
              <div className="space-y-6">
                <div className="rounded-[20px] border border-brand-line bg-brand-surface px-5 py-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.18em] text-brand-primary">Aluno selecionado</p>
                      <h2 className="mt-2 font-display text-3xl text-brand-secondary">{selectedStudent.fullName}</h2>
                      <p className="mt-2 text-sm text-brand-subtext">
                        {selectedStudent.status === "ACTIVE" ? "Ativo na operacao atual" : "Inativo na base interna"}
                      </p>
                    </div>

                    <span
                      className={
                        selectedStudent.status === "ACTIVE"
                          ? "rounded-full bg-[rgba(25,135,84,0.12)] px-3 py-1 text-xs font-semibold text-brand-success"
                          : "rounded-full bg-[rgba(220,53,69,0.08)] px-3 py-1 text-xs font-semibold text-brand-danger"
                      }
                    >
                      {selectedStudent.status === "ACTIVE" ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-brand-line bg-brand-surface px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">CPF</p>
                    <p className="mt-2 font-semibold text-brand-ink">{formatCpf(selectedStudent.cpf)}</p>
                  </div>
                  <div className="rounded-2xl border border-brand-line bg-brand-surface px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Telefone</p>
                    <p className="mt-2 font-semibold text-brand-ink">{formatPhone(selectedStudent.phoneNumber)}</p>
                  </div>
                  <div className="rounded-2xl border border-brand-line bg-brand-surface px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Nascimento</p>
                    <p className="mt-2 font-semibold text-brand-ink">
                      {formatDate(selectedStudent.birthDate)} ({getAge(selectedStudent.birthDate)} anos)
                    </p>
                  </div>
                  <div className="rounded-2xl border border-brand-line bg-brand-surface px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">LGPD</p>
                    <p className="mt-2 font-semibold text-brand-ink">
                      {selectedStudent.lgpdConsent ? "Consentimento registrado" : "Consentimento pendente"}
                    </p>
                  </div>
                </div>

                <div className="rounded-[20px] border border-brand-line bg-brand-surface px-5 py-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Contato principal</p>
                  <p className="mt-3 font-semibold text-brand-ink">{selectedStudent.email}</p>
                  <p className="mt-2 text-sm text-brand-subtext">{formatPhone(selectedStudent.phoneNumber)}</p>
                  <p className="mt-4 text-xs text-brand-subtext">
                    Cadastro criado em {formatDateTime(selectedStudent.createdAt)}
                  </p>
                </div>

                <div className="rounded-[20px] border border-brand-line bg-brand-surface px-5 py-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">LGPD e termos</p>
                      <h3 className="mt-2 font-display text-2xl text-brand-secondary">Trilha juridica do aluno</h3>
                      <p className="mt-2 text-sm leading-6 text-brand-subtext">
                        Registre o texto exibido ao aluno, a versao do termo e o metodo usado para coleta no
                        papel ou no tablet.
                      </p>
                    </div>

                    <span
                      className={
                        selectedStudent.lgpdConsent
                          ? "rounded-full bg-[rgba(25,135,84,0.12)] px-3 py-1 text-xs font-semibold text-brand-success"
                          : "rounded-full bg-[rgba(255,193,7,0.16)] px-3 py-1 text-xs font-semibold text-[#a06b00]"
                      }
                    >
                      {selectedStudent.lgpdConsent ? "Consentimento resumido ativo" : "Consentimento resumido pendente"}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-brand-line bg-brand-panel px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Termos registrados</p>
                      <p className="mt-2 font-semibold text-brand-ink">{legalAcceptances.length}</p>
                      <p className="mt-2 text-sm text-brand-subtext">
                        {legalAcceptances.filter((item) => item.status === "ACCEPTED").length} aceite(s) ja
                        formalizados na trilha.
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
                    <LegalAcceptanceForm studentId={selectedStudent.id} studentName={selectedStudent.fullName} />
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-brand-secondary">Historico de termos</p>
                      <span className="text-xs text-brand-subtext">{legalAcceptances.length} registro(s)</span>
                    </div>

                    {legalAcceptances.length > 0 ? (
                      legalAcceptances.map((acceptance) => (
                        <article
                          key={acceptance.id}
                          className="rounded-2xl border border-brand-line bg-brand-panel px-4 py-4"
                        >
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
                            {acceptance.termBody.length > 220
                              ? `${acceptance.termBody.slice(0, 220)}...`
                              : acceptance.termBody}
                          </p>

                          <div className="mt-4 space-y-1 text-xs text-brand-subtext">
                            <p>Capturado em {formatDateTimeWithTimezone(acceptance.createdAt)}</p>
                            <p>Operador: {acceptance.capturedByUserName ?? "Nao identificado"}</p>
                            <p>
                              Aceite formal:{" "}
                              {acceptance.acceptedAt ? formatDateTimeWithTimezone(acceptance.acceptedAt) : "aguardando assinatura"}
                            </p>
                            <p>Evidencia: {acceptance.evidenceNote || "Nenhuma observacao adicional registrada."}</p>
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
                    <PortalAccountForm
                      studentId={selectedStudent.id}
                      defaultEmail={selectedStudent.email}
                      currentAccount={portalAccount}
                    />
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
                              <p className="mt-2 font-semibold text-brand-ink">
                                {clinicalRecord.anamnesis.hasPathologies ? "Sim" : "Nao"}
                              </p>
                              {clinicalRecord.anamnesis.pathologyDetails ? (
                                <p className="mt-2 text-sm leading-6 text-brand-subtext">
                                  {clinicalRecord.anamnesis.pathologyDetails}
                                </p>
                              ) : null}
                            </div>

                            <div className="rounded-2xl border border-brand-line bg-brand-panel px-4 py-4">
                              <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Cirurgias</p>
                              <p className="mt-2 font-semibold text-brand-ink">
                                {clinicalRecord.anamnesis.hasSurgeries ? "Sim" : "Nao"}
                              </p>
                              {clinicalRecord.anamnesis.surgeryDetails ? (
                                <p className="mt-2 text-sm leading-6 text-brand-subtext">
                                  {clinicalRecord.anamnesis.surgeryDetails}
                                </p>
                              ) : null}
                            </div>

                            <div className="rounded-2xl border border-brand-line bg-brand-panel px-4 py-4">
                              <p className="text-xs uppercase tracking-[0.18em] text-brand-subtext">Dor em acompanhamento</p>
                              <p className="mt-2 font-semibold text-brand-ink">
                                {clinicalRecord.anamnesis.hasPain ? "Sim" : "Nao"}
                              </p>
                              {clinicalRecord.anamnesis.painDetails ? (
                                <p className="mt-2 text-sm leading-6 text-brand-subtext">
                                  {clinicalRecord.anamnesis.painDetails}
                                </p>
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
                          <span className="text-xs text-brand-subtext">
                            {clinicalRecord?.progressEntries.length ?? 0} registro(s)
                          </span>
                        </div>

                        {clinicalRecord && clinicalRecord.progressEntries.length > 0 ? (
                          clinicalRecord.progressEntries.map((entry) => (
                            <article
                              key={entry.id}
                              className="rounded-2xl border border-brand-line bg-brand-panel px-4 py-4"
                            >
                              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                  <p className="font-semibold text-brand-ink">
                                    Registro de {formatDateTimeWithTimezone(entry.recordedAt)}
                                  </p>
                                  <p className="mt-1 text-sm text-brand-subtext">
                                    Lançado por {entry.createdByUserName} em {formatDateTimeWithTimezone(entry.createdAt)}
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
                                  ? `${entry.attachments.length} anexo(s): ${entry.attachments
                                      .map((attachment) => attachment.originalFileName)
                                      .join(", ")}`
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
                            O backend libera anamnese e evolucao apenas para administracao e instrutores.
                            Neste painel de recepcao, a ficha clinica permanece protegida.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-[20px] border border-dashed border-brand-line bg-brand-surface px-5 py-10 text-center text-sm text-brand-subtext">
                Nenhum aluno encontrado para o filtro informado.
              </div>
            )}
          </SectionCard>
        </div>

        <SectionCard
          title="Base de alunos"
          description="Lista operacional para recepcao localizar rapidamente alunos ativos e inativos."
        >
          {filteredStudents.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-brand-line bg-brand-surface px-5 py-10 text-center text-sm text-brand-subtext">
              Nenhum aluno localizado com o filtro atual.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStudents.map((student) => {
                const isSelected = selectedStudent?.id === student.id;

                return (
                  <a
                    key={student.id}
                    href={`/alunos?studentId=${student.id}${params?.q ? `&q=${encodeURIComponent(params.q)}` : ""}`}
                    className={
                      isSelected
                        ? "block rounded-[20px] border border-brand-primary/30 bg-brand-soft px-4 py-4"
                        : "block rounded-[20px] border border-brand-line bg-brand-surface px-4 py-4 transition hover:border-brand-primary/30"
                    }
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold text-brand-ink">{student.fullName}</p>
                        <p className="text-sm text-brand-subtext">
                          {formatCpf(student.cpf)} - {student.email}
                        </p>
                        <p className="text-sm text-brand-subtext">{formatPhone(student.phoneNumber)}</p>
                      </div>

                      <div className="flex flex-col gap-2 text-sm md:items-end">
                        <span
                          className={
                            student.status === "ACTIVE"
                              ? "rounded-full bg-[rgba(25,135,84,0.12)] px-3 py-1 font-semibold text-brand-success"
                              : "rounded-full bg-[rgba(220,53,69,0.08)] px-3 py-1 font-semibold text-brand-danger"
                          }
                        >
                          {student.status === "ACTIVE" ? "Ativo" : "Inativo"}
                        </span>
                        <span className="text-brand-subtext">
                          {student.lgpdConsent ? "LGPD confirmado" : "LGPD pendente"}
                        </span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
