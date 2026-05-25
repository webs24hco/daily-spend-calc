// Expenses tab — list, filter, delete, add.

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CategoryIcon } from "@/src/components/CategoryIcon";
import { ConfirmDialog } from "@/src/components/ConfirmDialog";
import { EmptyState } from "@/src/components/EmptyState";
import { PaywallModal } from "@/src/components/PaywallModal";
import { EXPENSE_CATEGORIES, colors, radii, spacing } from "@/src/constants";
import { useAppData, useT } from "@/src/store/AppDataContext";
import { Expense, ExpenseCategory } from "@/src/types";
import { getCycleSpending } from "@/src/utils/calculations";
import { formatDateShort } from "@/src/utils/dates";
import { formatMoney } from "@/src/utils/format";
import { PaywallReason, canAddExpense } from "@/src/utils/plan-limits";

export default function ExpensesTab() {
  const t = useT();
  const router = useRouter();
  const { data, deleteExpense } = useAppData();
  const [filter, setFilter] = useState<"all" | ExpenseCategory>("all");
  const [confirmDelete, setConfirmDelete] = useState<Expense | null>(null);
  const [paywall, setPaywall] = useState<PaywallReason | null>(null);

  const filtered = useMemo(() => {
    const list = filter === "all" ? data.expenses : data.expenses.filter((e) => e.category === filter);
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [data.expenses, filter]);

  const spentCycle = getCycleSpending(data);

  const onAdd = () => {
    const check = canAddExpense(data);
    if (!check.ok) {
      setPaywall(check.reason);
      return;
    }
    router.push("/add-expense");
  };

  const categoryFilters: Array<{ key: "all" | ExpenseCategory; label: string }> = [
    { key: "all", label: t("expenses.filterAll") },
    ...((Object.keys(EXPENSE_CATEGORIES) as ExpenseCategory[]).map((c) => ({
      key: c,
      label: t(`category.${c}`),
    }))),
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]} testID="expenses-screen">
      <View style={styles.header}>
        <Text style={styles.title}>{t("expenses.title")}</Text>
        <Pressable
          testID="expenses-add-btn"
          onPress={onAdd}
          style={styles.addBtn}
          hitSlop={8}
        >
          <Ionicons name="add" size={22} color={colors.text.inverse} />
        </Pressable>
      </View>

      <View style={styles.totalsCard}>
        <Text style={styles.totalsLabel}>{t("expenses.totalCycle")}</Text>
        <Text style={styles.totalsValue}>{formatMoney(spentCycle, data.settings.mainCurrency)}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
        contentContainerStyle={styles.filtersContent}
      >
        {categoryFilters.map((f) => {
          const active = filter === f.key;
          return (
            <Pressable
              key={f.key}
              testID={`expenses-filter-${f.key}`}
              onPress={() => setFilter(f.key)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {filtered.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            testID="expenses-empty"
            icon="receipt-outline"
            title={t("expenses.empty")}
            subtitle={t("expenses.emptySubtitle")}
          />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              testID={`expense-row-${item.id}`}
              onLongPress={() => setConfirmDelete(item)}
              style={styles.row}
            >
              <CategoryIcon category={item.category} size={44} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.rowMeta}>
                  {t(`category.${item.category}`)} · {formatDateShort(item.date, data.settings.language)}
                </Text>
              </View>
              <Text style={styles.rowAmount}>
                -{formatMoney(item.amount, data.settings.mainCurrency)}
              </Text>
            </Pressable>
          )}
        />
      )}

      <ConfirmDialog
        visible={!!confirmDelete}
        title={t("expenses.deleteConfirm")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        destructive
        onCancel={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (confirmDelete) await deleteExpense(confirmDelete.id);
          setConfirmDelete(null);
        }}
      />
      <PaywallModal visible={!!paywall} reason={paywall} onClose={() => setPaywall(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.main },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 26,
    color: colors.text.primary,
    fontFamily: "Outfit_700Bold",
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  totalsCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.brand.softBlueLight,
    borderRadius: radii.lg,
    gap: spacing.xs,
  },
  totalsLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  totalsValue: {
    fontSize: 32,
    color: colors.text.primary,
    fontFamily: "Outfit_700Bold",
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  filters: { marginTop: spacing.md, marginBottom: spacing.sm, maxHeight: 44 },
  filtersContent: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  chipText: {
    fontSize: 13,
    color: colors.text.primary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
  },
  chipTextActive: { color: colors.text.inverse },
  emptyWrap: { flex: 1, justifyContent: "center" },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.sm },
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
  rowName: {
    fontSize: 15,
    color: colors.text.primary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
  },
  rowMeta: {
    fontSize: 12,
    color: colors.text.secondary,
    fontFamily: "DMSans_400Regular",
    marginTop: 2,
  },
  rowAmount: {
    fontSize: 15,
    color: colors.status.riskCoral,
    fontFamily: "DMSans_700Bold",
    fontWeight: "700",
  },
});
