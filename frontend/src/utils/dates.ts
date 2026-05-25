// Date utilities — work with local dates as ISO strings (YYYY-MM-DD)
// or full ISO datetimes. All comparisons use day-precision.

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function parseISO(iso: string): Date {
  // Accept either YYYY-MM-DD or full ISO timestamp
  if (iso.length === 10) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const d = new Date(iso);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function daysBetween(fromISO: string, toISO: string): number {
  const from = parseISO(fromISO).getTime();
  const to = parseISO(toISO).getTime();
  return Math.round((to - from) / 86400000);
}

export function addDays(iso: string, days: number): string {
  const d = parseISO(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function isSameDay(a: string, b: string): boolean {
  return parseISO(a).getTime() === parseISO(b).getTime();
}

export function isBetween(check: string, startIso: string, endIso: string): boolean {
  const c = parseISO(check).getTime();
  return c >= parseISO(startIso).getTime() && c <= parseISO(endIso).getTime();
}

// ISO week key like "2026-W08"
export function isoWeekKey(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export function monthKey(date: Date | string = new Date()): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function getFrequencyDays(
  freq: "weekly" | "biweekly" | "monthly" | "irregular" | "custom",
): number {
  switch (freq) {
    case "weekly":
      return 7;
    case "biweekly":
      return 14;
    case "monthly":
      return 30;
    default:
      return 30;
  }
}

// Add a frequency to a date
export function addFrequency(
  iso: string,
  freq: "weekly" | "biweekly" | "monthly" | "irregular" | "custom",
): string {
  return addDays(iso, getFrequencyDays(freq));
}

export function formatDateShort(iso: string, lang: "es" | "en" = "es"): string {
  const d = parseISO(iso);
  const months =
    lang === "es"
      ? ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

export function formatDateLong(iso: string, lang: "es" | "en" = "es"): string {
  const d = parseISO(iso);
  const months =
    lang === "es"
      ? ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
      : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${d.getDate()} ${lang === "es" ? "de" : ""} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function getRelativeDay(iso: string, lang: "es" | "en" = "es"): string {
  const diff = daysBetween(todayISO(), iso);
  if (diff === 0) return lang === "es" ? "Hoy" : "Today";
  if (diff === 1) return lang === "es" ? "Mañana" : "Tomorrow";
  if (diff === -1) return lang === "es" ? "Ayer" : "Yesterday";
  if (diff > 0) return lang === "es" ? `En ${diff} días` : `In ${diff} days`;
  return lang === "es" ? `Hace ${Math.abs(diff)} días` : `${Math.abs(diff)} days ago`;
}
