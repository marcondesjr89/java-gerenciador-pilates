import { afterEach, describe, expect, it, vi } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNullableDateTime,
  formatPercent,
  formatSpecialty,
  formatStudioHour,
  formatUtcHour,
  getStudioTimeZone,
  getTodayIsoDate,
  toUtcIsoDateTime
} from "@/lib/formatters";

describe("formatters", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe("getStudioTimeZone", () => {
    it("prioriza o fuso explícito quando informado e válido", () => {
      vi.stubEnv("NEXT_PUBLIC_STUDIO_TIMEZONE", "America/Sao_Paulo");
      expect(getStudioTimeZone("America/Manaus")).toBe("America/Manaus");
    });

    it("utiliza NEXT_PUBLIC_STUDIO_TIMEZONE quando nenhum fuso explícito é informado", () => {
      vi.stubEnv("NEXT_PUBLIC_STUDIO_TIMEZONE", "America/Rio_Branco");
      expect(getStudioTimeZone()).toBe("America/Rio_Branco");
    });

    it("detecta dinamicamente o fuso do navegador/ambiente quando a variável não está definida", () => {
      vi.stubEnv("NEXT_PUBLIC_STUDIO_TIMEZONE", "");
      const resolved = getStudioTimeZone();
      expect(resolved.length).toBeGreaterThan(0);
    });

    it("faz fallback seguro quando fuso explícito ou variável de ambiente são inválidos", () => {
      vi.stubEnv("NEXT_PUBLIC_STUDIO_TIMEZONE", "Fuso/Inexistente_123");
      const resolved = getStudioTimeZone("Outro/Fuso_Invalido");
      expect(resolved).toBeTruthy();
      expect(resolved).not.toBe("Fuso/Inexistente_123");
      expect(resolved).not.toBe("Outro/Fuso_Invalido");
    });
  });

  describe("toUtcIsoDateTime e formatStudioHour / formatUtcHour (Fusos Brasileiros UTC <-> Local)", () => {
    it("converte corretamente no fuso de Brasília (America/Sao_Paulo, UTC-3)", () => {
      const utcIso = toUtcIsoDateTime("2026-10-18", "08:00", "America/Sao_Paulo");
      expect(utcIso).toBe("2026-10-18T11:00:00Z");
      expect(formatStudioHour(utcIso, "America/Sao_Paulo")).toBe("08:00");
      expect(formatUtcHour(utcIso, "America/Sao_Paulo")).toBe("08:00");
    });

    it("converte corretamente no fuso do Amazonas (America/Manaus, UTC-4)", () => {
      const utcIso = toUtcIsoDateTime("2026-10-18", "08:00", "America/Manaus");
      expect(utcIso).toBe("2026-10-18T12:00:00Z");
      expect(formatStudioHour(utcIso, "America/Manaus")).toBe("08:00");
      expect(formatUtcHour(utcIso, "America/Manaus")).toBe("08:00");
    });

    it("converte corretamente no fuso do Acre (America/Rio_Branco, UTC-5)", () => {
      const utcIso = toUtcIsoDateTime("2026-10-18", "08:00", "America/Rio_Branco");
      expect(utcIso).toBe("2026-10-18T13:00:00Z");
      expect(formatStudioHour(utcIso, "America/Rio_Branco")).toBe("08:00");
      expect(formatUtcHour(utcIso, "America/Rio_Branco")).toBe("08:00");
    });

    it("converte corretamente no fuso de Fernando de Noronha (America/Noronha, UTC-2)", () => {
      const utcIso = toUtcIsoDateTime("2026-10-18", "08:00", "America/Noronha");
      expect(utcIso).toBe("2026-10-18T10:00:00Z");
      expect(formatStudioHour(utcIso, "America/Noronha")).toBe("08:00");
      expect(formatUtcHour(utcIso, "America/Noronha")).toBe("08:00");
    });

    it("preserva consistência na virada de dia entre horário local noturno e UTC", () => {
      const utcIso = toUtcIsoDateTime("2026-10-18", "22:30", "America/Sao_Paulo");
      expect(utcIso).toBe("2026-10-19T01:30:00Z");
      expect(formatStudioHour(utcIso, "America/Sao_Paulo")).toBe("22:30");
      expect(formatUtcHour(utcIso, "UTC")).toBe("01:30");
    });

    it("trata limites de meia-noite (00:00) e último minuto do dia (23:59)", () => {
      const midnightUtc = toUtcIsoDateTime("2026-10-18", "00:00", "America/Sao_Paulo");
      expect(midnightUtc).toBe("2026-10-18T03:00:00Z");
      expect(formatStudioHour(midnightUtc, "America/Sao_Paulo")).toBe("00:00");

      const endOfDayUtc = toUtcIsoDateTime("2026-10-18", "23:59:00", "America/Sao_Paulo");
      expect(endOfDayUtc).toBe("2026-10-19T02:59:00Z");
      expect(formatStudioHour(endOfDayUtc, "America/Sao_Paulo")).toBe("23:59");
    });

    it("lança erro explícito para entradas de data ou hora malformadas ou fora dos limites", () => {
      expect(() => toUtcIsoDateTime("", "08:00")).toThrow("Data ou horario invalido para conversao UTC.");
      expect(() => toUtcIsoDateTime("18/10/2026", "08:00")).toThrow("Data ou horario invalido para conversao UTC.");
      expect(() => toUtcIsoDateTime("2026-10-18", "8h")).toThrow("Data ou horario invalido para conversao UTC.");
      expect(() => toUtcIsoDateTime("2026-13-18", "08:00")).toThrow("Valores fora do limite para data ou horario.");
      expect(() => toUtcIsoDateTime("2026-10-18", "24:00")).toThrow("Valores fora do limite para data ou horario.");
      expect(() => toUtcIsoDateTime("2026-10-18", "08:60")).toThrow("Valores fora do limite para data ou horario.");
    });
  });

  describe("getTodayIsoDate", () => {
    it("retorna a data ISO correspondente ao fuso configurado mesmo próximo à virada de dia UTC", () => {
      const lateNightUtc = new Date("2026-10-19T01:30:00Z");
      expect(getTodayIsoDate("America/Sao_Paulo", lateNightUtc)).toBe("2026-10-18");
      expect(getTodayIsoDate("UTC", lateNightUtc)).toBe("2026-10-19");
    });
  });

  describe("formatDate, formatDateTime e formatNullableDateTime", () => {
    it("retorna 'Nao informado' para datas nulas, indefinidas ou em branco", () => {
      expect(formatDate(null)).toBe("Nao informado");
      expect(formatDate(undefined)).toBe("Nao informado");
      expect(formatDate("")).toBe("Nao informado");
      expect(formatDate("   ")).toBe("Nao informado");
    });

    it("formata data ISO (YYYY-MM-DD) no padrão brasileiro sem deslocamento de dia", () => {
      expect(formatDate("2026-10-18")).toBe("18/10/2026");
    });

    it("retorna 'Nao registrado' em formatNullableDateTime quando valor é nulo ou vazio", () => {
      expect(formatNullableDateTime(null)).toBe("Nao registrado");
      expect(formatNullableDateTime(undefined)).toBe("Nao registrado");
      expect(formatNullableDateTime("")).toBe("Nao registrado");
      expect(formatNullableDateTime("   ")).toBe("Nao registrado");
    });

    it("formata data e hora em formatDateTime e formatNullableDateTime respeitando o fuso", () => {
      const formatted = formatNullableDateTime("2026-10-18T11:00:00Z", {
        timeZone: "America/Sao_Paulo",
        dateStyle: "short",
        timeStyle: "short"
      });
      expect(formatted).toContain("18/10/2026");
      expect(formatted).toContain("08:00");

      const directFormatted = formatDateTime("2026-10-18T12:00:00Z", {
        timeZone: "America/Manaus",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
      expect(directFormatted).toContain("08:00");
    });
  });

  describe("formatCurrency, formatPercent e formatSpecialty", () => {
    it("formata valores monetários numéricos, strings, centavos e valores inválidos com segurança", () => {
      expect(formatCurrency(250)).toMatch(/R\$\s*250,00/);
      expect(formatCurrency("149.9")).toMatch(/R\$\s*149,90/);
      expect(formatCurrency(0.01)).toMatch(/R\$\s*0,01/);
      expect(formatCurrency(0)).toMatch(/R\$\s*0,00/);
      expect(formatCurrency(null)).toMatch(/R\$\s*0,00/);
      expect(formatCurrency(undefined)).toMatch(/R\$\s*0,00/);
      expect(formatCurrency("   ")).toMatch(/R\$\s*0,00/);
      expect(formatCurrency("invalido")).toMatch(/R\$\s*0,00/);
    });

    it("formata percentuais com precisão padrão e customizada", () => {
      expect(formatPercent(82.5)).toBe("82,50");
      expect(formatPercent(100, 0, 0)).toBe("100");
    });

    it("formata especialidades clínicas e lida com strings em branco", () => {
      expect(formatSpecialty("PILATES_CLINICO")).toBe("Pilates Clinico");
      expect(formatSpecialty("REABILITACAO")).toBe("Reabilitacao");
      expect(formatSpecialty("   ")).toBe("");
    });
  });
});
