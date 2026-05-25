// Setup wizard — step-by-step. Stores everything in AppData.

import { Ionicons } from "@expo/vector-icons";
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
import { ProgressBar } from "@/src/components/ProgressBar";
import { CURRENCIES, EXPENSE_CATEGORIES, colors, radii, spacing } from "@/src/constants";
import { useAppData, useT } from "@/src/store/AppDataContext";
import { Currency, PayFrequency } from "@/src/types";
import { addDays, addFrequency, todayISO } from "@/src/utils/dates";
import { parseMoneyInput } from "@/src/utils/format";

type FrequencyOption = PayFrequency;

const QUICK_BILLS: { key: string; name: string; category: keyof typeof EXPENSE_CATEGORIES }[] = [
  { key: "rent", name: "Renta", category: "home" },
  { key: "food", name: "Comida", category: "food" },
  { key: "phone", name: "Teléfono", category: "subscriptions" },
  { key: "internet", name: "Internet", category: "subscriptions" },
  { key: "subs", name: "Suscripciones", category: "subscriptions" },
  { key: "transport", name: "Transporte", category: "transport" },
  { key: "credit", name: "Tarjeta de crédito", category: "debt" },
  { key: "other", name: "Otro", category: "other" },
];

const STEPS = ["balance", "currency", "payday", "income", "frequency", "bills", "goal", "done"] as const;
type Step = typeof STEPS[number];

