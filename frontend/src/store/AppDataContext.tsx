// AppDataContext — central state for Queda app.
// All data persisted in AsyncStorage via @/src/utils/storage.

import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { STORAGE_KEYS } from "@/src/constants";
import {
  AppData,
  Envelope,
  Expense,
  Income,
  Language,
  PremiumPlan,
  RecurringPayment,
  SavingsGoal,
  UserSettings,
  Wallet,
} from "@/src/types";
import { addDays, isoWeekKey, todayISO } from "@/src/utils/dates";
import { storage } from "@/src/utils/storage";

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function defaultAppData(): AppData {
  const defaultWalletId = uid();
  return {
    settings: {
      language: "es",
      mainCurrency: "USD",
      nextPayday: addDays(todayISO(), 14),
      payFrequency: "biweekly",
      incomeAmount: 0,
      theme: "light",
      onboardingCompleted: false,
      setupCompleted: false,
    },
    premium: { plan: "free", mockActive: false },
    wallets: [
      {
        id: defaultWalletId,
        name: "Principal",
        currency: "USD",
        balance: 0,
      },
    ],
    incomes: [],
    expenses: [],
    recurringPayments: [],
    envelopes: [],
    savingsGoals: [],
    simulatorUsage: { weekKey: isoWeekKey(), count: 0 },
  };
}

interface AppDataContextValue {
  data: AppData;
  loaded: boolean;
  // Settings
  updateSettings: (patch: Partial<UserSettings>) => Promise<void>;
  setLanguage: (lang: Language) => Promise<void>;
  // Premium
  setMockPremium: (plan: PremiumPlan, active: boolean) => Promise<void>;
  // Wallets
  upsertWallet: (wallet: Wallet) => Promise<void>;
  updatePrimaryWalletBalance: (balance: number) => Promise<void>;
  // Incomes
  addIncome: (income: Omit<Income, "id">) => Promise<void>;
  updateIncome: (income: Income) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  // Expenses
  addExpense: (expense: Omit<Expense, "id">) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  // Recurring payments
  addRecurringPayment: (p: Omit<RecurringPayment, "id">) => Promise<void>;
  updateRecurringPayment: (p: RecurringPayment) => Promise<void>;
  deleteRecurringPayment: (id: string) => Promise<void>;
  // Envelopes
  addEnvelope: (e: Omit<Envelope, "id">) => Promise<void>;
  updateEnvelope: (e: Envelope) => Promise<void>;
  deleteEnvelope: (id: string) => Promise<void>;
  // Savings goals
  addGoal: (g: Omit<SavingsGoal, "id">) => Promise<void>;
  updateGoal: (g: SavingsGoal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  // Simulator
  incrementSimulatorUsage: () => Promise<void>;
  // Reset
  resetAll: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => defaultAppData());
  const [loaded, setLoaded] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      // Storage helper supports primitive types; we serialize the object manually.
      const raw = await storage.getItem(STORAGE_KEYS.APP_DATA, null as string | null);
      if (mounted) {
        if (raw && typeof raw === "string") {
          try {
            const parsed = JSON.parse(raw) as AppData;
            // Migrate/sanitize simulator week
            const week = isoWeekKey();
            if (parsed.simulatorUsage?.weekKey !== week) {
              parsed.simulatorUsage = { weekKey: week, count: 0 };
            }
            setData(parsed);
          } catch {
            // ignore parse errors, fall back to defaults
          }
        }
        setLoaded(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback(async (next: AppData) => {
    await storage.setItem(STORAGE_KEYS.APP_DATA, JSON.stringify(next));
  }, []);

  const mutate = useCallback(
    async (updater: (prev: AppData) => AppData) => {
      let next!: AppData;
      setData((prev) => {
        next = updater(prev);
        return next;
      });
      // Persist after state update (use the computed `next` directly).
      await persist(next);
    },
    [persist],
  );

  const updateSettings = useCallback(
    (patch: Partial<UserSettings>) =>
      mutate((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } })),
    [mutate],
  );

