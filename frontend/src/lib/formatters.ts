const BRAZIL_LOCALE = "pt-BR";
const FORTALEZA_TIME_ZONE = "America/Fortaleza";

function toLocalDate(value: string) {
  return new Date(`${value}T12:00:00`);
}

export function getTodayIsoDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FORTALEZA_TIME_ZONE
  }).format(new Date());
}

export function formatDate(value: string | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!value) {
    return "Nao informado";
  }
  return toLocalDate(value).toLocaleDateString(BRAZIL_LOCALE, options);
}

export function formatDateTime(value: string, options?: Intl.DateTimeFormatOptions) {
  return new Date(value).toLocaleString(BRAZIL_LOCALE, options);
}

export function formatNullableDateTime(value: string | null, options?: Intl.DateTimeFormatOptions) {
  if (!value) {
    return "Nao registrado";
  }

  return formatDateTime(value, options);
}

export function formatCurrency(value: number | string) {
  return Number(value).toLocaleString(BRAZIL_LOCALE, {
    style: "currency",
    currency: "BRL"
  });
}

export function formatUtcHour(value: string) {
  return new Date(value).toLocaleTimeString(BRAZIL_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC"
  });
}

export function formatSpecialty(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatPercent(value: number, minimumFractionDigits = 2, maximumFractionDigits = 2) {
  return value.toLocaleString(BRAZIL_LOCALE, {
    minimumFractionDigits,
    maximumFractionDigits
  });
}

export function toUtcIsoDateTime(date: string, time: string) {
  return `${date}T${time}:00Z`;
}
