import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "@/src/constants";
import { FinancialStatus } from "@/src/types";

interface StatusPillProps {
  status: FinancialStatus;
  label: string;
  testID?: string;
}

const STATUS_CONFIG: Record<
  FinancialStatus,
  { color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  safe: { color: colors.status.safeGreen, bg: colors.status.safeGreenBg, icon: "checkmark-circle" },
  careful: {
    color: colors.status.carefulAmber,
    bg: colors.status.carefulAmberBg,
    icon: "alert-circle",
  },
  risk: { color: colors.status.riskCoral, bg: colors.status.riskCoralBg, icon: "warning" },
};

export function StatusPill({ status, label, testID }: StatusPillProps) {
  const cfg = STATUS_CONFIG[status];
  return (
    <View testID={testID} style={[styles.pill, { backgroundColor: cfg.bg }]}>
      <Ionicons name={cfg.icon} size={16} color={cfg.color} />
      <Text style={[styles.label, { color: cfg.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    alignSelf: "flex-start",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "DMSans_500Medium",
  },
});
