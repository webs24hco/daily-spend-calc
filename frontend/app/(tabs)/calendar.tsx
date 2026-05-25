// Calendar tab — monthly view with paydays, bills, and risky-day markers.

import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PaywallModal } from "@/src/components/PaywallModal";
import { colors, radii, spacing } from "@/src/constants";
import { useAppData, useT } from "@/src/store/AppDataContext";
import {
  calculateSafeDailySpend,
  calculateUpcomingPayments,
} from "@/src/utils/calculations";
import { addDays, daysBetween, isSameDay, toISODate, todayISO } from "@/src/utils/dates";
import { formatMoney } from "@/src/utils/format";
import { PaywallReason, canViewProjection } from "@/src/utils/plan-limits";

function buildMonthGrid(year: number, month: number): (string | null)[] {
  const first = new Date(year, month, 1);
  const offset = first.getDay(); // 0 = Sunday
  const lastDay = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= lastDay; d++) {
    cells.push(toISODate(new Date(year, month, d)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function CalendarTab() {
  const t = useT();
  const { data } = useAppData();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<string>(todayISO());
  const [paywall, setPaywall] = useState<PaywallReason | null>(null);

  const cells = buildMonthGrid(viewYear, viewMonth);

  const paydayISO = data.settings.nextPayday;
  const upcomingBills = calculateUpcomingPayments(data.recurringPayments, paydayISO);
  const safeDaily = calculateSafeDailySpend(data);

  const navigateMonth = (direction: number) => {
    let newMonth = viewMonth + direction;
    let newYear = viewYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    setViewMonth(newMonth);
    setViewYear(newYear);
  };

  const monthName = new Date(viewYear, viewMonth, 1).toLocaleDateString(
    data.settings.language === "es" ? "es-ES" : "en-US",
    { month: "long", year: "numeric" },
  );

  const weekdays =
    data.settings.language === "es"
      ? ["D", "L", "M", "X", "J", "V", "S"]
      : ["S", "M", "T", "W", "T", "F", "S"];

  const projectionCheck = canViewProjection(data);
  const showProjection = projectionCheck.ok;

  // Selected day insights
  const selectedDate = new Date(selected);
  const selectedBills = data.recurringPayments.filter((p) => isSameDay(p.nextDate, selected));
  const isPayday = isSameDay(selected, paydayISO);
  const daysUntilSelectedPayday = daysBetween(todayISO(), selected);

  return (
    <SafeAreaView style={styles.container} edges={["top"]} testID="calendar-screen">
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>{t("calendar.title")}</Text>
        </View>

        <View style={styles.monthHeader}>
          <Pressable
            testID="calendar-prev-month"
            onPress={() => navigateMonth(-1)}
            hitSlop={8}
            style={styles.navBtn}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
          </Pressable>
          <Text style={styles.monthName}>{monthName}</Text>
          <Pressable
            testID="calendar-next-month"
            onPress={() => navigateMonth(1)}
            hitSlop={8}
            style={styles.navBtn}
          >
            <Ionicons name="chevron-forward" size={20} color={colors.text.primary} />
          </Pressable>
        </View>

        <View style={styles.weekRow}>
          {weekdays.map((d, i) => (
            <Text key={i} style={styles.weekday}>
              {d}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {cells.map((iso, idx) => {
            if (!iso) return <View key={idx} style={styles.dayEmpty} />;
            const isToday = isSameDay(iso, todayISO());
            const isPaydayCell = isSameDay(iso, paydayISO);
            const hasBill = upcomingBills.some((b) => isSameDay(b.nextDate, iso));
            const isSelected = isSameDay(iso, selected);
            const dayNum = new Date(iso).getDate();
            return (
              <Pressable
                key={iso}
                testID={`calendar-day-${iso}`}
                onPress={() => setSelected(iso)}
                style={[
                  styles.dayCell,
                  isSelected && styles.dayCellSelected,
                  isToday && !isSelected && styles.dayCellToday,
                ]}
              >
                <Text
                  style={[
                    styles.dayNum,
                    isSelected && styles.dayNumSelected,
                  ]}
                >
                  {dayNum}
                </Text>
                <View style={styles.dotsRow}>
                  {isPaydayCell ? <View style={[styles.dot, { backgroundColor: colors.status.safeGreen }]} /> : null}
                  {hasBill ? <View style={[styles.dot, { backgroundColor: colors.status.riskCoral }]} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Selected day details */}
        <View style={styles.selectedCard} testID="calendar-selected-info">
          <Text style={styles.selectedDate}>
            {selectedDate.toLocaleDateString(
              data.settings.language === "es" ? "es-ES" : "en-US",
              { weekday: "long", day: "numeric", month: "long" },
            )}
          </Text>
          {isPayday ? (
            <View style={styles.tagPayday}>
              <Ionicons name="cash-outline" size={16} color={colors.status.safeGreen} />
              <Text style={[styles.tagText, { color: colors.status.safeGreen }]}>
                {t("calendar.payday")}
              </Text>
            </View>
          ) : null}
          {selectedBills.length > 0 ? (
            <View style={{ gap: spacing.sm }}>
              <Text style={styles.selectedSubtitle}>{t("calendar.bill")}</Text>
              {selectedBills.map((b) => (
                <View key={b.id} style={styles.billPill}>
                  <Text style={styles.billPillName}>{b.name}</Text>
                  <Text style={styles.billPillAmount}>
                    -{formatMoney(b.amount, data.settings.mainCurrency)}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
          {daysUntilSelectedPayday >= 0 && daysUntilSelectedPayday <= 30 ? (
            <View style={styles.selectedStat}>
              <Text style={styles.selectedStatLabel}>{t("calendar.safeSpend")}</Text>
              <Text style={styles.selectedStatValue}>
                {formatMoney(safeDaily, data.settings.mainCurrency)}
              </Text>
            </View>
          ) : null}
        </View>

        {/* 30-day projection (Plus) */}
        <View style={styles.projectionCard}>
          <View style={styles.projectionHeader}>
            <Ionicons name="trending-up" size={20} color={colors.brand.softBlue} />
            <Text style={styles.projectionTitle}>{t("calendar.advanced.locked")}</Text>
          </View>
          {showProjection ? (
            <Text style={styles.projectionText}>
              {t("home.safeSpend.label")}: {formatMoney(safeDaily, data.settings.mainCurrency)}
            </Text>
          ) : (
            <Pressable
              testID="calendar-unlock-projection"
              onPress={() => setPaywall("projection")}
              style={styles.lockBtn}
            >
              <Ionicons name="lock-closed" size={16} color={colors.text.secondary} />
              <Text style={styles.lockText}>{t("paywall.cta.upgrade")}</Text>
            </Pressable>
          )}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: colors.status.safeGreen }]} />
            <Text style={styles.legendText}>{t("calendar.payday")}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: colors.status.riskCoral }]} />
            <Text style={styles.legendText}>{t("calendar.bill")}</Text>
          </View>
        </View>
      </ScrollView>
      <PaywallModal visible={!!paywall} reason={paywall} onClose={() => setPaywall(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.main },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  header: { paddingBottom: spacing.sm },
  title: {
    fontSize: 26,
    color: colors.text.primary,
    fontFamily: "Outfit_700Bold",
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.card,
  },
  monthName: {
    fontSize: 18,
    color: colors.text.primary,
    fontFamily: "Outfit_700Bold",
    fontWeight: "700",
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weekday: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    color: colors.text.tertiary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
    paddingVertical: spacing.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    padding: 2,
  },
  dayEmpty: { width: `${100 / 7}%`, aspectRatio: 1 },
  dayCellSelected: {
    backgroundColor: colors.brand.primary,
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: colors.brand.softBlue,
  },
  dayNum: {
    fontSize: 14,
    color: colors.text.primary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
  },
  dayNumSelected: { color: colors.text.inverse },
  dotsRow: { flexDirection: "row", gap: 3, marginTop: 2, height: 6 },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
  selectedCard: {
    padding: spacing.lg,
    backgroundColor: colors.background.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  selectedDate: {
    fontSize: 16,
    color: colors.text.primary,
    fontFamily: "Outfit_700Bold",
    fontWeight: "700",
  },
  selectedSubtitle: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tagPayday: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.status.safeGreenBg,
    alignSelf: "flex-start",
  },
  tagText: {
    fontSize: 12,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
  },
  billPill: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.main,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  billPillName: {
    fontSize: 14,
    color: colors.text.primary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
  },
  billPillAmount: {
    fontSize: 14,
    color: colors.status.riskCoral,
    fontFamily: "DMSans_700Bold",
    fontWeight: "700",
  },
  selectedStat: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.sm,
  },
  selectedStatLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    fontFamily: "DMSans_400Regular",
  },
  selectedStatValue: {
    fontSize: 18,
    color: colors.brand.softBlue,
    fontFamily: "Outfit_700Bold",
    fontWeight: "700",
  },
  projectionCard: {
    padding: spacing.lg,
    backgroundColor: colors.brand.softBlueLight,
    borderRadius: radii.lg,
    gap: spacing.sm,
  },
  projectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  projectionTitle: {
    fontSize: 14,
    color: colors.text.primary,
    fontFamily: "Outfit_700Bold",
    fontWeight: "700",
    flex: 1,
  },
  projectionText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontFamily: "DMSans_400Regular",
  },
  lockBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.main,
    borderRadius: radii.pill,
    alignSelf: "flex-start",
  },
  lockText: {
    fontSize: 13,
    color: colors.text.primary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
  },
  legend: {
    flexDirection: "row",
    gap: spacing.lg,
    justifyContent: "center",
    paddingTop: spacing.sm,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  legendText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontFamily: "DMSans_400Regular",
  },
});
