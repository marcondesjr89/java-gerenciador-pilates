export function formatCpf(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  return value;
}

export function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR");
}

export function formatDateTimeWithTimezone(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

export function formatLegalTermType(value: string) {
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

export function formatLegalStatus(value: string) {
  switch (value) {
    case "ACCEPTED":
      return "Aceito";
    case "PENDING_SIGNATURE":
      return "Pendente";
    default:
      return value;
  }
}

export function formatCollectionMethod(value: string | null) {
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

export function formatAttachmentType(value: string) {
  switch (value) {
    case "TABLET_SIGNATURE":
      return "Assinatura do tablet";
    case "PRINTED_SIGNED_TERM":
      return "Termo assinado";
    default:
      return value;
  }
}

export function getAge(value: string) {
  const today = new Date();
  const birthDate = new Date(`${value}T12:00:00`);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
}
