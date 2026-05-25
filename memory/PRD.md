# Queda · SafeSpend — Product Requirements Document

## Vision

A calm, manual-first, offline-first mobile app that answers ONE question for paycheck-to-paycheck users:

> **"How much can I safely spend today?"**

## Target users

- LATAM + USA, Spanish primary
- Young workers, freelancers, students, couples
- Weekly / biweekly / monthly / irregular income
- People who avoid complicated budgeting apps

## Tech stack

- Expo SDK 54 + React Native 0.81 + TypeScript
- Expo Router (file-based)
- AsyncStorage (`@/src/utils/storage`)
- @expo/vector-icons (Ionicons)
- @expo-google-fonts/outfit + @expo-google-fonts/dm-sans
- No backend, no auth, no AI, no bank sync.

## Core math (in `src/utils/calculations.ts`)

```
available = balance + extra_incomes - upcoming_bills - envelopes - goals_reserved
safe_daily = available / max(days_until_payday, 1)
```

Status thresholds:
- `risk` when available < 0
- `careful` when daily < 50% of expected_per_day
- `safe` when daily >= 80% of expected_per_day

## Plans

| Plan | Price | Used to enforce limits in `src/utils/plan-limits.ts` |
|------|------:|------------------------------------------------------|
| Free | $0    | 1 wallet · 1 recurring income · 8 bills · 30 expenses/mo · 2 envelopes · 0 goals · 3 simulator/wk |
| Pro  | $2.99 | unlimited core · 5 envelopes · 2 goals · monthly report · no ads |
| Plus | $4.99 | unlimited envelopes/goals · multi-currency · 30-day projection · export · couple mode |

## 13 screens (file paths)

1. `app/onboarding.tsx` — 3 paged slides
2. `app/setup.tsx` — 8-step wizard (balance → currency → payday → income → frequency → bills → goal → done)
3. `app/(tabs)/index.tsx` — Home (the hero)
4. `app/can-i-buy.tsx` — Simulator modal
5. `app/(tabs)/expenses.tsx` — Expenses list + filters
6. `app/income.tsx` — Income list
7. `app/bills.tsx` — Bills list
8. `app/(tabs)/calendar.tsx` — Monthly calendar
9. `app/(tabs)/envelopes.tsx` — Bento envelopes
10. `app/goals.tsx` — Savings goals
11. `app/reports.tsx` — Weekly + locked monthly/advanced
12. `app/(tabs)/premium.tsx` — Paywall comparison
13. `app/settings.tsx` — Language, currency, mock premium, reset

## RevenueCat

Placeholder at `src/services/revenuecat.ts`. Migration path documented in `README.md`.

## i18n

`src/i18n/translations.ts` — Spanish + English. Default: Spanish.
