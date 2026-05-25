// Bills (recurring payments) list screen.

import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/src/components/Button";
import { CategoryIcon } from "@/src/components/CategoryIcon";
import { ConfirmDialog } from "@/src/components/ConfirmDialog";
import { EmptyState } from "@/src/components/EmptyState";
import { PaywallModal } from "@/src/components/PaywallModal";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { colors, radii, spacing } from "@/src/constants";
import { useAppData, useT } from "@/src/store/AppDataContext";
import { RecurringPayment } from "@/src/types";
import { formatDateShort } from "@/src/utils/dates";
import { formatMoney } from "@/src/utils/format";
import { PaywallReason, canAddBill } from "@/src/utils/plan-limits";

export default function BillsScreen() {
  const t = useT();
  const router = useRouter();
  const { data, deleteRecurringPayment } = useAppData();
  const [confirmDelete, setConfirmDelete] = useState<RecurringPayment | null>(null);
  const [paywall, setPaywall] = useState<PaywallReason | null>(null);

  const sorted = [...data.recurringPayments].sort((a, b) => a.nextDate.localeCompare(b.nextDate));

  const onAdd = () => {
    const check = canAddBill(data);
    if (!check.ok) {
      setPaywall(check.reason);
      return;
    }
    router.push("/add-bill");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]} testID="bills-screen">
      <ScreenHeader title={t("bills.title")} />
      {sorted.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            testID="bills-empty"
            icon="document-text-outline"
            title={t("bills.empty")}
            action={<Button testID="bills-empty-add" label={t("bills.addNew")} onPress={onAdd} />}
          />
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              testID={`bill-row-${item.id}`}
              onLongPress={() => setConfirmDelete(item)}
              style={styles.row}
            >
              <CategoryIcon category={item.category} size={44} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>
                  {t("bills.nextDate")}: {formatDateShort(item.nextDate, data.settings.language)} · {t(`frequency.${item.frequency}`)}
                </Text>
              </View>
              <Text style={styles.amount}>
                -{formatMoney(item.amount, data.settings.mainCurrency)}
              </Text>
            </Pressable>
          )}
        />
      )}
      <View style={styles.footer}>
        <Button testID="bills-add-btn" label={t("bills.addNew")} onPress={onAdd} />
      </View>
      <ConfirmDialog
        visible={!!confirmDelete}
        title={confirmDelete ? `${t("common.delete")}: ${confirmDelete.name}?` : ""}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        destructive
        onCancel={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (confirmDelete) await deleteRecurringPayment(confirmDelete.id);
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
    color: colors.status.riskCoral,
    fontFamily: "DMSans_700Bold",
    fontWeight: "700",
  },
  footer: { padding: spacing.lg },
});
