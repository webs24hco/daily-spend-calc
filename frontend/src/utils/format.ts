import { CURRENCIES } from "@/src/constants";
import { Currency } from "@/src/types";

export function getCurrencySymbol(code: Currency): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? "$";
}

export function formatMoney(
  amount: number,
  currency: Currency = "USD",
  options: { decimals?: number; showSign?: boolean } = {},
): string {
  const { decimals = 2, showSign = false } = options;
  const symbol = getCurrencySymbol(currency);
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const negative = safeAmount < 0;
  const abs = Math.abs(safeAmount);

  // Format with thousands separators
  const fixed = abs.toFixed(decimals);
  const [intPart, decPart] = fixed.split(".");
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const formatted = decPart ? `${withCommas}.${decPart}` : withCommas;

  const sign = negative ? "-" : showSign ? "+" : "";
  return `${sign}${symbol}${formatted}`;
}

export function formatMoneyCompact(amount: number, currency: Currency = "USD"): string {
  if (Math.abs(amount) >= 1000) {
    return formatMoney(amount / 1000, currency, { decimals: 1 }) + "k";
  }
  return formatMoney(amount, currency, { decimals: 0 });
}

export function parseMoneyInput(input: string): number {
  // Remove currency symbols, commas, spaces — keep digits, dots, minus
  const cleaned = input.replace(/[^0-9.\-]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}
