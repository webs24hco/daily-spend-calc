// Premium tab — beautiful paywall with Free vs Pro vs Plus comparison.

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/src/components/Button";
import { colors, radii, spacing } from "@/src/constants";
import { useAppData, useT } from "@/src/store/AppDataContext";
import { PremiumPlan } from "@/src/types";
import { purchasePackage } from "@/src/services/revenuecat";

const HERO_IMG =
  "https://static.prod-images.emergentagent.com/jobs/26770b53-a40a-4517-8bf7-8b9fad38fed9/images/fcdbb30b97599d2a1ecf54a21c83a500e5e1b02a58e4c5a67e076f4097fbe0f4.png";

export default function PremiumTab() {
  const t = useT();
  const { data, setMockPremium } = useAppData();
  const currentPlan: PremiumPlan = data.premium.mockActive ? data.premium.plan : "free";

  const activate = async (plan: PremiumPlan) => {
    // RevenueCat placeholder: in production this would call purchasePackage().
    await purchasePackage(plan);
    await setMockPremium(plan, plan !== "free");
  };

  const PLAN_FEATURES = [
    { key: "dailySafe", free: true, pro: true, plus: true },
    { key: "basicCalendar", free: true, pro: true, plus: true },
    { key: "expenses30", free: true, pro: false, plus: false },
    { key: "unlimitedExpenses", free: false, pro: true, plus: true },
    { key: "unlimitedBills", free: false, pro: true, plus: true },
    { key: "unlimitedIncomes", free: false, pro: true, plus: true },
    { key: "multiWallets", free: false, pro: true, plus: true },
    { key: "unlimitedSimulator", free: false, pro: true, plus: true },
    { key: "monthlyReport", free: false, pro: true, plus: true },
    { key: "fullCalendar", free: false, pro: true, plus: true },
    { key: "envelopes2", free: true, pro: false, plus: false },
    { key: "envelopes5", free: false, pro: true, plus: false },
    { key: "envelopesUnlimited", free: false, pro: false, plus: true },
    { key: "goals2", free: false, pro: true, plus: false },
    { key: "goalsUnlimited", free: false, pro: false, plus: true },
    { key: "multiCurrency", free: false, pro: false, plus: true },
    { key: "coupleMode", free: false, pro: false, plus: true },
    { key: "projection", free: false, pro: false, plus: true },
    { key: "export", free: false, pro: false, plus: true },
    { key: "advancedReports", free: false, pro: false, plus: true },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]} testID="premium-screen">
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <View style={styles.hero}>
          <Image source={{ uri: HERO_IMG }} style={styles.heroImg} contentFit="contain" />
          <Text style={styles.heroTitle}>{t("premium.title")}</Text>
          <Text style={styles.heroSubtitle}>{t("premium.subtitle")}</Text>
        </View>

        {/* Plan cards */}
        <View style={styles.plansRow}>
          <PlanCard
            plan="free"
            current={currentPlan === "free"}
            title={t("premium.free")}
            price="$0"
            highlight={false}
            onActivate={() => activate("free")}
            activateLabel={t("premium.returnFree")}
            testID="plan-card-free"
          />
          <PlanCard
            plan="pro"
            current={currentPlan === "pro"}
            title={t("premium.pro")}
            price="$2.99"
            subprice={t("premium.month")}
            highlight={true}
            onActivate={() => activate("pro")}
            activateLabel={t("premium.activate.pro")}
            testID="plan-card-pro"
          />
          <PlanCard
            plan="plus"
            current={currentPlan === "plus"}
            title={t("premium.plus")}
            price="$4.99"
            subprice={t("premium.month")}
            highlight={false}
            onActivate={() => activate("plus")}
            activateLabel={t("premium.activate.plus")}
            testID="plan-card-plus"
          />
        </View>

        {/* Value props */}
        <View style={styles.valuesCard}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <View key={n} style={styles.valueRow}>
              <View style={styles.valueIcon}>
                <Ionicons name="checkmark" size={16} color={colors.status.safeGreen} />
              </View>
              <Text style={styles.valueText}>{t(`premium.value.${n}`)}</Text>
            </View>
          ))}
        </View>

        {/* Feature comparison */}
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCol, { flex: 2 }]}>Feature</Text>
            <Text style={[styles.tableCol, styles.tableColHead]}>{t("premium.free")}</Text>
            <Text style={[styles.tableCol, styles.tableColHead]}>{t("premium.pro")}</Text>
            <Text style={[styles.tableCol, styles.tableColHead]}>{t("premium.plus")}</Text>
          </View>
          {PLAN_FEATURES.map((f, idx) => (
            <View
              key={f.key}
              style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowOdd : null]}
            >
              <Text style={[styles.tableCol, { flex: 2 }]} numberOfLines={2}>
                {t(`premium.feature.${f.key}`)}
              </Text>
              <View style={styles.tableCol}>
                <Mark on={f.free} />
              </View>
              <View style={styles.tableCol}>
                <Mark on={f.pro} />
              </View>
              <View style={styles.tableCol}>
                <Mark on={f.plus} />
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.fineprint}>{t("premium.cancelAnytime")}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Mark({ on }: { on: boolean }) {
  return on ? (
    <Ionicons name="checkmark-circle" size={18} color={colors.status.safeGreen} />
  ) : (
    <Ionicons name="remove-circle-outline" size={18} color={colors.text.tertiary} />
  );
}

