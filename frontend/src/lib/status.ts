const SUCCESS_BADGE = "rounded-full bg-[rgba(25,135,84,0.12)] px-3 py-1 text-xs font-semibold text-[#0f5132] dark:text-[#75b798]";
const WARNING_BADGE = "rounded-full bg-[rgba(255,193,7,0.18)] px-3 py-1 text-xs font-semibold text-[#855700] dark:text-[#ffcd39]";
const DANGER_BADGE = "rounded-full bg-[rgba(220,53,69,0.10)] px-3 py-1 text-xs font-semibold text-[#b02a37] dark:text-[#ff8591]";
const NEUTRAL_BADGE = "rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-secondary";

export function getStatusBadgeClass(status: string) {
  switch (status) {
    case "ACTIVE":
    case "PAID":
    case "SENT":
      return SUCCESS_BADGE;
    case "OPEN":
      return WARNING_BADGE;
    case "PENDING":
    case "ANONYMIZED":
      return NEUTRAL_BADGE;
    default:
      return DANGER_BADGE;
  }
}

export function formatStudentStatus(status: string) {
  switch (status) {
    case "ACTIVE":
      return "Ativo";
    case "INACTIVE":
    case "CANCELED":
      return "Inativo";
    case "ANONYMIZED":
      return "Anonimizado";
    default:
      return status;
  }
}

export function formatBillingStatus(status: string) {
  switch (status) {
    case "ACTIVE":
      return "Ativa";
    case "CANCELED":
      return "Cancelada";
    case "OPEN":
      return "Aberta";
    case "PAID":
      return "Paga";
    default:
      return status;
  }
}

export function formatNotificationStatus(status: string) {
  switch (status) {
    case "SENT":
      return "Enviada";
    case "PENDING":
      return "Pendente";
    case "FAILED":
      return "Falhou";
    default:
      return status;
  }
}
