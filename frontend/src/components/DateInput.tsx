// Cross-platform date input using ISO YYYY-MM-DD format.
// Avoids the native @react-native-community/datetimepicker dependency to keep
// the MVP simple and the web preview functional.

import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "@/src/components/Input";
import { colors, radii, spacing } from "@/src/constants";
import { addDays, formatDateLong, parseISO, todayISO, toISODate } from "@/src/utils/dates";

interface DateInputProps {
  label?: string;
  value: string; // ISO YYYY-MM-DD
  onChange: (iso: string) => void;
  hint?: string;
  testID?: string;
  lang?: "es" | "en";
}

export function DateInput({ label, value, onChange, hint, testID, lang = "es" }: DateInputProps) {
  const [showQuick, setShowQuick] = useState(false);
  const display = value ? formatDateLong(value, lang) : "";

  const setRelative = (days: number) => {
    onChange(addDays(todayISO(), days));
    setShowQuick(false);
  };

  const shift = (days: number) => {
    if (!value) onChange(todayISO());
    else onChange(addDays(value, days));
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        testID={testID}
        onPress={() => setShowQuick((s) => !s)}
        style={styles.field}
      >
        <Ionicons name="calendar-outline" size={20} color={colors.text.secondary} />
        <Text style={styles.value}>{display || (lang === "es" ? "Seleccionar fecha" : "Select date")}</Text>
        <Ionicons name="chevron-down" size={18} color={colors.text.tertiary} />
      </Pressable>
      {showQuick ? (
        <View style={styles.quick}>
          <View style={styles.row}>
            <Pressable testID="date-input-today" onPress={() => setRelative(0)} style={styles.chip}>
              <Text style={styles.chipText}>{lang === "es" ? "Hoy" : "Today"}</Text>
            </Pressable>
            <Pressable
              testID="date-input-tomorrow"
              onPress={() => setRelative(1)}
              style={styles.chip}
            >
              <Text style={styles.chipText}>{lang === "es" ? "Mañana" : "Tomorrow"}</Text>
            </Pressable>
            <Pressable testID="date-input-1week" onPress={() => setRelative(7)} style={styles.chip}>
              <Text style={styles.chipText}>{lang === "es" ? "+7 días" : "+7 days"}</Text>
            </Pressable>
            <Pressable
              testID="date-input-2weeks"
              onPress={() => setRelative(14)}
              style={styles.chip}
            >
              <Text style={styles.chipText}>{lang === "es" ? "+14 días" : "+14 days"}</Text>
            </Pressable>
            <Pressable
              testID="date-input-1month"
              onPress={() => setRelative(30)}
              style={styles.chip}
            >
              <Text style={styles.chipText}>{lang === "es" ? "+30 días" : "+30 days"}</Text>
            </Pressable>
          </View>
          <View style={styles.shiftRow}>
            <Pressable
              testID="date-input-minus-1"
              onPress={() => shift(-1)}
              style={styles.shiftBtn}
            >
              <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
              <Text style={styles.shiftText}>-1</Text>
            </Pressable>
            <Pressable testID="date-input-plus-1" onPress={() => shift(1)} style={styles.shiftBtn}>
              <Text style={styles.shiftText}>+1</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.text.primary} />
            </Pressable>
          </View>
        </View>
      ) : null}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm, width: "100%" },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    fontFamily: "DMSans_500Medium",
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.background.main,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  value: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    fontFamily: "DMSans_400Regular",
  },
  quick: {
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: radii.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.main,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    fontSize: 13,
    color: colors.text.primary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
  },
  shiftRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  shiftBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.main,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shiftText: {
    fontSize: 14,
    color: colors.text.primary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
  },
  hint: {
    fontSize: 13,
    color: colors.text.tertiary,
    fontFamily: "DMSans_400Regular",
  },
});
