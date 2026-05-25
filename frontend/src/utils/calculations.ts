// Core financial calculations for Queda
// All money values are in the user's main currency.

import {
  AppData,
  Envelope,
  Expense,
  FinancialStatus,
  Income,
  RecurringPayment,
  SavingsGoal,
} from "@/src/types";
import { addDays, daysBetween, isBetween, monthKey, todayISO } from "./dates";

/**
 * Days until the next payday (always >= 0).
 * Returns 0 if payday is today or earlier.
 */
export function calculateDaysUntilPayday(nextPaydayISO: string): number {
  const diff = daysBetween(todayISO(), nextPaydayISO);
  return Math.max(diff, 0);
}

/**
 * Returns recurring payments due between today and nextPayday (inclusive).
 */
export function calculateUpcomingPayments(
  payments: RecurringPayment[],
  nextPaydayISO: string,
): RecurringPayment[] {
  const today = todayISO();
  return payments
    .filter((p) => isBetween(p.nextDate, today, nextPaydayISO))
    .sort((a, b) => a.nextDate.localeCompare(b.nextDate));
}

/**
 * Returns one-time incomes (non-payday) expected before next payday.
 * The recurring payday income itself is NOT included — it lands on payday and
 * starts a new cycle.
 */
export function calculateUpcomingExtraIncomes(
  incomes: Income[],
  nextPaydayISO: string,
): Income[] {
  const today = todayISO();
  return incomes
    .filter((i) => !i.isRecurring && isBetween(i.date, today, nextPaydayISO))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Total reserved by all envelopes (subtracted from spendable money).
 */
export function calculateEnvelopesReserved(envelopes: Envelope[]): number {
  return envelopes.reduce((sum, e) => sum + (e.amountReserved || 0), 0);
}

/**
 * Total reserved by savings goals for this cycle.
 */
export function calculateGoalsReserved(goals: SavingsGoal[]): number {
  return goals.reduce((sum, g) => sum + (g.reservedThisCycle || 0), 0);
}

/**
 * Wallet total balance.
 */
export function calculateTotalBalance(data: AppData): number {
  return data.wallets.reduce((sum, w) => sum + (w.balance || 0), 0);
}

/**
 * Available money until next payday:
 *   balance + upcoming incomes - upcoming bills - envelopes - goals reserved
 * Excludes today's expenses (those already reduced the wallet balance when added).
 */
export function calculateAvailableUntilPayday(data: AppData): number {
  const balance = calculateTotalBalance(data);
  const upcomingIncomes = calculateUpcomingExtraIncomes(
    data.incomes,
    data.settings.nextPayday,
  ).reduce((s, i) => s + i.amount, 0);
  const upcomingBills = calculateUpcomingPayments(
    data.recurringPayments,
    data.settings.nextPayday,
  ).reduce((s, p) => s + p.amount, 0);
  const envelopes = calculateEnvelopesReserved(data.envelopes);
  const goals = calculateGoalsReserved(data.savingsGoals);

  return balance + upcomingIncomes - upcomingBills - envelopes - goals;
}

/**
 * Safe daily spend = available / days remaining.
 * Returns 0 if available <= 0 (avoid suggesting negative spend).
 */
export function calculateSafeDailySpend(data: AppData): number {
  const available = calculateAvailableUntilPayday(data);
  const days = Math.max(calculateDaysUntilPayday(data.settings.nextPayday), 1);
  if (available <= 0) return 0;
  return available / days;
}

/**
 * Simulates the impact of an additional purchase NOW.
 * Returns new available, new daily spend, and the delta from current safe daily spend.
 */
export function calculatePurchaseImpact(
  data: AppData,
  purchaseAmount: number,
): {
  currentDaily: number;
  newDaily: number;
  newAvailable: number;
  status: FinancialStatus;
  daysIfSpent: number;
} {
  const currentDaily = calculateSafeDailySpend(data);
  const available = calculateAvailableUntilPayday(data);
  const days = Math.max(calculateDaysUntilPayday(data.settings.nextPayday), 1);
  const newAvailable = available - purchaseAmount;
  const newDaily = newAvailable > 0 ? newAvailable / days : 0;
  // Days you could keep current spending if you don't reduce
  const daysIfSpent = currentDaily > 0 ? Math.max(0, Math.floor(newAvailable / currentDaily)) : 0;

  let status: FinancialStatus = "safe";
  if (newAvailable < 0) status = "risk";
  else if (newDaily < currentDaily * 0.6) status = "careful";

  return { currentDaily, newDaily, newAvailable, status, daysIfSpent };
}

/**
 * Returns the financial status of the user based on current safe daily spend.
 */
export function getFinancialStatus(data: AppData): FinancialStatus {
  const available = calculateAvailableUntilPayday(data);
  const days = Math.max(calculateDaysUntilPayday(data.settings.nextPayday), 1);
  if (available < 0) return "risk";
  const daily = available / days;
  // Compare to a "comfortable" threshold: if available / days >= incomeAmount / cycle days * 0.5 → safe
  // Simpler: thresholds based on absolute amounts (per-day comfort).
  const expectedPerDay = data.settings.incomeAmount / Math.max(getCycleDays(data), 1);
  if (daily >= expectedPerDay * 0.8) return "safe";
  if (daily >= expectedPerDay * 0.5) return "careful";
  return "risk";
}

/**
 * Total length of the current cycle in days (from previous payday to next).
 * Uses pay frequency as the cycle length.
 */
export function getCycleDays(data: AppData): number {
  switch (data.settings.payFrequency) {
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

/**
 * Returns 0..1 progress through the current cycle (where 1 = payday today).
 */
export function calculateCycleProgress(data: AppData): number {
  const cycleDays = getCycleDays(data);
  const daysLeft = calculateDaysUntilPayday(data.settings.nextPayday);
  const daysElapsed = Math.max(0, cycleDays - daysLeft);
  return Math.min(1, daysElapsed / cycleDays);
}

/**
 * Count of expenses recorded in the current month.
 * Used to enforce free plan 30-expense limit.
 */
export function getMonthlyExpenseCount(expenses: Expense[]): number {
  const key = monthKey();
  return expenses.filter((e) => monthKey(e.date) === key).length;
}

/**
 * Total spent in current cycle (from previous payday to today).
 */
export function getCycleSpending(data: AppData): number {
  const cycleStart = addDays(data.settings.nextPayday, -getCycleDays(data));
  const today = todayISO();
  return data.expenses
    .filter((e) => isBetween(e.date, cycleStart, today))
    .reduce((s, e) => s + e.amount, 0);
}

/**
 * Returns weekly simulator usage (resets each ISO week).
 */
export function getWeeklySimulatorUsage(data: AppData, currentWeekKey: string): number {
  return data.simulatorUsage.weekKey === currentWeekKey ? data.simulatorUsage.count : 0;
}

/**
 * Spending by category for a given date range.
 */
export function getSpendingByCategory(
  expenses: Expense[],
  fromISO: string,
  toISO: string,
): Record<string, number> {
  const result: Record<string, number> = {};
  expenses
    .filter((e) => isBetween(e.date, fromISO, toISO))
    .forEach((e) => {
      result[e.category] = (result[e.category] || 0) + e.amount;
    });
  return result;
}
