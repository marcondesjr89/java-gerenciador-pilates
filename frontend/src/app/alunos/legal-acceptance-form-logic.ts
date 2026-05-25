export const TERM_TEMPLATES = {
  LGPD_DATA_PROCESSING: {
    title: "Termo de consentimento para tratamento de dados pessoais",
    legalNature: "Consentimento para tratamento de dados pessoais e sensiveis",
    termsVersion: "v1.0-abr-2026",
    legalBasis: "Consentimento do titular para tratamento de dados pessoais e sensiveis no contexto assistencial.",
    termBody:
      "Autorizo o Studio Gerenciador Pilates a coletar, armazenar e tratar meus dados pessoais e dados sensiveis estritamente para cadastro, agendamento, prontuario clinico, faturamento e comunicacoes operacionais relacionadas ao atendimento."
  },
  WHATSAPP_COMMUNICATION: {
    title: "Termo de consentimento para comunicacao por WhatsApp",
    legalNature: "Consentimento para comunicacao operacional",
    termsVersion: "v1.0-abr-2026",
    legalBasis: "Consentimento do titular para envio de comunicacoes operacionais e lembretes por WhatsApp.",
    termBody:
      "Autorizo o Studio Gerenciador Pilates a utilizar meu numero de telefone para envio de avisos de agenda, confirmacoes, remarcacoes, pendencias financeiras e comunicacoes operacionais por WhatsApp."
  },
  CLINICAL_RECORD_SHARING: {
    title: "Termo de consentimento para compartilhamento clinico",
    legalNature: "Autorizacao especifica para compartilhamento clinico controlado",
    termsVersion: "v1.0-abr-2026",
    legalBasis: "Consentimento especifico para compartilhamento controlado de informacoes clinicas quando necessario ao cuidado.",
    termBody:
      "Autorizo, quando necessario ao meu cuidado e dentro dos limites informados, o compartilhamento controlado de informacoes do meu prontuario clinico com profissionais envolvidos diretamente no meu atendimento."
  },
  EVOLUTION_IMAGE_CAPTURE: {
    title: "Termo de consentimento para captura de imagem de evolucao",
    legalNature: "Autorizacao especifica para captura de imagem clinica",
    termsVersion: "v1.0-abr-2026",
    legalBasis: "Consentimento especifico para registro de imagens e videos estritamente destinados ao acompanhamento clinico e funcional da evolucao do aluno.",
    termBody:
      "Autorizo o Studio Gerenciador Pilates a capturar e armazenar imagens e videos exclusivamente para acompanhamento da minha evolucao fisica, comparacao tecnica entre sessoes, registro assistencial e alinhamento do cuidado pela equipe responsavel, sem uso para divulgacao publica ou marketing."
  }
} as const;

export type LegalTermType = keyof typeof TERM_TEMPLATES;

const DEFAULT_TERM_TYPE: LegalTermType = "LGPD_DATA_PROCESSING";
const LEGAL_TERM_TYPES = Object.keys(TERM_TEMPLATES) as LegalTermType[];

export type LegalAcceptanceRequestPayload = {
  termType: LegalTermType;
  coveredTermTypes: LegalTermType[];
  title: string;
  termsVersion: string;
  legalBasis: string | null;
  termBody: string;
  status: string;
  collectionMethod: string | null;
  evidenceNote: string;
};

export function isLegalTermType(value: string): value is LegalTermType {
  return LEGAL_TERM_TYPES.includes(value as LegalTermType);
}

export function getLegalTermTypeLabel(termType: LegalTermType) {
  switch (termType) {
    case "LGPD_DATA_PROCESSING":
      return "tratamento de dados pessoais e sensiveis";
    case "WHATSAPP_COMMUNICATION":
      return "comunicacao operacional por WhatsApp";
    case "CLINICAL_RECORD_SHARING":
      return "compartilhamento clinico controlado";
    case "EVOLUTION_IMAGE_CAPTURE":
      return "captura de imagem para evolucao clinica";
    default:
      return termType;
  }
}

export function getLegalTermNatureLabel(termType: LegalTermType) {
  return TERM_TEMPLATES[termType].legalNature;
}

export function normalizeCoveredTermTypes(values: string[]) {
  const uniqueValues = Array.from(new Set(values.map((value) => value.trim()).filter(isLegalTermType)));
  return uniqueValues.length > 0 ? uniqueValues : [DEFAULT_TERM_TYPE];
}

