// Add savings goal modal.

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
import { DateInput } from "@/src/components/DateInput";
import { Input } from "@/src/components/Input";
import { PaywallModal } from "@/src/components/PaywallModal";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { CURRENCIES, colors, spacing } from "@/src/constants";
import { useAppData, useT } from "@/src/store/AppDataContext";
import { addDays, todayISO } from "@/src/utils/dates";
import { parseMoneyInput } from "@/src/utils/format";
import { PaywallReason, canAddGoal } from "@/src/utils/plan-limits";

export default function AddGoal() {
  const t = useT();
  const router = useRouter();
  const { data, addGoal } = useAppData();
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [saved, setSaved] = useState("");
  const [due, setDue] = useState(addDays(todayISO(), 90));
  const [error, setError] = useState<string | null>(null);
  const [paywall, setPaywall] = useState<PaywallReason | null>(null);

  const onSave = async () => {
    const check = canAddGoal(data);
    if (!check.ok) {
      setPaywall(check.reason);
      return;
    }
    if (!name.trim()) {
      setError(t("form.error.required"));
      return;
    }
    const targetN = parseMoneyInput(target);
    if (targetN <= 0) {
      setError(t("form.error.amount"));
      return;
    }
    const savedN = parseMoneyInput(saved);
    await addGoal({
      name: name.trim(),
      targetAmount: targetN,
      currentAmount: savedN,
      dueDate: due,
      reservedThisCycle: 0,
    });
    router.back();
  };

  const symbol = CURRENCIES.find((c) => c.code === data.settings.mainCurrency)?.symbol ?? "$";

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]} testID="add-goal-screen">
      <ScreenHeader title={t("goals.addNew")} />
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
            testID="add-goal-name"
            label={t("form.goal.name")}
            value={name}
            onChangeText={(v) => {
              setName(v);
              setError(null);
            }}
            placeholder={data.settings.language === "es" ? "Ej: viaje, emergencia..." : "E.g. trip, emergency..."}
            autoFocus
          />
          <Input
            testID="add-goal-target"
            label={t("form.goal.target")}
            prefix={symbol}
            value={target}
            onChangeText={(v) => {
              setTarget(v);
              setError(null);
            }}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
          <Input
            testID="add-goal-saved"
            label={t("form.goal.saved")}
            prefix={symbol}
            value={saved}
            onChangeText={setSaved}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
          <DateInput
            testID="add-goal-due"
            label={t("form.goal.due")}
            value={due}
            onChange={setDue}
            lang={data.settings.language}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>
        <View style={styles.footer}>
          <Button testID="add-goal-save" label={t("common.save")} onPress={onSave} />
        </View>
      </KeyboardAvoidingView>
      <PaywallModal visible={!!paywall} reason={paywall} onClose={() => setPaywall(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.main },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  error: { color: colors.status.riskCoral, fontFamily: "DMSans_400Regular", fontSize: 13 },
  footer: { padding: spacing.lg },
});
