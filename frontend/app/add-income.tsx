// Add income modal.

import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/src/components/Button";
import { DateInput } from "@/src/components/DateInput";
import { Input } from "@/src/components/Input";
import { PaywallModal } from "@/src/components/PaywallModal";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { CURRENCIES, colors, radii, spacing } from "@/src/constants";
import { useAppData, useT } from "@/src/store/AppDataContext";
import { PayFrequency } from "@/src/types";
import { todayISO } from "@/src/utils/dates";
import { parseMoneyInput } from "@/src/utils/format";
import { PaywallReason, canAddRecurringIncome } from "@/src/utils/plan-limits";

export default function AddIncome() {
  const t = useT();
  const router = useRouter();
  const { data, addIncome } = useAppData();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [frequency, setFrequency] = useState<PayFrequency>("monthly");
  const [isRecurring, setIsRecurring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paywall, setPaywall] = useState<PaywallReason | null>(null);

  const onSave = async () => {
    const amt = parseMoneyInput(amount);
    if (!name.trim()) {
      setError(t("form.error.required"));
      return;
    }
    if (amt <= 0) {
      setError(t("form.error.amount"));
      return;
    }
    if (isRecurring) {
      const check = canAddRecurringIncome(data);
      if (!check.ok) {
        setPaywall(check.reason);
        return;
      }
    }
    if (!data.wallets[0]) return;
    await addIncome({
      name: name.trim(),
      amount: amt,
      date,
      frequency,
      isRecurring,
      walletId: data.wallets[0].id,
    });
    router.back();
  };

  const symbol = CURRENCIES.find((c) => c.code === data.settings.mainCurrency)?.symbol ?? "$";

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]} testID="add-income-screen">
      <ScreenHeader title={t("income.addNew")} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Input
            testID="add-income-name"
            label={t("form.income.name")}
            value={name}
            onChangeText={(v) => {
              setName(v);
              setError(null);
            }}
            placeholder={t("form.income.namePlaceholder")}
            autoFocus
          />
          <Input
            testID="add-income-amount"
            label={t("common.amount")}
            prefix={symbol}
            value={amount}
            onChangeText={(v) => {
              setAmount(v);
              setError(null);
            }}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
          <DateInput
            testID="add-income-date"
            label={t("common.date")}
            value={date}
            onChange={setDate}
            lang={data.settings.language}
          />
          <Pressable
            testID="add-income-recurring-toggle"
            onPress={() => setIsRecurring((v) => !v)}
            style={[styles.toggleRow, isRecurring && styles.toggleRowActive]}
          >
            <Text style={styles.toggleLabel}>{t("income.recurring")}</Text>
            <View style={[styles.switch, isRecurring && styles.switchOn]}>
              <View style={[styles.switchKnob, isRecurring && styles.switchKnobOn]} />
            </View>
          </Pressable>
          {isRecurring ? (
            <View style={{ gap: spacing.sm }}>
              <Text style={styles.label}>{t("common.frequency")}</Text>
              <View style={styles.freqRow}>
                {(["weekly", "biweekly", "monthly"] as PayFrequency[]).map((f) => (
                  <Pressable
                    key={f}
                    testID={`add-income-freq-${f}`}
                    onPress={() => setFrequency(f)}
                    style={[styles.freqBtn, frequency === f && styles.freqBtnActive]}
                  >
                    <Text
                      style={[styles.freqText, frequency === f && styles.freqTextActive]}
                    >
                      {t(`frequency.${f}`)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>
        <View style={styles.footer}>
          <Button testID="add-income-save" label={t("common.save")} onPress={onSave} />
        </View>
      </KeyboardAvoidingView>
      <PaywallModal visible={!!paywall} reason={paywall} onClose={() => setPaywall(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.main },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    fontFamily: "DMSans_500Medium",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleRowActive: {
    backgroundColor: colors.brand.softBlueLight,
    borderColor: colors.brand.softBlue,
  },
  toggleLabel: {
    fontSize: 15,
    color: colors.text.primary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
  },
  switch: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.border,
    padding: 2,
  },
  switchOn: { backgroundColor: colors.brand.softBlue },
  switchKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.background.main,
  },
  switchKnobOn: { transform: [{ translateX: 18 }] },
  freqRow: { flexDirection: "row", gap: spacing.sm },
  freqBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  freqBtnActive: {
    backgroundColor: colors.brand.softBlueLight,
    borderColor: colors.brand.softBlue,
  },
  freqText: {
    fontSize: 13,
    color: colors.text.primary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
  },
  freqTextActive: { color: colors.brand.softBlue },
  error: { color: colors.status.riskCoral, fontFamily: "DMSans_400Regular", fontSize: 13 },
  footer: { padding: spacing.lg },
});