function PlanCard({
  plan,
  current,
  title,
  price,
  subprice,
  highlight,
  onActivate,
  activateLabel,
  testID,
}: {
  plan: PremiumPlan;
  current: boolean;
  title: string;
  price: string;
  subprice?: string;
  highlight: boolean;
  onActivate: () => void;
  activateLabel: string;
  testID?: string;
}) {
  const t = useT();
  return (
    <View
      testID={testID}
      style={[
        styles.planCard,
        highlight && styles.planCardHighlight,
        current && styles.planCardCurrent,
      ]}
    >
      {highlight ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>★</Text>
        </View>
      ) : null}
      <Text style={[styles.planTitle, highlight && styles.planTitleHighlight]}>{title}</Text>
      <View style={styles.priceRow}>
        <Text style={[styles.planPrice, highlight && styles.planPriceHighlight]}>{price}</Text>
        {subprice ? (
          <Text style={[styles.planSubprice, highlight && styles.planSubpriceHighlight]}>
            {subprice}
          </Text>
        ) : null}
      </View>
      {current ? (
        <View style={styles.currentTag}>
          <Text style={styles.currentTagText}>{t("premium.currentPlan")}</Text>
        </View>
      ) : (
        <Button
          testID={`${testID}-activate`}
          label={activateLabel}
          onPress={onActivate}
          variant={highlight ? "primary" : "secondary"}
          size="sm"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.main },
  scroll: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  hero: { alignItems: "center", gap: spacing.sm },
  heroImg: { width: "100%", height: 160, marginBottom: spacing.sm },
  heroTitle: {
    fontSize: 32,
    color: colors.text.primary,
    fontFamily: "Outfit_700Bold",
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: "center",
    fontFamily: "DMSans_400Regular",
    lineHeight: 22,
  },
  plansRow: { flexDirection: "row", gap: spacing.sm },
  planCard: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    position: "relative",
  },
  planCardHighlight: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  planCardCurrent: {
    borderColor: colors.brand.softBlue,
    borderWidth: 2,
  },
  badge: {
    position: "absolute",
    top: -10,
    right: 8,
    backgroundColor: colors.warm.orange,
    borderRadius: radii.pill,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: colors.text.inverse, fontSize: 14, fontWeight: "700" },
  planTitle: {
    fontSize: 14,
    color: colors.text.primary,
    fontFamily: "Outfit_700Bold",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  planTitleHighlight: { color: colors.text.inverse },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 2 },
  planPrice: {
    fontSize: 22,
    color: colors.text.primary,
    fontFamily: "Outfit_700Bold",
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  planPriceHighlight: { color: colors.text.inverse },
  planSubprice: { fontSize: 11, color: colors.text.tertiary, fontFamily: "DMSans_400Regular" },
  planSubpriceHighlight: { color: colors.text.inverse, opacity: 0.7 },
  currentTag: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.brand.softBlueLight,
    borderRadius: radii.md,
    alignItems: "center",
  },
  currentTagText: {
    fontSize: 11,
    color: colors.brand.softBlue,
    fontFamily: "DMSans_500Medium",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  valuesCard: {
    padding: spacing.lg,
    backgroundColor: colors.background.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  valueRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  valueIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.status.safeGreenBg,
    alignItems: "center",
    justifyContent: "center",
  },
  valueText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    fontFamily: "DMSans_400Regular",
    lineHeight: 20,
  },
  tableCard: {
    backgroundColor: colors.background.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    padding: spacing.md,
    backgroundColor: colors.background.envelopeSurface,
  },
  tableRow: {
    flexDirection: "row",
    padding: spacing.md,
    alignItems: "center",
  },
  tableRowOdd: { backgroundColor: colors.background.envelopeSurface + "55" },
  tableCol: {
    flex: 1,
    fontSize: 12,
    color: colors.text.primary,
    fontFamily: "DMSans_400Regular",
    textAlign: "center",
    alignItems: "center",
  },
  tableColHead: {
    fontFamily: "DMSans_700Bold",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fineprint: {
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: "center",
    fontFamily: "DMSans_400Regular",
  },
});
