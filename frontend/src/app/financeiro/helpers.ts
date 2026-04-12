import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getTodayIsoDate
} from "@/lib/formatters";
import { formatBillingStatus, getStatusBadgeClass } from "@/lib/status";

export function getToday() {
  return getTodayIsoDate();
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

export { formatCurrency, formatDate };

export function formatDateTimeWithTime(value: string) {
  return formatDateTime(value, {
    dateStyle: "short",
    timeStyle: "short"
  });
}

export function statusClass(status: string) {
  return getStatusBadgeClass(status);
}

export function statusLabel(status: string) {
  return formatBillingStatus(status);
}
