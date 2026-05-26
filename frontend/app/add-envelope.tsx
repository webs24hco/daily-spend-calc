// Add envelope modal.

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
import { Input } from "@/src/components/Input";
import { PaywallModal } from "@/src/components/PaywallModal";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { CURRENCIES, ENVELOPE_COLORS, colors, radii, spacing } from "@/src/constants";
import { useAppData, useT } from "@/src/store/AppDataContext";
import { parseMoneyInput } from "@/src/utils/format";
import { PaywallReason, canAddEnvelope } from "@/src/utils/plan-limits";

export default function AddEnvelope() {
  const t = useT();
  const router = useRouter();
  const { data, addEnvelope } = useAppData();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [color, setColor] = useState(ENVELOPE_COLORS[0]);
  const [error, setError] = useState<string | null>(null);
  const [paywall, setPaywall] = useState<PaywallReason | null>(null);

  const onSave = async () => {
    if (!name.trim()) {
      setError(t("form.error.required"));
      return;
    }
    const amt = parseMoneyInput(amount);
    if (amt < 0) {
      setError(t("form.error.amount"));
      return;
    }
    const check = canAddEnvelope(data);
    if (!check.ok) {
      setPaywall(check.reason);
      return;
    }
    await addEnvelope({ name: name.trim(), amountReserved: amt, color });
    router.back();
  };

  const symbol = CURRENCIES.find((c) => c.code === data.settings.mainCurrency)?.symbol ?? "$";

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]} testID="add-envelope-screen">
      <ScreenHeader title={t("envelopes.addNew")} />
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
            testID="add-envelope-name"
            label={t("form.envelope.name")}
            value={name}
            onChangeText={(v) => {
              setName(v);
              setError(null);
            }}
            placeholder={data.settings.language === "es" ? "Ej: comida, transporte..." : "E.g. food, transport..."}
            autoFocus
          />
          <Input
            testID="add-envelope-amount"
            label={t("form.envelope.amount")}
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
            <Text style={styles.label}>Color</Text>
            <View style={styles.colorRow}>
              {ENVELOPE_COLORS.map((c) => (
                <Pressable
                  key={c}
                  testID={`envelope-color-${c}`}
                  onPress={() => setColor(c)}
                  style={[
                    styles.colorBtn,
                    { backgroundColor: c },
                    color === c && styles.colorBtnActive,
                  ]}
                />
              ))}
            </View>
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>
        <View style={styles.footer}>
          <Button testID="add-envelope-save" label={t("common.save")} onPress={onSave} />
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
  colorRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  colorBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorBtnActive: {
    borderColor: colors.brand.primary,
  },
  error: { color: colors.status.riskCoral, fontFamily: "DMSans_400Regular", fontSize: 13 },
  footer: { padding: spacing.lg },
});
