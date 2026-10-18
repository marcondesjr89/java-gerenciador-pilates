const BRAZIL_LOCALE = "pt-BR";
const FALLBACK_TIME_ZONE = "UTC";
const ISO_DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const LOCAL_TIME_PATTERN = /^(\d{2}):(\d{2})(?::(\d{2}))?$/;

function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat(BRAZIL_LOCALE, { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function getStudioTimeZone(explicitTimeZone?: string): string {
  const candidates = [
    explicitTimeZone?.trim(),
    process.env.NEXT_PUBLIC_STUDIO_TIMEZONE?.trim(),
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    FALLBACK_TIME_ZONE
  ];

  for (const candidate of candidates) {
    if (candidate && isValidTimeZone(candidate)) {
      return candidate;
    }
  }

  return FALLBACK_TIME_ZONE;
}

function toLocalDate(value: string) {
  const trimmed = value.trim();
  if (ISO_DATE_ONLY_PATTERN.test(trimmed)) {
    return new Date(`${trimmed}T12:00:00`);
  }
  return new Date(trimmed);
}

export function getTodayIsoDate(timeZone?: string, referenceDate: Date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: getStudioTimeZone(timeZone),
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(referenceDate);
}

export function formatDate(value: string | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!value || !value.trim()) {
    return "Nao informado";
  }
  return toLocalDate(value).toLocaleDateString(BRAZIL_LOCALE, options);
}

export function formatDateTime(value: string, options?: Intl.DateTimeFormatOptions) {
  return new Date(value).toLocaleString(BRAZIL_LOCALE, {
    timeZone: getStudioTimeZone(options?.timeZone),
    ...options
  });
}

export function formatNullableDateTime(
  value: string | null | undefined,
  options?: Intl.DateTimeFormatOptions
) {
  if (!value || !value.trim()) {
    return "Nao registrado";
  }

  return formatDateTime(value.trim(), options);
}

export function formatCurrency(value: number | string | null | undefined) {
  if (value === null || value === undefined || (typeof value === "string" && !value.trim())) {
    return (0).toLocaleString(BRAZIL_LOCALE, {
      style: "currency",
      currency: "BRL"
    });
  }

  const numericValue = typeof value === "number" ? value : Number(value);
  const safeValue = Number.isFinite(numericValue) ? numericValue : 0;

  return safeValue.toLocaleString(BRAZIL_LOCALE, {
    style: "currency",
    currency: "BRL"
  });
}

export function formatStudioHour(value: string, timeZone?: string) {
  return new Date(value).toLocaleTimeString(BRAZIL_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: getStudioTimeZone(timeZone)
  });
}

export function formatUtcHour(value: string, timeZone?: string) {
  return formatStudioHour(value, timeZone);
}

export function formatSpecialty(value: string) {
  if (!value || !value.trim()) {
    return "";
  }

  return value
    .trim()
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

function getTimeZoneOffsetMs(utcMs: number, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });

  const parts = formatter.formatToParts(new Date(utcMs));
  const partValues: Record<string, number> = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      partValues[part.type] = Number(part.value);
    }
  }

  const zonedAsUtcMs = Date.UTC(
    partValues.year,
    (partValues.month ?? 1) - 1,
    partValues.day ?? 1,
    (partValues.hour ?? 0) % 24,
    partValues.minute ?? 0,
    partValues.second ?? 0,
    0
  );

  return zonedAsUtcMs - utcMs;
}

export function toUtcIsoDateTime(date: string, time: string, timeZone?: string) {
  const dateMatch = ISO_DATE_ONLY_PATTERN.exec(date.trim());
  const timeMatch = LOCAL_TIME_PATTERN.exec(time.trim());

  if (!dateMatch || !timeMatch) {
    throw new Error("Data ou horario invalido para conversao UTC.");
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  const second = timeMatch[3] ? Number(timeMatch[3]) : 0;

  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59 ||
    second < 0 ||
    second > 59
  ) {
    throw new Error("Valores fora do limite para data ou horario.");
  }

  const resolvedTimeZone = getStudioTimeZone(timeZone);
  const utcGuessMs = Date.UTC(year, month - 1, day, hour, minute, second, 0);
  const initialOffsetMs = getTimeZoneOffsetMs(utcGuessMs, resolvedTimeZone);
  const firstPassUtcMs = utcGuessMs - initialOffsetMs;
  const refinedOffsetMs = getTimeZoneOffsetMs(firstPassUtcMs, resolvedTimeZone);
  const finalUtcMs = utcGuessMs - refinedOffsetMs;

  return new Date(finalUtcMs).toISOString().replace(".000Z", "Z");
}
