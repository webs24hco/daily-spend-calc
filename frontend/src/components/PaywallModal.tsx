// Paywall modal — shown when a free user hits a limit.
// Visible above any screen via React Native Modal.

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@/src/components/Button";
import { colors, radii, spacing } from "@/src/constants";
import { useT } from "@/src/store/AppDataContext";
import { PaywallReason } from "@/src/utils/plan-limits";

interface PaywallModalProps {
  visible: boolean;
  reason: PaywallReason | null;
  onClose: () => void;
  testID?: string;
}

const REASON_TO_KEY: Record<PaywallReason, string> = {
  expenses: "paywall.limit.expenses",
  bills: "paywall.limit.bills",
  envelopes: "paywall.limit.envelopes",
  wallets: "paywall.limit.wallets",
  incomes: "paywall.limit.incomes",
  goals: "paywall.limit.goals",
  simulator: "paywall.limit.simulator",
  monthly: "paywall.limit.monthly",
  projection: "paywall.limit.projection",
  multiCurrency: "paywall.limit.multiCurrency",
  export: "paywall.limit.export",
};

export function PaywallModal({ visible, reason, onClose, testID }: PaywallModalProps) {
  const t = useT();
  const router = useRouter();
  if (!reason) return null;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View testID={testID ?? "paywall-modal"} style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="sparkles" size={28} color={colors.warm.orange} />
          </View>
          <Text style={styles.title}>{t("premium.title")}</Text>
          <Text style={styles.message}>{t(REASON_TO_KEY[reason])}</Text>
          <View style={styles.actions}>
            <Button
              testID="paywall-upgrade-btn"
              label={t("paywall.cta.upgrade")}
              onPress={() => {
                onClose();
                router.push("/(tabs)/premium");
              }}
            />
            <Pressable
              testID="paywall-later-btn"
              onPress={onClose}
              style={styles.laterBtn}
              hitSlop={8}
            >
              <Text style={styles.laterText}>{t("paywall.cta.later")}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(11, 25, 44, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.background.main,
    borderRadius: radii.lg,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radii.pill,
    backgroundColor: colors.warm.peach,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text.primary,
    fontFamily: "Outfit_700Bold",
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: "center",
    fontFamily: "DMSans_400Regular",
    lineHeight: 22,
  },
  actions: {
    width: "100%",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  laterBtn: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  laterText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
  },
});
