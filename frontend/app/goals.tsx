// Savings goals screen.

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/src/components/Button";
import { ConfirmDialog } from "@/src/components/ConfirmDialog";
import { EmptyState } from "@/src/components/EmptyState";
import { PaywallModal } from "@/src/components/PaywallModal";
import { ProgressBar } from "@/src/components/ProgressBar";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { colors, radii, spacing } from "@/src/constants";
import { useAppData, useT } from "@/src/store/AppDataContext";
import { SavingsGoal } from "@/src/types";
import { formatDateShort } from "@/src/utils/dates";
import { formatMoney } from "@/src/utils/format";
import { PaywallReason, canAddGoal } from "@/src/utils/plan-limits";

export default function GoalsScreen() {
  const t = useT();
  const router = useRouter();
  const { data, deleteGoal } = useAppData();
  const [confirmDelete, setConfirmDelete] = useState<SavingsGoal | null>(null);
  const [paywall, setPaywall] = useState<PaywallReason | null>(null);

  const onAdd = () => {
    const check = canAddGoal(data);
    if (!check.ok) {
      setPaywall(check.reason);
      return;
    }
    router.push("/add-goal");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]} testID="goals-screen">
      <ScreenHeader title={t("goals.title")} />
      {data.savingsGoals.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            testID="goals-empty"
            icon="flag-outline"
            title={t("goals.empty")}
            action={<Button testID="goals-empty-add" label={t("goals.addNew")} onPress={onAdd} />}
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {data.savingsGoals.map((g) => {
            const pct = g.targetAmount > 0 ? Math.min(1, g.currentAmount / g.targetAmount) : 0;
            return (
              <Pressable
                key={g.id}
                testID={`goal-row-${g.id}`}
                onLongPress={() => setConfirmDelete(g)}
                style={styles.card}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.flagWrap}>
                    <Ionicons name="flag" size={20} color={colors.brand.softBlue} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{g.name}</Text>
                    {g.dueDate ? (
                      <Text style={styles.meta}>
                        {t("goals.dueDate")} {formatDateShort(g.dueDate, data.settings.language)}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={styles.pct}>{Math.round(pct * 100)}%</Text>
                </View>
                <ProgressBar value={pct} color={colors.brand.softBlue} height={8} />
                <View style={styles.amounts}>
                  <Text style={styles.amountSaved}>
                    {formatMoney(g.currentAmount, data.settings.mainCurrency)}
                  </Text>
                  <Text style={styles.amountTarget}>
                    / {formatMoney(g.targetAmount, data.settings.mainCurrency)}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
      <View style={styles.footer}>
        <Button testID="goals-add-btn" label={t("goals.addNew")} onPress={onAdd} />
      </View>
      <ConfirmDialog
        visible={!!confirmDelete}
        title={confirmDelete ? `${t("common.delete")}: ${confirmDelete.name}?` : ""}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        destructive
        onCancel={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (confirmDelete) await deleteGoal(confirmDelete.id);
          setConfirmDelete(null);
        }}
      />
      <PaywallModal visible={!!paywall} reason={paywall} onClose={() => setPaywall(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.main },
  emptyWrap: { flex: 1, justifyContent: "center" },
  list: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  card: {
    padding: spacing.lg,
    backgroundColor: colors.background.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  flagWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand.softBlueLight,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    color: colors.text.primary,
    fontFamily: "Outfit_700Bold",
    fontWeight: "700",
  },
  meta: {
    fontSize: 12,
    color: colors.text.secondary,
    fontFamily: "DMSans_400Regular",
    marginTop: 2,
  },
  pct: {
    fontSize: 16,
    color: colors.brand.softBlue,
    fontFamily: "Outfit_700Bold",
    fontWeight: "700",
  },
  amounts: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.xs,
  },
  amountSaved: {
    fontSize: 18,
    color: colors.text.primary,
    fontFamily: "Outfit_700Bold",
    fontWeight: "700",
  },
  amountTarget: {
    fontSize: 14,
    color: colors.text.secondary,
    fontFamily: "DMSans_400Regular",
  },
  footer: { padding: spacing.lg },
});
