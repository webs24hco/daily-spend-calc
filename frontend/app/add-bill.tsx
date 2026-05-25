// Add bill (recurring payment) modal.

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
import { CategoryIcon } from "@/src/components/CategoryIcon";
import { DateInput } from "@/src/components/DateInput";
import { Input } from "@/src/components/Input";
import { PaywallModal } from "@/src/components/PaywallModal";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { CURRENCIES, EXPENSE_CATEGORIES, colors, radii, spacing } from "@/src/constants";
import { useAppData, useT } from "@/src/store/AppDataContext";
import { ExpenseCategory, PayFrequency } from "@/src/types";
import { addDays, todayISO } from "@/src/utils/dates";
import { parseMoneyInput } from "@/src/utils/format";
import { PaywallReason, canAddBill } from "@/src/utils/plan-limits";

export default function AddBill() {
  const t = useT();
  const router = useRouter();
  const { data, addRecurringPayment } = useAppData();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [nextDate, setNextDate] = useState(addDays(todayISO(), 30));
  const [frequency, setFrequency] = useState<PayFrequency>("monthly");
  const [category, setCategory] = useState<ExpenseCategory>("home");
  const [error, setError] = useState<string | null>(null);
  const [paywall, setPaywall] = useState<PaywallReason | null>(null);

  const onSave = async () => {
    const check = canAddBill(data);
    if (!check.ok) {
      setPaywall(check.reason);
      return;
    }
    const amt = parseMoneyInput(amount);
    if (!name.trim()) {
      setError(t("form.error.required"));
      return;
    }
    if (amt <= 0) {
      setError(t("form.error.amount"));
      return;
    }
    if (!data.wallets[0]) return;
    await addRecurringPayment({
      name: name.trim(),
      amount: amt,
      nextDate,
      frequency,
      category,
      walletId: data.wallets[0].id,
    });
    router.back();
  };

  const symbol = CURRENCIES.find((c) => c.code === data.settings.mainCurrency)?.symbol ?? "$";

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]} testID="add-bill-screen">
      <ScreenHeader title={t("bills.addNew")} />
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
            testID="add-bill-name"
            label={t("form.bill.name")}
            value={name}
            onChangeText={(v) => {
              setName(v);
              setError(null);
            }}
            placeholder={t("form.bill.namePlaceholder")}
            autoFocus
          />
          <Input
            testID="add-bill-amount"
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
            testID="add-bill-date"
            label={t("bills.nextDate")}
            value={nextDate}
            onChange={setNextDate}
            lang={data.settings.language}
          />
          <View style={{ gap: spacing.sm }}>
            <Text style={styles.label}>{t("common.frequency")}</Text>
            <View style={styles.row}>
              {(["weekly", "biweekly", "monthly"] as PayFrequency[]).map((f) => (
                <Pressable
                  key={f}
                  testID={`bill-freq-${f}`}
                  onPress={() => setFrequency(f)}
                  style={[styles.optBtn, frequency === f && styles.optBtnActive]}
                >
                  <Text
                    style={[styles.optText, frequency === f && styles.optTextActive]}
                  >
                    {t(`frequency.${f}`)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={{ gap: spacing.sm }}>
            <Text style={styles.label}>{t("common.category")}</Text>
            <View style={styles.catGrid}>
              {(Object.keys(EXPENSE_CATEGORIES) as ExpenseCategory[]).map((c) => (
                <Pressable
                  key={c}
                  testID={`bill-cat-${c}`}
                  onPress={() => setCategory(c)}
                  style={[styles.catBtn, category === c && styles.catBtnActive]}
                >
                  <CategoryIcon category={c} size={32} />
                  <Text
                    style={[styles.catLabel, category === c && styles.catLabelActive]}
                    numberOfLines={1}
                  >
                    {t(`category.${c}`)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>
        <View style={styles.footer}>
          <Button testID="add-bill-save" label={t("common.save")} onPress={onSave} />
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
  row: { flexDirection: "row", gap: spacing.sm },
  optBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  optBtnActive: {
    backgroundColor: colors.brand.softBlueLight,
    borderColor: colors.brand.softBlue,
  },
  optText: {
    fontSize: 13,
    color: colors.text.primary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
  },
  optTextActive: { color: colors.brand.softBlue },
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  catBtn: {
    width: "30%",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background.card,
  },
  catBtnActive: {
    borderColor: colors.brand.softBlue,
    backgroundColor: colors.brand.softBlueLight,
  },
  catLabel: {
    fontSize: 12,
    color: colors.text.primary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
  },
  catLabelActive: { color: colors.brand.softBlue },
  error: { color: colors.status.riskCoral, fontFamily: "DMSans_400Regular", fontSize: 13 },
  footer: { padding: spacing.lg },
});