export function buildLegalAcceptanceDraft(coveredTermTypes: LegalTermType[]) {
  const normalizedTypes = normalizeCoveredTermTypes(coveredTermTypes);
  const selectedTemplates = normalizedTypes.map((termType) => TERM_TEMPLATES[termType]);
  const maxVersion = [...selectedTemplates]
    .map((template) => template.termsVersion)
    .sort((left, right) => right.localeCompare(left))[0] ?? TERM_TEMPLATES[DEFAULT_TERM_TYPE].termsVersion;

  if (normalizedTypes.length === 1) {
    const [termType] = normalizedTypes;
    const template = TERM_TEMPLATES[termType];
    return {
      primaryTermType: termType,
      coveredTermTypes: normalizedTypes,
      title: template.title,
      termsVersion: template.termsVersion,
      legalBasis: template.legalBasis,
      termBody: template.termBody
    };
  }

  return {
    primaryTermType: normalizedTypes[0],
    coveredTermTypes: normalizedTypes,
    title: "Termo consolidado de consentimentos e autorizacoes do aluno",
    termsVersion: maxVersion,
    legalBasis: `Aceite consolidado para ${normalizedTypes.map((termType) => getLegalTermTypeLabel(termType)).join(", ")}.`,
    termBody: [
      "Declaro que li, compreendi e concordo, em uma unica coleta de aceite, com os consentimentos e autorizacoes abaixo relacionados para meu atendimento no Studio Gerenciador Pilates.",
      "Os itens selecionados neste registro passam a compor um unico documento versionado, vinculado ao meu cadastro e sujeito a validacao posterior pelo hash e pelo QR Code do comprovante consolidado.",
      "O metodo de coleta registrado neste fluxo funciona como evidencia operacional da formalizacao e nao altera o conteudo juridico dos consentimentos e autorizacoes listados abaixo.",
      ...selectedTemplates.map(
        (template, index) =>
          `${index + 1}. ${template.title}\nNatureza juridica: ${template.legalNature}.\nConteudo autorizado: ${template.termBody}`
      )
    ].join("\n\n")
  };
}

export function buildLegalAcceptanceRequestPayload(formData: FormData): LegalAcceptanceRequestPayload {
  const status = String(formData.get("status") ?? "PENDING_SIGNATURE");
  const collectionMethodValue = String(formData.get("collectionMethod") ?? "").trim();
  const legalBasis = String(formData.get("legalBasis") ?? "").trim();
  const coveredTermTypes = normalizeCoveredTermTypes(
    formData.getAll("coveredTermTypes").map((value) => String(value ?? ""))
  );

  return {
    termType: coveredTermTypes[0],
    coveredTermTypes,
    title: String(formData.get("title") ?? "").trim(),
    termsVersion: String(formData.get("termsVersion") ?? "").trim(),
    legalBasis: legalBasis || null,
    termBody: String(formData.get("termBody") ?? "").trim(),
    status,
    collectionMethod: status === "ACCEPTED" ? collectionMethodValue || null : null,
    evidenceNote: String(formData.get("evidenceNote") ?? "").trim()
  };
}

export function resolveLegalAcceptanceAttachments(formData: FormData) {
  const status = String(formData.get("status") ?? "PENDING_SIGNATURE");
  const collectionMethod = String(formData.get("collectionMethod") ?? "").trim();

  if (status !== "ACCEPTED") {
    return { errorMessage: null, tabletSignatureDataUrl: null, printedTermFile: null };
  }

  if (collectionMethod === "TABLET_SIGNATURE") {
    const tabletSignatureDataUrl = String(formData.get("tabletSignatureDataUrl") ?? "").trim();
    return {
      errorMessage: tabletSignatureDataUrl ? null : "Colete a assinatura no tablet antes de concluir o aceite.",
      tabletSignatureDataUrl: tabletSignatureDataUrl || null,
      printedTermFile: null
    };
  }

  if (collectionMethod === "PRINTED_SIGNATURE") {
    const printedTermFile = formData.get("printedTermFile");
    return {
      errorMessage:
        printedTermFile instanceof File && printedTermFile.size > 0
          ? null
          : "Anexe o termo assinado em papel para concluir o aceite.",
      tabletSignatureDataUrl: null,
      printedTermFile: printedTermFile instanceof File && printedTermFile.size > 0 ? printedTermFile : null
    };
  }

  return { errorMessage: null, tabletSignatureDataUrl: null, printedTermFile: null };
}
