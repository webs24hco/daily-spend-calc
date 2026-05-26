// Add expense modal.

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
import { ExpenseCategory } from "@/src/types";
import { todayISO } from "@/src/utils/dates";
import { parseMoneyInput } from "@/src/utils/format";
import { PaywallReason, canAddExpense } from "@/src/utils/plan-limits";

export default function AddExpense() {
  const t = useT();
  const router = useRouter();
  const { data, addExpense } = useAppData();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("food");
  const [date, setDate] = useState(todayISO());
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
    const check = canAddExpense(data);
    if (!check.ok) {
      setPaywall(check.reason);
      return;
    }
    if (!data.wallets[0]) return;
    await addExpense({
      name: name.trim(),
      amount: amt,
      date,
      category,
      walletId: data.wallets[0].id,
    });
    router.back();
  };

  const symbol = CURRENCIES.find((c) => c.code === data.settings.mainCurrency)?.symbol ?? "$";

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]} testID="add-expense-screen">
      <ScreenHeader title={t("expenses.addNew")} />
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
            testID="add-expense-name"
            label={t("form.expense.name")}
            value={name}
            onChangeText={(v) => {
              setName(v);
              setError(null);
            }}
            placeholder={t("form.expense.namePlaceholder")}
            autoFocus
          />
          <Input
            testID="add-expense-amount"
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
          <View style={{ gap: spacing.sm }}>
            <Text style={styles.label}>{t("common.category")}</Text>
            <View style={styles.catGrid}>
              {(Object.keys(EXPENSE_CATEGORIES) as ExpenseCategory[]).map((c) => (
                <Pressable
                  key={c}
                  testID={`category-${c}`}
                  onPress={() => setCategory(c)}
                  style={[styles.catBtn, category === c && styles.catBtnActive]}
                >
                  <CategoryIcon category={c} size={36} />
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
          <DateInput
            testID="add-expense-date"
            label={t("common.date")}
            value={date}
            onChange={setDate}
            lang={data.settings.language}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>
        <View style={styles.footer}>
          <Button testID="add-expense-save" label={t("common.save")} onPress={onSave} />
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
  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
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
