// Home screen — the heart of Queda.
// Answers ONE question: "How much can I safely spend today?"

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CategoryIcon } from "@/src/components/CategoryIcon";
import { ProgressBar } from "@/src/components/ProgressBar";
import { StatusPill } from "@/src/components/StatusPill";
import { colors, radii, spacing } from "@/src/constants";
import { useAppData, useT } from "@/src/store/AppDataContext";
import {
  calculateAvailableUntilPayday,
  calculateCycleProgress,
  calculateDaysUntilPayday,
  calculateSafeDailySpend,
  calculateUpcomingPayments,
  getCycleSpending,
  getFinancialStatus,
} from "@/src/utils/calculations";
import { formatDateShort } from "@/src/utils/dates";
import { formatMoney } from "@/src/utils/format";

export default function Home() {
  const t = useT();
  const router = useRouter();
  const { data } = useAppData();
  const { settings, recurringPayments } = data;

  const safeDaily = calculateSafeDailySpend(data);
  const available = calculateAvailableUntilPayday(data);
  const daysLeft = calculateDaysUntilPayday(settings.nextPayday);
  const status = getFinancialStatus(data);
  const cycleProgress = calculateCycleProgress(data);
  const upcoming = calculateUpcomingPayments(recurringPayments, settings.nextPayday);
  const spentCycle = getCycleSpending(data);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return t("home.greeting.morning");
    if (h < 19) return t("home.greeting.afternoon");
    return t("home.greeting.evening");
  })();

  const statusBgColor =
    status === "safe"
      ? colors.status.safeGreenBg
      : status === "careful"
        ? colors.status.carefulAmberBg
        : colors.status.riskCoralBg;

  const heroNumberColor =
    status === "risk" ? colors.status.riskCoral : colors.text.primary;

  const friendly =
    daysLeft === 0
      ? t("home.cyclePaid")
      : `${t("home.moneyLeft")} ${formatMoney(Math.max(available, 0), settings.mainCurrency)} ${t("home.daysLeft")} (${daysLeft})`;

  return (
    <SafeAreaView style={styles.container} edges={["top"]} testID="home-screen">
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Greeting row */}
        <View style={styles.greetingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.dateStr}>
              {new Date().toLocaleDateString(settings.language === "es" ? "es-ES" : "en-US", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </Text>
          </View>
          <Pressable
            testID="home-settings-btn"
            onPress={() => router.push("/settings")}
            hitSlop={10}
            style={styles.iconBtn}
          >
            <Ionicons name="settings-outline" size={22} color={colors.text.primary} />
          </Pressable>
        </View>

        {/* Hero card — Safe to spend today */}
        <View
          testID="home-safe-spend-card"
          style={[styles.heroCard, { backgroundColor: statusBgColor }]}
        >
          <Text style={styles.heroLabel}>{t("home.safeSpend.label")}</Text>
          <Text
            testID="home-safe-spend-number"
            style={[styles.heroNumber, { color: heroNumberColor }]}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            {formatMoney(safeDaily, settings.mainCurrency)}
          </Text>
          <StatusPill
            testID="home-status-pill"
            status={status}
            label={t(`status.${status}`)}
          />
          <Text style={styles.heroFriendly}>{friendly}</Text>
          <Text style={styles.heroMessage}>{t(`status.${status}.message`)}</Text>
        </View>

        {/* Cycle progress */}
        <View style={styles.cycleCard}>
          <View style={styles.cycleHeader}>
            <Text style={styles.cycleTitle}>{t("home.cycleProgress")}</Text>
            <Text style={styles.cycleDays}>
              {daysLeft} {t("home.daysLeft")}
            </Text>
          </View>
          <ProgressBar
            testID="home-cycle-progress"
            value={cycleProgress}
            color={colors.brand.softBlue}
            height={10}
          />
          <View style={styles.cycleStats}>
            <View>
              <Text style={styles.cycleStatLabel}>{t("expenses.totalCycle")}</Text>
              <Text style={styles.cycleStatValue}>
                {formatMoney(spentCycle, settings.mainCurrency)}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.cycleStatLabel}>{t("home.moneyLeft")}</Text>
              <Text style={styles.cycleStatValue}>
                {formatMoney(Math.max(available, 0), settings.mainCurrency)}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <QuickAction
            testID="home-quick-expense"
            icon="remove-circle-outline"
            label={t("home.quickActions.expense")}
            color={colors.status.riskCoral}
            onPress={() => router.push("/add-expense")}
          />
          <QuickAction
            testID="home-quick-income"
            icon="add-circle-outline"
            label={t("home.quickActions.income")}
            color={colors.status.safeGreen}
            onPress={() => router.push("/add-income")}
          />
          <QuickAction
            testID="home-quick-can-i-buy"
            icon="help-circle-outline"
            label={t("home.quickActions.canIBuy")}
            color={colors.brand.softBlue}
            onPress={() => router.push("/can-i-buy")}
          />
          <QuickAction
            testID="home-quick-bill"
            icon="document-text-outline"
            label={t("home.quickActions.bill")}
            color={colors.warm.orange}
            onPress={() => router.push("/add-bill")}
          />
        </View>

        {/* Upcoming payments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("home.upcomingPayments")}</Text>
            <Pressable testID="home-view-bills" onPress={() => router.push("/bills")} hitSlop={8}>
              <Text style={styles.sectionAction}>›</Text>
            </Pressable>
          </View>
          {upcoming.length === 0 ? (
            <View style={styles.emptyMini}>
              <Text style={styles.emptyMiniText}>{t("home.noPayments")}</Text>
            </View>
          ) : (
            upcoming.slice(0, 4).map((p) => (
              <View key={p.id} style={styles.paymentRow}>
                <CategoryIcon category={p.category} size={40} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.paymentName} numberOfLines={1}>
                    {p.name}
                  </Text>
                  <Text style={styles.paymentDate}>
                    {formatDateShort(p.nextDate, settings.language)}
                  </Text>
                </View>
                <Text style={styles.paymentAmount}>
                  -{formatMoney(p.amount, settings.mainCurrency)}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Reports + Goals shortcuts */}
        <View style={styles.shortcutRow}>
          <Pressable
            testID="home-reports-btn"
            onPress={() => router.push("/reports")}
            style={[styles.shortcut, { backgroundColor: colors.brand.softBlueLight }]}
          >
            <Ionicons name="bar-chart-outline" size={22} color={colors.brand.softBlue} />
            <Text style={styles.shortcutLabel}>{t("reports.title")}</Text>
          </Pressable>
          <Pressable
            testID="home-goals-btn"
            onPress={() => router.push("/goals")}
            style={[styles.shortcut, { backgroundColor: colors.status.safeGreenBg }]}
          >
            <Ionicons name="flag-outline" size={22} color={colors.status.safeGreen} />
            <Text style={styles.shortcutLabel}>{t("goals.title")}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickAction({
  icon,
  label,
  color,
  onPress,
  testID,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <Pressable testID={testID} onPress={onPress} style={styles.quickActionBtn}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + "1A" }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.quickActionLabel} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.main },
  scroll: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  greetingRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  greeting: {
    fontSize: 14,
    color: colors.text.secondary,
    fontFamily: "DMSans_400Regular",
  },
  dateStr: {
    fontSize: 18,
    color: colors.text.primary,
    fontFamily: "Outfit_700Bold",
    fontWeight: "700",
    textTransform: "capitalize",
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: colors.background.card,
  },
  heroCard: {
    borderRadius: radii.lg,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
  },
  heroLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroNumber: {
    fontSize: 56,
    lineHeight: 64,
    fontWeight: "700",
    fontFamily: "Outfit_700Bold",
    letterSpacing: -1.5,
  },
  heroFriendly: {
    fontSize: 14,
    color: colors.text.primary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
    textAlign: "center",
    marginTop: spacing.sm,
  },
  heroMessage: {
    fontSize: 13,
    color: colors.text.secondary,
    fontFamily: "DMSans_400Regular",
    textAlign: "center",
  },
  cycleCard: {
    backgroundColor: colors.background.card,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cycleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cycleTitle: {
    fontSize: 15,
    color: colors.text.primary,
    fontFamily: "Outfit_700Bold",
    fontWeight: "700",
  },
  cycleDays: {
    fontSize: 13,
    color: colors.text.secondary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
  },
  cycleStats: { flexDirection: "row", justifyContent: "space-between" },
  cycleStatLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontFamily: "DMSans_400Regular",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cycleStatValue: {
    fontSize: 16,
    color: colors.text.primary,
    fontFamily: "Outfit_700Bold",
    fontWeight: "700",
    marginTop: 2,
  },
  quickActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  quickActionBtn: {
    flex: 1,
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.background.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: {
    fontSize: 11,
    color: colors.text.primary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
    textAlign: "center",
  },
  section: { gap: spacing.md },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    color: colors.text.primary,
    fontFamily: "Outfit_700Bold",
    fontWeight: "700",
  },
  sectionAction: {
    fontSize: 24,
    color: colors.text.secondary,
    fontFamily: "Outfit_700Bold",
  },
  emptyMini: {
    padding: spacing.lg,
    backgroundColor: colors.background.card,
    borderRadius: radii.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyMiniText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontFamily: "DMSans_400Regular",
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paymentName: {
    fontSize: 15,
    color: colors.text.primary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
  },
  paymentDate: {
    fontSize: 12,
    color: colors.text.secondary,
    fontFamily: "DMSans_400Regular",
    marginTop: 2,
  },
  paymentAmount: {
    fontSize: 15,
    color: colors.status.riskCoral,
    fontFamily: "DMSans_700Bold",
    fontWeight: "700",
  },
  shortcutRow: { flexDirection: "row", gap: spacing.md },
  shortcut: {
    flex: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  shortcutLabel: {
    fontSize: 14,
    color: colors.text.primary,
    fontFamily: "Outfit_700Bold",
    fontWeight: "700",
  },
});
