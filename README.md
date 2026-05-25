# Queda · SafeSpend

> _"Descubre cuánto puedes gastar hoy sin quedarte corto antes del próximo pago."_

Queda is a calm, manual-first, offline-first personal-finance app for people who live paycheck to paycheck. It answers one question:

**How much can I safely spend today?**

Built with Expo + React Native + TypeScript. No backend. No bank sync. No tracking.

---

## Running

```bash
cd frontend
yarn install
yarn start
```

Then scan the QR with Expo Go (Android/iOS) or open the preview URL on the web.

The app:
- Stores everything locally via AsyncStorage (`@/src/utils/storage`).
- Works fully offline.
- Defaults to **Spanish**. Switch to English in `Settings → Idioma`.
- Persists state between launches.

---

## How safe daily spend is calculated

```
available_until_payday  =
    current_balance
    + expected_incomes_before_payday  (one-time only — recurring payday income starts a new cycle)
    - upcoming_fixed_payments
    - envelopes_reserved
    - savings_goals_reserved

safe_daily_spend = available_until_payday / max(days_until_payday, 1)
```

If `available <= 0` the app shows **Riesgo** ("you may run short"); if the daily figure is < 60% of expected daily income the app shows **Cuidado**; otherwise **Vas bien**.

All computation lives in `src/utils/calculations.ts`. Key functions:

- `calculateDaysUntilPayday`
- `calculateUpcomingPayments`
- `calculateAvailableUntilPayday`
- `calculateSafeDailySpend`
- `calculatePurchaseImpact`
- `getFinancialStatus`
- `calculateCycleProgress`
- `getMonthlyExpenseCount`
- `getWeeklySimulatorUsage`

---

## Plan limits

| Feature                       | Free | Pro (`$2.99`) | Plus (`$4.99`) |
| ----------------------------- | :--: | :-----------: | :------------: |
| Daily safe-spend number       |  ✅  |      ✅       |       ✅       |
| Wallets                       |  1   |       ∞       |       ∞        |
| Recurring incomes             |  1   |       ∞       |       ∞        |
| Recurring payments / bills    |  8   |       ∞       |       ∞        |
| Expenses per month            |  30  |       ∞       |       ∞        |
| Envelopes                     |  2   |       5       |       ∞        |
| Savings goals                 |  0   |       2       |       ∞        |
| "Can I Buy This?" per week    |  3   |       ∞       |       ∞        |
| Monthly detailed report       |  —   |      ✅       |       ✅       |
| 30-day projection             |  —   |       —       |       ✅       |
| Multi-currency                |  —   |       —       |       ✅       |
| PDF / CSV export              |  —   |       —       |       ✅       |
| Couple / family mode          |  —   |       —       |       ✅       |

Single source of truth: `src/constants/index.ts` → `PLAN_LIMITS`.
Enforcement helpers: `src/utils/plan-limits.ts` (`canAddExpense`, `canAddBill`, `canUseSimulator`, etc.).

---

## How to test mock premium plans

There are two ways:

1. **From the Premium tab** → tap *Activar Pro* / *Activar Plus* / *Volver a Gratis*.
2. **From Settings → Estado Premium (mock)** → tap any of the `Gratis / Pro / Plus` pills.

Both routes write to `data.premium`:

```ts
data.premium = { plan: "pro", mockActive: true }
```

The boolean `mockActive` toggles whether limits apply. Free behaviour is restored when `plan === "free"` (or `mockActive === false`).

Free-plan paywall examples to test:

| Action                                              | Expected behaviour            |
| --------------------------------------------------- | ----------------------------- |
| Add a 9th recurring bill                            | Paywall: bills                |
| Add a 31st expense in the same calendar month       | Paywall: expenses             |
| Add a 3rd envelope                                  | Paywall: envelopes            |
| Add a 4th "Can I Buy This?" within the same ISO week | Paywall: simulator           |
| Open Reports → tap monthly card                     | Paywall: monthly              |
| Open Calendar → tap "Proyección 30 días"            | Paywall: projection           |

After upgrading to Pro/Plus from the paywall the same action succeeds.

---

## RevenueCat integration (placeholder)

`src/services/revenuecat.ts` holds a fully-typed placeholder service with comments explaining where to:

- fetch offerings
- start a purchase
- restore purchases
- sync the active entitlement back into `PremiumState`

To go live:

1. `yarn add react-native-purchases`
2. Configure the SDK with your iOS/Android API key in `app/_layout.tsx`.
3. Replace the placeholder bodies in `services/revenuecat.ts` with real `Purchases.*` calls.
4. Map the active entitlement to `setMockPremium(plan, true)` so the existing plan-limit logic continues to work unchanged.

---

## Roadmap (next micro-deliveries)

1. **RevenueCat live** — replace placeholder with the real SDK + product IDs.
2. **Cloud sync** — opt-in encrypted backup (Supabase / iCloud / Drive).
3. **Local push reminders** — bill due in 2 days, payday tomorrow.
4. **Widgets** — iOS / Android home-screen widgets showing today's safe spend.
5. **CSV / PDF export** — share monthly reports.
6. **Couple / family mode** — shared cycle between two accounts.
7. **AI category suggestions** — local heuristics first, no cloud.

---

## Folder structure

```
app/
  _layout.tsx           # root stack + font + state provider
  index.tsx             # router decision (onboarding / setup / tabs)
  onboarding.tsx        # 3-screen onboarding
  setup.tsx             # step-by-step setup wizard
  (tabs)/
    _layout.tsx         # bottom tab navigator
    index.tsx           # 🏠 Home (the hero of the app)
    expenses.tsx        # Gastos
    calendar.tsx        # Calendario
    envelopes.tsx       # Sobres
    premium.tsx         # Premium paywall
  add-expense.tsx       # ➕ modal
  add-income.tsx        # ➕ modal
  add-bill.tsx          # ➕ modal
  add-envelope.tsx      # ➕ modal
  add-goal.tsx          # ➕ modal
  can-i-buy.tsx         # 🤔 simulator
  income.tsx            # Income list
  bills.tsx             # Bills list
  goals.tsx             # Savings goals list
  reports.tsx           # Reports + locked Pro/Plus blocks
  settings.tsx          # Settings + mock premium toggles

src/
  components/           # Button, Card, Input, StatusPill, PaywallModal, ...
  constants/            # colors, spacing, CURRENCIES, PLAN_LIMITS
  hooks/                # use-icon-fonts (pre-shipped)
  i18n/                 # translations.ts (es + en)
  services/             # revenuecat.ts (placeholder)
  store/                # AppDataContext.tsx (single source of truth)
  types/                # AppData, Wallet, Income, Expense, ...
  utils/
    calculations.ts     # the heart: safe-spend math
    dates.ts            # ISO date helpers
    format.ts           # money formatting
    plan-limits.ts      # enforcement
    storage/            # pre-shipped AsyncStorage wrapper
```