  const setLanguage = useCallback(
    (lang: Language) =>
      mutate((prev) => ({ ...prev, settings: { ...prev.settings, language: lang } })),
    [mutate],
  );

  const setMockPremium = useCallback(
    (plan: PremiumPlan, active: boolean) =>
      mutate((prev) => ({ ...prev, premium: { plan, mockActive: active } })),
    [mutate],
  );

  const upsertWallet = useCallback(
    (wallet: Wallet) =>
      mutate((prev) => {
        const idx = prev.wallets.findIndex((w) => w.id === wallet.id);
        const wallets = [...prev.wallets];
        if (idx >= 0) wallets[idx] = wallet;
        else wallets.push(wallet);
        return { ...prev, wallets };
      }),
    [mutate],
  );

  const updatePrimaryWalletBalance = useCallback(
    (balance: number) =>
      mutate((prev) => {
        const wallets = [...prev.wallets];
        if (wallets.length === 0) {
          wallets.push({
            id: uid(),
            name: "Principal",
            currency: prev.settings.mainCurrency,
            balance,
          });
        } else {
          wallets[0] = { ...wallets[0], balance };
        }
        return { ...prev, wallets };
      }),
    [mutate],
  );

  const addIncome = useCallback(
    (income: Omit<Income, "id">) =>
      mutate((prev) => ({
        ...prev,
        incomes: [...prev.incomes, { ...income, id: uid() }],
      })),
    [mutate],
  );
  const updateIncome = useCallback(
    (income: Income) =>
      mutate((prev) => ({
        ...prev,
        incomes: prev.incomes.map((i) => (i.id === income.id ? income : i)),
      })),
    [mutate],
  );
  const deleteIncome = useCallback(
    (id: string) =>
      mutate((prev) => ({ ...prev, incomes: prev.incomes.filter((i) => i.id !== id) })),
    [mutate],
  );

  const addExpense = useCallback(
    (expense: Omit<Expense, "id">) =>
      mutate((prev) => {
        // Subtract from primary wallet immediately (mirrors real spending).
        const wallets = [...prev.wallets];
        const wIdx = wallets.findIndex((w) => w.id === expense.walletId);
        if (wIdx >= 0) {
          wallets[wIdx] = {
            ...wallets[wIdx],
            balance: wallets[wIdx].balance - expense.amount,
          };
        }
        return {
          ...prev,
          wallets,
          expenses: [...prev.expenses, { ...expense, id: uid() }],
        };
      }),
    [mutate],
  );
  const updateExpense = useCallback(
    (expense: Expense) =>
      mutate((prev) => {
        const old = prev.expenses.find((e) => e.id === expense.id);
        const delta = (old?.amount ?? 0) - expense.amount;
        const wallets = [...prev.wallets];
        const wIdx = wallets.findIndex((w) => w.id === expense.walletId);
        if (wIdx >= 0) {
          wallets[wIdx] = { ...wallets[wIdx], balance: wallets[wIdx].balance + delta };
        }
        return {
          ...prev,
          wallets,
          expenses: prev.expenses.map((e) => (e.id === expense.id ? expense : e)),
        };
      }),
    [mutate],
  );
  const deleteExpense = useCallback(
    (id: string) =>
      mutate((prev) => {
        const old = prev.expenses.find((e) => e.id === id);
        const wallets = [...prev.wallets];
        if (old) {
          const wIdx = wallets.findIndex((w) => w.id === old.walletId);
          if (wIdx >= 0) {
            wallets[wIdx] = { ...wallets[wIdx], balance: wallets[wIdx].balance + old.amount };
          }
        }
        return { ...prev, wallets, expenses: prev.expenses.filter((e) => e.id !== id) };
      }),
    [mutate],
  );

