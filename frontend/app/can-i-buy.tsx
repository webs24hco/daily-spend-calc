// "Can I Buy This?" — simulator that previews purchase impact.

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/src/components/Button";
import { Input } from "@/src/components/Input";
import { PaywallModal } from "@/src/components/PaywallModal";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { StatusPill } from "@/src/components/StatusPill";
import { CURRENCIES, colors, radii, spacing } from "@/src/constants";
import { useAppData, useT } from "@/src/store/AppDataContext";
import {
  calculatePurchaseImpact,
  calculateSafeDailySpend,
} from "@/src/utils/calculations";
import { formatMoney, parseMoneyInput } from "@/src/utils/format";
import { PaywallReason, canUseSimulator } from "@/src/utils/plan-limits";

export default function CanIBuy() {
  const t = useT();
  const router = useRouter();
  const { data, incrementSimulatorUsage } = useAppData();
  const [itemName, setItemName] = useState("");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<ReturnType<typeof calculatePurchaseImpact> | null>(null);
  const [paywall, setPaywall] = useState<PaywallReason | null>(null);
  const [error, setError] = useState<string | null>(null);

  const symbol = CURRENCIES.find((c) => c.code === data.settings.mainCurrency)?.symbol ?? "$";
  const currentDaily = calculateSafeDailySpend(data);

  const onSimulate = async () => {
    const check = canUseSimulator(data);
    if (!check.ok) {
      setPaywall(check.reason);
      return;
    }
    const amt = parseMoneyInput(amount);
    if (amt <= 0) {
      setError(t("form.error.amount"));
      return;
    }
    setError(null);
    const impact = calculatePurchaseImpact(data, amt);
    setResult(impact);
    await incrementSimulatorUsage();
  };

  const resultBg = result
    ? result.status === "safe"
      ? colors.status.safeGreenBg
      : result.status === "careful"
        ? colors.status.carefulAmberBg
        : colors.status.riskCoralBg
    : colors.background.card;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]} testID="can-i-buy-screen">
      <ScreenHeader title={t("canIBuy.title")} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Current state preview */}
          <View style={styles.previewCard}>
            <Text style={styles.previewLabel}>{t("home.safeSpend.label")}</Text>
            <Text style={styles.previewValue}>
              {formatMoney(currentDaily, data.settings.mainCurrency)}
            </Text>
          </View>

          <Input
            testID="can-i-buy-name"
            label={t("canIBuy.itemName")}
            value={itemName}
            onChangeText={setItemName}
            placeholder={t("canIBuy.itemPlaceholder")}
            autoFocus
          />
          <Input
            testID="can-i-buy-amount"
            label={t("canIBuy.amount")}
            prefix={symbol}
            value={amount}
            onChangeText={(v) => {
              setAmount(v);
              setError(null);
            }}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            testID="can-i-buy-simulate"
            label={t("canIBuy.simulate")}
            onPress={onSimulate}
          />

          {result ? (
            <View
              testID="can-i-buy-result"
              style={[styles.resultCard, { backgroundColor: resultBg }]}
            >
              <StatusPill
                status={result.status}
                label={t(`canIBuy.result.${result.status}`)}
              />
              <Text style={styles.resultBigText}>
                {t(`canIBuy.result.${result.status}`)}
              </Text>
              <View style={styles.deltaRow}>
                <View>
                  <Text style={styles.deltaLabel}>{t("canIBuy.newDaily")}</Text>
                  <Text style={styles.deltaValue}>
                    {formatMoney(result.newDaily, data.settings.mainCurrency)}
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color={colors.text.secondary} />
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.deltaLabel}>{t("home.moneyLeft")}</Text>
                  <Text
                    style={[
                      styles.deltaValue,
                      { color: result.newAvailable < 0 ? colors.status.riskCoral : colors.text.primary },
                    ]}
                  >
                    {formatMoney(result.newAvailable, data.settings.mainCurrency)}
                  </Text>
                </View>
              </View>
              <Text style={styles.resultMessage}>
                {result.status === "safe" &&
                  t("canIBuy.impact") +
                    ": " +
                    t(`status.safe.message`)}
                {result.status === "careful" && t("status.careful.message")}
                {result.status === "risk" && t("status.risk.message")}
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
      <PaywallModal visible={!!paywall} reason={paywall} onClose={() => {
        setPaywall(null);
        router.back();
      }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.main },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  previewCard: {
    padding: spacing.lg,
    backgroundColor: colors.brand.softBlueLight,
    borderRadius: radii.lg,
    alignItems: "center",
    gap: spacing.xs,
  },
  previewLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  previewValue: {
    fontSize: 28,
    color: colors.text.primary,
    fontFamily: "Outfit_700Bold",
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  resultCard: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    gap: spacing.md,
    alignItems: "center",
  },
  resultBigText: {
    fontSize: 22,
    color: colors.text.primary,
    fontFamily: "Outfit_700Bold",
    fontWeight: "700",
    textAlign: "center",
  },
  deltaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    gap: spacing.md,
  },
  deltaLabel: {
    fontSize: 11,
    color: colors.text.tertiary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  deltaValue: {
    fontSize: 18,
    color: colors.text.primary,
    fontFamily: "Outfit_700Bold",
    fontWeight: "700",
  },
  resultMessage: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    fontFamily: "DMSans_400Regular",
    lineHeight: 20,
  },
  error: { color: colors.status.riskCoral, fontFamily: "DMSans_400Regular", fontSize: 13 },
});
