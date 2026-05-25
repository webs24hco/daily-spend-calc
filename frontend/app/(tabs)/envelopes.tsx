// Envelopes tab — colorful budget cards.

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ConfirmDialog } from "@/src/components/ConfirmDialog";
import { EmptyState } from "@/src/components/EmptyState";
import { PaywallModal } from "@/src/components/PaywallModal";
import { Button } from "@/src/components/Button";
import { colors, radii, spacing } from "@/src/constants";
import { useAppData, useT } from "@/src/store/AppDataContext";
import { Envelope } from "@/src/types";
import { calculateEnvelopesReserved } from "@/src/utils/calculations";
import { formatMoney } from "@/src/utils/format";
import { PaywallReason, canAddEnvelope } from "@/src/utils/plan-limits";

export default function EnvelopesTab() {
  const t = useT();
  const router = useRouter();
  const { data, deleteEnvelope } = useAppData();
  const [paywall, setPaywall] = useState<PaywallReason | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Envelope | null>(null);

  const onAdd = () => {
    const check = canAddEnvelope(data);
    if (!check.ok) {
      setPaywall(check.reason);
      return;
    }
    router.push("/add-envelope");
  };

  const totalReserved = calculateEnvelopesReserved(data.envelopes);

  return (
    <SafeAreaView style={styles.container} edges={["top"]} testID="envelopes-screen">
      <View style={styles.header}>
        <Text style={styles.title}>{t("envelopes.title")}</Text>
        <Pressable
          testID="envelopes-add-btn"
          onPress={onAdd}
          style={styles.addBtn}
          hitSlop={8}
        >
          <Ionicons name="add" size={22} color={colors.text.inverse} />
        </Pressable>
      </View>

      <View style={styles.totalsCard}>
        <Text style={styles.totalsLabel}>{t("envelopes.totalReserved")}</Text>
        <Text style={styles.totalsValue}>{formatMoney(totalReserved, data.settings.mainCurrency)}</Text>
      </View>

      {data.envelopes.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            testID="envelopes-empty"
            icon="mail-outline"
            title={t("envelopes.empty")}
            subtitle={t("envelopes.emptySubtitle")}
            action={<Button testID="envelopes-empty-add" label={t("envelopes.addNew")} onPress={onAdd} />}
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.grid}>
          {data.envelopes.map((env) => (
            <Pressable
              key={env.id}
              testID={`envelope-card-${env.id}`}
              onLongPress={() => setConfirmDelete(env)}
              style={[styles.card, { backgroundColor: env.color }]}
            >
              <Ionicons name="mail" size={24} color={colors.text.primary} />
              <Text style={styles.cardName} numberOfLines={1}>
                {env.name}
              </Text>
              <Text style={styles.cardAmount}>
                {formatMoney(env.amountReserved, data.settings.mainCurrency)}
              </Text>
              <Text style={styles.cardSubLabel}>{t("envelopes.reserved")}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <ConfirmDialog
        visible={!!confirmDelete}
        title={confirmDelete ? `${t("common.delete")}: ${confirmDelete.name}?` : ""}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        destructive
        onCancel={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (confirmDelete) await deleteEnvelope(confirmDelete.id);
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
    fontSize: 28,
    color: colors.text.primary,
    fontFamily: "Outfit_700Bold",
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  emptyWrap: { flex: 1, justifyContent: "center" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    width: "47%",
    aspectRatio: 1,
    borderRadius: radii.lg,
    padding: spacing.lg,
    justifyContent: "space-between",
  },
  cardName: {
    fontSize: 16,
    color: colors.text.primary,
    fontFamily: "Outfit_700Bold",
    fontWeight: "700",
  },
  cardAmount: {
    fontSize: 22,
    color: colors.text.primary,
    fontFamily: "Outfit_700Bold",
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  cardSubLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
