import { Currency, ExpenseCategory, PremiumPlan } from "@/src/types";

// Brand colors from design guidelines
export const colors = {
  background: {
    main: "#FFFFFF",
    card: "#F8FAFC",
    envelopeSurface: "#F1F5F9",
  },
  text: {
    primary: "#0B192C",
    secondary: "#64748B",
    tertiary: "#94A3B8",
    inverse: "#FFFFFF",
  },
  brand: {
    primary: "#0B192C",
    softBlue: "#3B82F6",
    softBlueLight: "#EFF6FF",
  },
  status: {
    safeGreen: "#10B981",
    safeGreenBg: "#ECFDF5",
    carefulAmber: "#F59E0B",
    carefulAmberBg: "#FFFBEB",
    riskCoral: "#EF4444",
    riskCoralBg: "#FEF2F2",
  },
  warm: {
    orange: "#F97316",
    peach: "#FFEDD5",
  },
  border: "#E2E8F0",
  divider: "#F1F5F9",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 9999,
} as const;

export const shadows = {
  soft: {
    shadowColor: "#0B192C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  floating: {
    shadowColor: "#0B192C",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
} as const;

// Currency configuration
export const CURRENCIES: { code: Currency; symbol: string; name: string }[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "MXN", symbol: "$", name: "Peso Mexicano" },
  { code: "COP", symbol: "$", name: "Peso Colombiano" },
  { code: "ARS", symbol: "$", name: "Peso Argentino" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "VES", symbol: "Bs.", name: "Bolívar Venezolano" },
  { code: "PEN", symbol: "S/", name: "Sol Peruano" },
  { code: "CLP", symbol: "$", name: "Peso Chileno" },
  { code: "BRL", symbol: "R$", name: "Real Brasileño" },
];

// Expense categories with icons and colors
export const EXPENSE_CATEGORIES: Record<
  ExpenseCategory,
  { iconName: string; color: string; bg: string }
> = {
  food: { iconName: "restaurant", color: "#F97316", bg: "#FFEDD5" },
  transport: { iconName: "car", color: "#3B82F6", bg: "#EFF6FF" },
  home: { iconName: "home", color: "#10B981", bg: "#ECFDF5" },
  subscriptions: { iconName: "repeat", color: "#8B5CF6", bg: "#F3E8FF" },
  fun: { iconName: "musical-notes", color: "#EC4899", bg: "#FCE7F3" },
  health: { iconName: "medkit", color: "#EF4444", bg: "#FEF2F2" },
  shopping: { iconName: "bag-handle", color: "#F59E0B", bg: "#FFFBEB" },
  debt: { iconName: "card", color: "#64748B", bg: "#F1F5F9" },
  other: { iconName: "ellipsis-horizontal", color: "#94A3B8", bg: "#F8FAFC" },
};

// Envelope palette
export const ENVELOPE_COLORS = [
  "#ECFDF5", // soft green
  "#EFF6FF", // soft blue
  "#FFEDD5", // peach
  "#FCE7F3", // soft pink
  "#F3E8FF", // soft purple
  "#FEF2F2", // soft coral
  "#FFFBEB", // soft amber
  "#F1F5F9", // soft slate
];

// Plan limits
export interface PlanLimits {
  wallets: number;
  recurringIncomes: number;
  recurringPayments: number;
  expensesPerMonth: number;
  envelopes: number;
  simulatorPerWeek: number;
  savingsGoals: number;
  multiCurrency: boolean;
  monthlyReport: boolean;
  thirtyDayProjection: boolean;
  exportPdfCsv: boolean;
  customCategories: boolean;
  coupleMode: boolean;
}

const UNLIMITED = Number.POSITIVE_INFINITY;

export const PLAN_LIMITS: Record<PremiumPlan, PlanLimits> = {
  free: {
    wallets: 1,
    recurringIncomes: 1,
    recurringPayments: 8,
    expensesPerMonth: 30,
    envelopes: 2,
    simulatorPerWeek: 3,
    savingsGoals: 0,
    multiCurrency: false,
    monthlyReport: false,
    thirtyDayProjection: false,
    exportPdfCsv: false,
    customCategories: false,
    coupleMode: false,
  },
  pro: {
    wallets: UNLIMITED,
    recurringIncomes: UNLIMITED,
    recurringPayments: UNLIMITED,
    expensesPerMonth: UNLIMITED,
    envelopes: 5,
    simulatorPerWeek: UNLIMITED,
    savingsGoals: 2,
    multiCurrency: false,
    monthlyReport: true,
    thirtyDayProjection: false,
    exportPdfCsv: false,
    customCategories: true,
    coupleMode: false,
  },
  plus: {
    wallets: UNLIMITED,
    recurringIncomes: UNLIMITED,
    recurringPayments: UNLIMITED,
    expensesPerMonth: UNLIMITED,
    envelopes: UNLIMITED,
    simulatorPerWeek: UNLIMITED,
    savingsGoals: UNLIMITED,
    multiCurrency: true,
    monthlyReport: true,
    thirtyDayProjection: true,
    exportPdfCsv: true,
    customCategories: true,
    coupleMode: true,
  },
};

export const PLAN_PRICES: Record<PremiumPlan, number> = {
  free: 0,
  pro: 2.99,
  plus: 4.99,
};

export const STORAGE_KEYS = {
  APP_DATA: "queda:app_data:v1",
} as const;