  const addRecurringPayment = useCallback(
    (p: Omit<RecurringPayment, "id">) =>
      mutate((prev) => ({
        ...prev,
        recurringPayments: [...prev.recurringPayments, { ...p, id: uid() }],
      })),
    [mutate],
  );
  const updateRecurringPayment = useCallback(
    (p: RecurringPayment) =>
      mutate((prev) => ({
        ...prev,
        recurringPayments: prev.recurringPayments.map((x) => (x.id === p.id ? p : x)),
      })),
    [mutate],
  );
  const deleteRecurringPayment = useCallback(
    (id: string) =>
      mutate((prev) => ({
        ...prev,
        recurringPayments: prev.recurringPayments.filter((x) => x.id !== id),
      })),
    [mutate],
  );

  const addEnvelope = useCallback(
    (e: Omit<Envelope, "id">) =>
      mutate((prev) => ({
        ...prev,
        envelopes: [...prev.envelopes, { ...e, id: uid() }],
      })),
    [mutate],
  );
  const updateEnvelope = useCallback(
    (e: Envelope) =>
      mutate((prev) => ({
        ...prev,
        envelopes: prev.envelopes.map((x) => (x.id === e.id ? e : x)),
      })),
    [mutate],
  );
  const deleteEnvelope = useCallback(
    (id: string) =>
      mutate((prev) => ({ ...prev, envelopes: prev.envelopes.filter((x) => x.id !== id) })),
    [mutate],
  );

  const addGoal = useCallback(
    (g: Omit<SavingsGoal, "id">) =>
      mutate((prev) => ({
        ...prev,
        savingsGoals: [...prev.savingsGoals, { ...g, id: uid() }],
      })),
    [mutate],
  );
  const updateGoal = useCallback(
    (g: SavingsGoal) =>
      mutate((prev) => ({
        ...prev,
        savingsGoals: prev.savingsGoals.map((x) => (x.id === g.id ? g : x)),
      })),
    [mutate],
  );
  const deleteGoal = useCallback(
    (id: string) =>
      mutate((prev) => ({ ...prev, savingsGoals: prev.savingsGoals.filter((x) => x.id !== id) })),
    [mutate],
  );

  const incrementSimulatorUsage = useCallback(
    () =>
      mutate((prev) => {
        const week = isoWeekKey();
        const usage =
          prev.simulatorUsage.weekKey === week
            ? { weekKey: week, count: prev.simulatorUsage.count + 1 }
            : { weekKey: week, count: 1 };
        return { ...prev, simulatorUsage: usage };
      }),
    [mutate],
  );

  const resetAll = useCallback(async () => {
    const fresh = defaultAppData();
    setData(fresh);
    await persist(fresh);
  }, [persist]);

  const value = useMemo<AppDataContextValue>(
    () => ({
      data,
      loaded,
      updateSettings,
      setLanguage,
      setMockPremium,
      upsertWallet,
      updatePrimaryWalletBalance,
      addIncome,
      updateIncome,
      deleteIncome,
      addExpense,
      updateExpense,
      deleteExpense,
      addRecurringPayment,
      updateRecurringPayment,
      deleteRecurringPayment,
      addEnvelope,
      updateEnvelope,
      deleteEnvelope,
      addGoal,
      updateGoal,
      deleteGoal,
      incrementSimulatorUsage,
      resetAll,
    }),
    [
      data,
      loaded,
      updateSettings,
      setLanguage,
      setMockPremium,
      upsertWallet,
      updatePrimaryWalletBalance,
      addIncome,
      updateIncome,
      deleteIncome,
      addExpense,
      updateExpense,
      deleteExpense,
      addRecurringPayment,
      updateRecurringPayment,
      deleteRecurringPayment,
      addEnvelope,
      updateEnvelope,
      deleteEnvelope,
      addGoal,
      updateGoal,
      deleteGoal,
      incrementSimulatorUsage,
      resetAll,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}

export function useT() {
  const { data } = useAppData();
  const lang = data.settings.language;
  // Lazy import to avoid circular dependency
  const { translate } = require("@/src/i18n/translations") as typeof import("@/src/i18n/translations");
  return (key: string, params?: Record<string, string | number>) =>
    translate(lang, key, params);
}
