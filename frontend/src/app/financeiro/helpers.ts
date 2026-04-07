export function getToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Fortaleza"
  }).format(new Date());
}

export function getMonthRange() {
  const today = new Date(`${getToday()}T12:00:00`);
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return {
    startDate: startDate.toLocaleDateString("en-CA"),
    endDate: endDate.toLocaleDateString("en-CA")
  };
}

export function formatCurrency(value: string) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

export function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

export function statusClass(status: string) {
  if (status === "PAID" || status === "ACTIVE") {
    return "rounded-full bg-[rgba(25,135,84,0.12)] px-3 py-1 text-xs font-semibold text-brand-success";
  }

  if (status === "OPEN") {
    return "rounded-full bg-[rgba(255,193,7,0.18)] px-3 py-1 text-xs font-semibold text-[#8a6200]";
  }

  return "rounded-full bg-[rgba(220,53,69,0.08)] px-3 py-1 text-xs font-semibold text-brand-danger";
}

export function statusLabel(status: string) {
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
