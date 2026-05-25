// Income list screen.

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/src/components/Button";
import { ConfirmDialog } from "@/src/components/ConfirmDialog";
import { EmptyState } from "@/src/components/EmptyState";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { colors, radii, spacing } from "@/src/constants";
import { useAppData, useT } from "@/src/store/AppDataContext";
import { Income } from "@/src/types";
import { formatDateShort } from "@/src/utils/dates";
import { formatMoney } from "@/src/utils/format";

export default function IncomeScreen() {
  const t = useT();
  const router = useRouter();
  const { data, deleteIncome } = useAppData();
  const [confirmDelete, setConfirmDelete] = useState<Income | null>(null);

  const sorted = [...data.incomes].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]} testID="income-screen">
      <ScreenHeader title={t("income.title")} />
      {sorted.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            testID="income-empty"
            icon="cash-outline"
            title={t("income.empty")}
            action={
              <Button
                testID="income-empty-add"
                label={t("income.addNew")}
                onPress={() => router.push("/add-income")}
              />
            }
          />
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              testID={`income-row-${item.id}`}
              onLongPress={() => setConfirmDelete(item)}
              style={styles.row}
            >
              <View style={styles.iconWrap}>
                <Ionicons name="cash" size={20} color={colors.status.safeGreen} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>
                  {item.isRecurring ? t("income.recurring") : t("income.oneTime")} ·{" "}
                  {formatDateShort(item.date, data.settings.language)}
                </Text>
              </View>
              <Text style={styles.amount}>
                +{formatMoney(item.amount, data.settings.mainCurrency)}
              </Text>
            </Pressable>
          )}
        />
      )}
      <View style={styles.footer}>
        <Button
          testID="income-add-btn"
          label={t("income.addNew")}
          onPress={() => router.push("/add-income")}
        />
      </View>
      <ConfirmDialog
        visible={!!confirmDelete}
        title={confirmDelete ? `${t("common.delete")}: ${confirmDelete.name}?` : ""}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        destructive
        onCancel={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (confirmDelete) await deleteIncome(confirmDelete.id);
          setConfirmDelete(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.main },
  emptyWrap: { flex: 1, justifyContent: "center" },
  list: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.status.safeGreenBg,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 15,
    color: colors.text.primary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
  },
  meta: {
    fontSize: 12,
    color: colors.text.secondary,
    fontFamily: "DMSans_400Regular",
    marginTop: 2,
  },
  amount: {
    fontSize: 15,
    color: colors.status.safeGreen,
    fontFamily: "DMSans_700Bold",
    fontWeight: "700",
  },
  footer: { padding: spacing.lg },
});
