// Queda app data models
export type Currency = "USD" | "MXN" | "COP" | "ARS" | "EUR" | "VES" | "PEN" | "CLP" | "BRL";
export type Language = "es" | "en";
export type PayFrequency = "weekly" | "biweekly" | "monthly" | "irregular" | "custom";
export type PremiumPlan = "free" | "pro" | "plus";
export type FinancialStatus = "safe" | "careful" | "risk";

export type ExpenseCategory =
  | "food"
  | "transport"
  | "home"
  | "subscriptions"
  | "fun"
  | "health"
  | "shopping"
  | "debt"
  | "other";

export interface Wallet {
  id: string;
  name: string;
  currency: Currency;
  balance: number;
}

export interface Income {
  id: string;
  name: string;
  amount: number;
  date: string; // ISO date
  frequency: PayFrequency;
  isRecurring: boolean;
  walletId: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  date: string; // ISO date
  category: ExpenseCategory;
  walletId: string;
}

export interface RecurringPayment {
  id: string;
  name: string;
  amount: number;
  nextDate: string; // ISO date
  frequency: PayFrequency;
  category: ExpenseCategory;
  walletId: string;
}

export interface Envelope {
  id: string;
  name: string;
  amountReserved: number;
  color: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  dueDate?: string;
  reservedThisCycle: number;
}

export interface UserSettings {
  language: Language;
  mainCurrency: Currency;
  nextPayday: string; // ISO date
  payFrequency: PayFrequency;
  incomeAmount: number;
  theme: "light" | "dark";
  onboardingCompleted: boolean;
  setupCompleted: boolean;
}

export interface PremiumState {
  plan: PremiumPlan;
  mockActive: boolean;
}

export interface SimulatorUsage {
  // ISO week string keys (e.g., "2026-W08")
  weekKey: string;
  count: number;
}

export interface AppData {
  settings: UserSettings;
  premium: PremiumState;
  wallets: Wallet[];
  incomes: Income[];
  expenses: Expense[];
  recurringPayments: RecurringPayment[];
  envelopes: Envelope[];
  savingsGoals: SavingsGoal[];
  simulatorUsage: SimulatorUsage;
}