export default function Setup() {
  const t = useT();
  const router = useRouter();
  const {
    data,
    updateSettings,
    updatePrimaryWalletBalance,
    upsertWallet,
    addIncome,
    addRecurringPayment,
    addGoal,
  } = useAppData();

  const [stepIdx, setStepIdx] = useState(0);
  const step: Step = STEPS[stepIdx];

  const [balance, setBalance] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [payday, setPayday] = useState<string>(addDays(todayISO(), 14));
  const [income, setIncome] = useState("");
  const [frequency, setFrequency] = useState<FrequencyOption>("biweekly");
  const [selectedBills, setSelectedBills] = useState<Record<string, string>>({});
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");

  const progress = (stepIdx + 1) / STEPS.length;

  const next = () => setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
  const back = () => {
    if (stepIdx === 0) router.back();
    else setStepIdx((i) => i - 1);
  };

  const finish = async () => {
    const balanceN = parseMoneyInput(balance) || 0;
    const incomeN = parseMoneyInput(income) || 0;
    const lang = data.settings.language;

    // 1. Update primary wallet + settings
    await updatePrimaryWalletBalance(balanceN);
    const firstWallet = data.wallets[0];
    if (firstWallet) {
      await upsertWallet({ ...firstWallet, balance: balanceN, currency });
    }
    await updateSettings({
      mainCurrency: currency,
      nextPayday: payday,
      payFrequency: frequency,
      incomeAmount: incomeN,
      setupCompleted: true,
    });

    // 2. Save the recurring income (always recurring for setup wizard)
    if (incomeN > 0 && data.wallets[0]) {
      await addIncome({
        name: lang === "es" ? "Sueldo" : "Salary",
        amount: incomeN,
        date: payday,
        frequency,
        isRecurring: true,
        walletId: data.wallets[0].id,
      });
    }

    // 3. Save selected bills
    if (data.wallets[0]) {
      for (const billKey of Object.keys(selectedBills)) {
        const amount = parseMoneyInput(selectedBills[billKey]) || 0;
        if (amount <= 0) continue;
        const bill = QUICK_BILLS.find((b) => b.key === billKey);
        if (!bill) continue;
        await addRecurringPayment({
          name: bill.name,
          amount,
          nextDate: addFrequency(todayISO(), "monthly"),
          frequency: "monthly",
          category: bill.category as any,
          walletId: data.wallets[0].id,
        });
      }
    }

    // 4. Save goal
    const target = parseMoneyInput(goalTarget) || 0;
    if (goalName.trim() && target > 0) {
      await addGoal({
        name: goalName.trim(),
        targetAmount: target,
        currentAmount: 0,
        reservedThisCycle: 0,
      });
    }

    router.replace("/(tabs)");
  };

  const canContinue = (): boolean => {
    switch (step) {
      case "balance":
        return parseMoneyInput(balance) >= 0 && balance.length > 0;
      case "currency":
        return true;
      case "payday":
        return !!payday;
      case "income":
        return parseMoneyInput(income) > 0;
      case "frequency":
        return true;
      case "bills":
        return true;
      case "goal":
        return true;
      case "done":
        return true;
    }
  };

  const renderStep = () => {
    switch (step) {
      case "balance":
        return (
          <StepShell title={t("setup.balance.title")} subtitle={t("setup.balance.subtitle")}>
            <Input
              testID="setup-balance-input"
              label={t("common.amount")}
              prefix={CURRENCIES.find((c) => c.code === currency)?.symbol ?? "$"}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={balance}
              onChangeText={setBalance}
              autoFocus
            />
          </StepShell>
        );
      case "currency":
        return (
          <StepShell title={t("setup.currency.title")} subtitle={t("setup.currency.subtitle")}>
            <View style={styles.currencyList}>
              {CURRENCIES.map((c) => (
                <Pressable
                  key={c.code}
                  testID={`setup-currency-${c.code}`}
                  onPress={() => setCurrency(c.code)}
                  style={[
                    styles.currencyRow,
                    currency === c.code && styles.currencyRowActive,
                  ]}
                >
                  <View style={styles.currencyLeft}>
                    <Text style={styles.currencySymbol}>{c.symbol}</Text>
                    <View>
                      <Text style={styles.currencyCode}>{c.code}</Text>
                      <Text style={styles.currencyName}>{c.name}</Text>
                    </View>
                  </View>
                  {currency === c.code ? (
                    <Ionicons name="checkmark-circle" size={22} color={colors.brand.softBlue} />
                  ) : null}
                </Pressable>
              ))}
            </View>
          </StepShell>
        );
      case "payday":
        return (
          <StepShell title={t("setup.payday.title")} subtitle={t("setup.payday.subtitle")}>
            <DateInput
              testID="setup-payday-input"
              label={t("common.date")}
              value={payday}
              onChange={setPayday}
              lang={data.settings.language}
            />
          </StepShell>
        );
      case "income":
        return (
          <StepShell title={t("setup.income.title")} subtitle={t("setup.income.subtitle")}>
            <Input
              testID="setup-income-input"
              label={t("common.amount")}
              prefix={CURRENCIES.find((c) => c.code === currency)?.symbol ?? "$"}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={income}
              onChangeText={setIncome}
              autoFocus
            />
          </StepShell>
        );
      case "frequency":
        return (
          <StepShell title={t("setup.frequency.title")}>
            <View style={styles.freqList}>
              {(["weekly", "biweekly", "monthly", "irregular"] as FrequencyOption[]).map((f) => (
                <Pressable
                  key={f}
                  testID={`setup-frequency-${f}`}
                  onPress={() => setFrequency(f)}
                  style={[
                    styles.freqRow,
                    frequency === f && styles.freqRowActive,
                  ]}
                >
                  <Text
                    style={[styles.freqText, frequency === f && styles.freqTextActive]}
                  >
                    {t(`frequency.${f}`)}
                  </Text>
                  {frequency === f ? (
                    <Ionicons name="checkmark-circle" size={20} color={colors.brand.softBlue} />
                  ) : null}
                </Pressable>
              ))}
            </View>
          </StepShell>
        );
      case "bills":
        return (
          <StepShell title={t("setup.bills.title")} subtitle={t("setup.bills.subtitle")}>
            <View style={styles.billsList}>
              {QUICK_BILLS.map((b) => {
                const isOn = b.key in selectedBills;
                return (
                  <View key={b.key} style={styles.billRow}>
                    <Pressable
                      testID={`setup-bill-toggle-${b.key}`}
                      onPress={() => {
                        setSelectedBills((prev) => {
                          const next = { ...prev };
                          if (isOn) delete next[b.key];
                          else next[b.key] = "";
                          return next;
                        });
                      }}
                      style={[styles.billHeader, isOn && styles.billHeaderActive]}
                    >
                      <View style={styles.billLeft}>
                        <Ionicons
                          name={
                            (EXPENSE_CATEGORIES[b.category].iconName as any) ?? "ellipse-outline"
                          }
                          size={18}
                          color={
                            isOn ? colors.brand.softBlue : colors.text.secondary
                          }
                        />
                        <Text
                          style={[styles.billName, isOn && styles.billNameActive]}
                        >
                          {b.name}
                        </Text>
                      </View>
                      <Ionicons
                        name={isOn ? "checkmark-circle" : "add-circle-outline"}
                        size={22}
                        color={isOn ? colors.brand.softBlue : colors.text.tertiary}
                      />
                    </Pressable>
                    {isOn ? (
                      <Input
                        testID={`setup-bill-amount-${b.key}`}
                        prefix={CURRENCIES.find((c) => c.code === currency)?.symbol ?? "$"}
                        placeholder="0.00"
                        keyboardType="decimal-pad"
                        value={selectedBills[b.key]}
                        onChangeText={(v) =>
                          setSelectedBills((prev) => ({ ...prev, [b.key]: v }))
                        }
                        containerStyle={{ marginTop: spacing.sm }}
                      />
                    ) : null}
                  </View>
                );
              })}
            </View>
          </StepShell>
        );
      case "goal":
        return (
          <StepShell title={t("setup.goal.title")} subtitle={t("setup.goal.subtitle")}>
            <Input
              testID="setup-goal-name-input"
              label={t("form.goal.name")}
              placeholder={data.settings.language === "es" ? "Ej: viaje, emergencia..." : "E.g. trip, emergency..."}
              value={goalName}
              onChangeText={setGoalName}
            />
            <Input
              testID="setup-goal-target-input"
              label={t("form.goal.target")}
              prefix={CURRENCIES.find((c) => c.code === currency)?.symbol ?? "$"}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={goalTarget}
              onChangeText={setGoalTarget}
              containerStyle={{ marginTop: spacing.md }}
            />
          </StepShell>
        );
      case "done":
        return (
          <View style={styles.doneCenter} testID="setup-done-screen">
            <View style={styles.doneIcon}>
              <Ionicons name="sparkles" size={36} color={colors.status.safeGreen} />
            </View>
            <Text style={styles.doneTitle}>{t("setup.complete.title")}</Text>
            <Text style={styles.doneText}>{t("setup.complete.subtitle")}</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]} testID="setup-screen">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Pressable testID="setup-back-btn" onPress={back} hitSlop={12} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </Pressable>
          <View style={styles.progressWrap}>
            <ProgressBar value={progress} color={colors.brand.primary} />
          </View>
        </View>
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          keyboardShouldPersistTaps="handled"
        >
          {renderStep()}
        </ScrollView>
        <View style={styles.footer}>
          <Button
            testID="setup-continue-btn"
            label={step === "done" ? t("onboarding.cta") : t("common.continue")}
            onPress={step === "done" ? finish : next}
            disabled={!canContinue()}
          />
          {step !== "done" && (step === "bills" || step === "goal") ? (
            <Pressable testID="setup-skip-btn" onPress={next} hitSlop={8} style={styles.skipBtn}>
              <Text style={styles.skipText}>{t("common.skip")}</Text>
            </Pressable>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.stepWrap}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>{title}</Text>
        {subtitle ? <Text style={styles.stepSubtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.stepBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.main },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: colors.background.card,
  },
  progressWrap: { flex: 1 },
  body: { flex: 1 },
  bodyContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  stepWrap: { gap: spacing.xl },
  stepHeader: { gap: spacing.sm },
  stepTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text.primary,
    fontFamily: "Outfit_700Bold",
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    fontFamily: "DMSans_400Regular",
    lineHeight: 22,
  },
  stepBody: { gap: spacing.md },
  footer: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  skipBtn: { alignItems: "center", paddingVertical: spacing.sm },
  skipText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
  },
  currencyList: { gap: spacing.sm },
  currencyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencyRowActive: {
    backgroundColor: colors.brand.softBlueLight,
    borderColor: colors.brand.softBlue,
  },
  currencyLeft: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  currencySymbol: {
    fontSize: 22,
    color: colors.text.primary,
    fontFamily: "Outfit_700Bold",
    width: 32,
  },
  currencyCode: {
    fontSize: 15,
    color: colors.text.primary,
    fontFamily: "DMSans_700Bold",
    fontWeight: "700",
  },
  currencyName: {
    fontSize: 13,
    color: colors.text.secondary,
    fontFamily: "DMSans_400Regular",
  },
  freqList: { gap: spacing.sm },
  freqRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  freqRowActive: {
    backgroundColor: colors.brand.softBlueLight,
    borderColor: colors.brand.softBlue,
  },
  freqText: {
    fontSize: 16,
    color: colors.text.primary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
  },
  freqTextActive: { color: colors.brand.primary },
  billsList: { gap: spacing.md },
  billRow: {},
  billHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  billHeaderActive: {
    backgroundColor: colors.brand.softBlueLight,
    borderColor: colors.brand.softBlue,
  },
  billLeft: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  billName: {
    fontSize: 15,
    color: colors.text.primary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
  },
  billNameActive: { color: colors.brand.primary },
  doneCenter: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  doneIcon: {
    width: 84,
    height: 84,
    borderRadius: radii.pill,
    backgroundColor: colors.status.safeGreenBg,
    alignItems: "center",
    justifyContent: "center",
  },
  doneTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text.primary,
    fontFamily: "Outfit_700Bold",
    textAlign: "center",
  },
  doneText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    fontFamily: "DMSans_400Regular",
    lineHeight: 24,
  },
});
