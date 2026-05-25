// Plan limits utility — single source of truth for what's allowed per plan.

import { PLAN_LIMITS, PlanLimits } from "@/src/constants";
import { AppData, PremiumPlan } from "@/src/types";
import { isoWeekKey } from "./dates";
import { getMonthlyExpenseCount, getWeeklySimulatorUsage } from "./calculations";

export type PaywallReason =
  | "expenses"
  | "bills"
  | "envelopes"
  | "wallets"
  | "incomes"
  | "goals"
  | "simulator"
  | "monthly"
  | "projection"
  | "multiCurrency"
  | "export";

export function getEffectivePlan(data: AppData): PremiumPlan {
  return data.premium.mockActive ? data.premium.plan : "free";
}

export function getLimits(data: AppData): PlanLimits {
  return PLAN_LIMITS[getEffectivePlan(data)];
}

export function applyPlanLimits(data: AppData) {
  return getLimits(data);
}

// Check whether the user can perform an action right now.
export function canAddExpense(data: AppData): { ok: true } | { ok: false; reason: PaywallReason } {
  const limits = getLimits(data);
  const count = getMonthlyExpenseCount(data.expenses);
  if (count >= limits.expensesPerMonth) return { ok: false, reason: "expenses" };
  return { ok: true };
}

export function canAddBill(data: AppData): { ok: true } | { ok: false; reason: PaywallReason } {
  const limits = getLimits(data);
  if (data.recurringPayments.length >= limits.recurringPayments)
    return { ok: false, reason: "bills" };
  return { ok: true };
}

export function canAddEnvelope(
  data: AppData,
): { ok: true } | { ok: false; reason: PaywallReason } {
  const limits = getLimits(data);
  if (data.envelopes.length >= limits.envelopes) return { ok: false, reason: "envelopes" };
  return { ok: true };
}

export function canAddWallet(data: AppData): { ok: true } | { ok: false; reason: PaywallReason } {
  const limits = getLimits(data);
  if (data.wallets.length >= limits.wallets) return { ok: false, reason: "wallets" };
  return { ok: true };
}

export function canAddRecurringIncome(
  data: AppData,
): { ok: true } | { ok: false; reason: PaywallReason } {
  const limits = getLimits(data);
  const recurringCount = data.incomes.filter((i) => i.isRecurring).length;
  if (recurringCount >= limits.recurringIncomes) return { ok: false, reason: "incomes" };
  return { ok: true };
}

export function canAddGoal(data: AppData): { ok: true } | { ok: false; reason: PaywallReason } {
  const limits = getLimits(data);
  if (data.savingsGoals.length >= limits.savingsGoals) return { ok: false, reason: "goals" };
  return { ok: true };
}

export function canUseSimulator(
  data: AppData,
): { ok: true } | { ok: false; reason: PaywallReason } {
  const limits = getLimits(data);
  const week = isoWeekKey();
  const used = getWeeklySimulatorUsage(data, week);
  if (used >= limits.simulatorPerWeek) return { ok: false, reason: "simulator" };
  return { ok: true };
}

export function canViewMonthlyReport(
  data: AppData,
): { ok: true } | { ok: false; reason: PaywallReason } {
  if (!getLimits(data).monthlyReport) return { ok: false, reason: "monthly" };
  return { ok: true };
}

export function canViewProjection(
  data: AppData,
): { ok: true } | { ok: false; reason: PaywallReason } {
  if (!getLimits(data).thirtyDayProjection) return { ok: false, reason: "projection" };
  return { ok: true };
}

export function canUseMultiCurrency(
  data: AppData,
): { ok: true } | { ok: false; reason: PaywallReason } {
  if (!getLimits(data).multiCurrency) return { ok: false, reason: "multiCurrency" };
  return { ok: true };
}

export function canExport(data: AppData): { ok: true } | { ok: false; reason: PaywallReason } {
  if (!getLimits(data).exportPdfCsv) return { ok: false, reason: "export" };
  return { ok: true };
}
