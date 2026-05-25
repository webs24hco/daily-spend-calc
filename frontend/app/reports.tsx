// Reports screen — weekly summary + locked Pro/Plus features.

import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CategoryIcon } from "@/src/components/CategoryIcon";
import { PaywallModal } from "@/src/components/PaywallModal";
import { ProgressBar } from "@/src/components/ProgressBar";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { EXPENSE_CATEGORIES, colors, radii, spacing } from "@/src/constants";
import { useAppData, useT } from "@/src/store/AppDataContext";
import { ExpenseCategory } from "@/src/types";
import { getCycleSpending, getSpendingByCategory } from "@/src/utils/calculations";
import { addDays, todayISO } from "@/src/utils/dates";
import { formatMoney } from "@/src/utils/format";
import { PaywallReason, canViewMonthlyReport } from "@/src/utils/plan-limits";

export default function ReportsScreen() {
  const t = useT();
  const { data } = useAppData();
  const [paywall, setPaywall] = useState<PaywallReason | null>(null);

  const weekStart = addDays(todayISO(), -6);
  const today = todayISO();
  const weekCategory = getSpendingByCategory(data.expenses, weekStart, today);
  const weekTotal = Object.values(weekCategory).reduce((s, v) => s + v, 0);
  const cycleTotal = getCycleSpending(data);

  // best/worst day calculation (over the past week)
  const byDay = data.expenses
    .filter((e) => e.date >= weekStart && e.date <= today)
    .reduce<Record<string, number>>((acc, e) => {
      acc[e.date] = (acc[e.date] || 0) + e.amount;
      return acc;
    }, {});
  const entries = Object.entries(byDay);
  const bestDay = entries.sort((a, b) => a[1] - b[1])[0];
  const worstDay = entries.sort((a, b) => b[1] - a[1])[0];

  const monthlyOk = canViewMonthlyReport(data).ok;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]} testID="reports-screen">
      <ScreenHeader title={t("reports.title")} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Weekly summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("reports.weekly")}</Text>
          <Text style={styles.bigNumber}>
            {formatMoney(weekTotal, data.settings.mainCurrency)}
          </Text>
          <Text style={styles.cardSubtitle}>{t("expenses.totalCycle")}</Text>
        </View>

        {/* By category */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("reports.byCategory")}</Text>
          {Object.keys(weekCategory).length === 0 ? (
            <Text style={styles.emptyText}>{t("expenses.empty")}</Text>
          ) : (
            (Object.keys(weekCategory) as ExpenseCategory[])
              .sort((a, b) => weekCategory[b] - weekCategory[a])
              .map((cat) => {
                const amount = weekCategory[cat];
                const pct = weekTotal > 0 ? amount / weekTotal : 0;
                return (
                  <View key={cat} style={styles.catRow}>
                    <CategoryIcon category={cat} size={36} />
                    <View style={{ flex: 1, gap: spacing.xs }}>
                      <View style={styles.catRowHeader}>
                        <Text style={styles.catRowName}>{t(`category.${cat}`)}</Text>
                        <Text style={styles.catRowAmount}>
                          {formatMoney(amount, data.settings.mainCurrency)}
                        </Text>
                      </View>
                      <ProgressBar
                        value={pct}
                        color={EXPENSE_CATEGORIES[cat].color}
                        height={6}
                      />
                    </View>
                  </View>
                );
              })
          )}
        </View>

        {/* Best / worst day */}
        <View style={styles.rowCards}>
          <View style={[styles.smallCard, { backgroundColor: colors.status.safeGreenBg }]}>
            <Text style={styles.smallCardLabel}>{t("reports.bestDay")}</Text>
            <Text style={[styles.smallCardValue, { color: colors.status.safeGreen }]}>
              {bestDay
                ? formatMoney(bestDay[1], data.settings.mainCurrency)
                : "—"}
            </Text>
          </View>
          <View style={[styles.smallCard, { backgroundColor: colors.status.riskCoralBg }]}>
            <Text style={styles.smallCardLabel}>{t("reports.worstDay")}</Text>
            <Text style={[styles.smallCardValue, { color: colors.status.riskCoral }]}>
              {worstDay
                ? formatMoney(worstDay[1], data.settings.mainCurrency)
                : "—"}
            </Text>
          </View>
        </View>

        {/* Cycle summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("reports.cycleSummary")}</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>{t("expenses.totalCycle")}</Text>
            <Text style={styles.statValue}>
              {formatMoney(cycleTotal, data.settings.mainCurrency)}
            </Text>
          </View>
        </View>

        {/* Monthly Pro feature */}
        <Pressable
          testID="reports-monthly-card"
          onPress={() => {
            if (!monthlyOk) setPaywall("monthly");
          }}
          style={styles.lockedCard}
        >
          <View style={styles.lockedHeader}>
            <Ionicons
              name={monthlyOk ? "stats-chart" : "lock-closed"}
              size={20}
              color={monthlyOk ? colors.status.safeGreen : colors.text.tertiary}
            />
            <Text style={styles.lockedTitle}>{t("reports.monthlyLocked")}</Text>
          </View>
        </Pressable>

        {/* Plus advanced */}
        <Pressable
          testID="reports-advanced-card"
          onPress={() => setPaywall("projection")}
          style={styles.lockedCard}
        >
          <View style={styles.lockedHeader}>
            <Ionicons name="lock-closed" size={20} color={colors.text.tertiary} />
            <Text style={styles.lockedTitle}>{t("reports.advancedLocked")}</Text>
          </View>
        </Pressable>
      </ScrollView>
      <PaywallModal visible={!!paywall} reason={paywall} onClose={() => setPaywall(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.main },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  card: {
    padding: spacing.lg,
    backgroundColor: colors.background.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  cardTitle: {
    fontSize: 14,
    color: colors.text.secondary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.text.tertiary,
    fontFamily: "DMSans_400Regular",
  },
  bigNumber: {
    fontSize: 32,
    color: colors.text.primary,
    fontFamily: "Outfit_700Bold",
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontFamily: "DMSans_400Regular",
    textAlign: "center",
  },
  catRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  catRowHeader: { flexDirection: "row", justifyContent: "space-between" },
  catRowName: {
    fontSize: 14,
    color: colors.text.primary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
  },
  catRowAmount: {
    fontSize: 14,
    color: colors.text.primary,
    fontFamily: "DMSans_700Bold",
    fontWeight: "700",
  },
  rowCards: { flexDirection: "row", gap: spacing.md },
  smallCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radii.md,
    gap: spacing.xs,
  },
  smallCardLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  smallCardValue: {
    fontSize: 22,
    fontFamily: "Outfit_700Bold",
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  statRow: { flexDirection: "row", justifyContent: "space-between" },
  statLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    fontFamily: "DMSans_400Regular",
  },
  statValue: {
    fontSize: 16,
    color: colors.text.primary,
    fontFamily: "Outfit_700Bold",
    fontWeight: "700",
  },
  lockedCard: {
    padding: spacing.lg,
    backgroundColor: colors.background.envelopeSurface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lockedHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  lockedTitle: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
  },
});
