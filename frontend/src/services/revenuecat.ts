// =============================================================================
// RevenueCat Service — PLACEHOLDER for MVP
// =============================================================================
// In the MVP, premium state is managed locally via PremiumState.mockActive.
// When integrating RevenueCat:
//   1. Install: yarn add react-native-purchases
//   2. Configure SDK in app entry with API key from RevenueCat dashboard.
//   3. Replace `fetchOfferings`, `purchasePackage`, and `restorePurchases`
//      below with actual SDK calls.
//   4. Replace `setMockPlan` consumers with `purchasePackage` results.
//   5. Sync `customerInfo.entitlements.active` into the local PremiumState so
//      the existing plan-limit logic continues to work unchanged.

import { PremiumPlan } from "@/src/types";

export interface Offering {
  identifier: PremiumPlan;
  priceMonthly: number;
  title: string;
}

export const MOCK_OFFERINGS: Offering[] = [
  { identifier: "pro", priceMonthly: 2.99, title: "Queda Pro" },
  { identifier: "plus", priceMonthly: 4.99, title: "Queda Plus" },
];

// Replace with: const offerings = await Purchases.getOfferings();
export async function fetchOfferings(): Promise<Offering[]> {
  return MOCK_OFFERINGS;
}

// Replace with: await Purchases.purchasePackage(pkg);
export async function purchasePackage(plan: PremiumPlan): Promise<{ success: boolean }> {
  return { success: true };
}

// Replace with: const customerInfo = await Purchases.restorePurchases();
export async function restorePurchases(): Promise<{ success: boolean; plan: PremiumPlan }> {
  return { success: true, plan: "free" };
}
