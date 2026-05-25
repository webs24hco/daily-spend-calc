// Settings — language, currency, mock premium, reset, etc.

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/src/components/Button";
import { ConfirmDialog } from "@/src/components/ConfirmDialog";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { CURRENCIES, colors, radii, spacing } from "@/src/constants";
import { useAppData, useT } from "@/src/store/AppDataContext";
import { Currency, Language, PremiumPlan } from "@/src/types";

export default function SettingsScreen() {
  const t = useT();
  const router = useRouter();
  const { data, updateSettings, setLanguage, setMockPremium, resetAll } = useAppData();
  const [showReset, setShowReset] = useState(false);
  const [showCurrency, setShowCurrency] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);

  const currentPlan: PremiumPlan = data.premium.mockActive ? data.premium.plan : "free";

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]} testID="settings-screen">
      <ScreenHeader title={t("settings.title")} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Premium quick toggles */}
        <Section title={t("settings.mockPremium")}>
          <View style={styles.planRow}>
            {(["free", "pro", "plus"] as PremiumPlan[]).map((p) => (
              <Pressable
                key={p}
                testID={`settings-plan-${p}`}
                onPress={() => setMockPremium(p, p !== "free")}
                style={[styles.planBtn, currentPlan === p && styles.planBtnActive]}
              >
                <Text
                  style={[styles.planText, currentPlan === p && styles.planTextActive]}
                >
                  {t(`premium.${p}`)}
                </Text>
              </Pressable>
            ))}
          </View>
        </Section>

        {/* Preferences */}
        <Section title={t("settings.section.preferences")}>
          <Row
            testID="settings-language-row"
            icon="language"
            label={t("settings.language")}
            value={t(`language.${data.settings.language}`)}
            onPress={() => setShowLanguage((v) => !v)}
          />
          {showLanguage ? (
            <View style={styles.subList}>
              {(["es", "en"] as Language[]).map((lang) => (
                <Pressable
                  key={lang}
                  testID={`settings-language-${lang}`}
                  onPress={async () => {
                    await setLanguage(lang);
                    setShowLanguage(false);
                  }}
                  style={[
                    styles.subRow,
                    data.settings.language === lang && styles.subRowActive,
                  ]}
                >
                  <Text style={styles.subRowText}>{t(`language.${lang}`)}</Text>
                  {data.settings.language === lang ? (
                    <Ionicons name="checkmark" size={20} color={colors.brand.softBlue} />
                  ) : null}
                </Pressable>
              ))}
            </View>
          ) : null}

          <Row
            testID="settings-currency-row"
            icon="cash"
            label={t("settings.currency")}
            value={data.settings.mainCurrency}
            onPress={() => setShowCurrency((v) => !v)}
          />
          {showCurrency ? (
            <View style={styles.subList}>
              {CURRENCIES.map((c) => (
                <Pressable
                  key={c.code}
                  testID={`settings-currency-${c.code}`}
                  onPress={async () => {
                    await updateSettings({ mainCurrency: c.code as Currency });
                    setShowCurrency(false);
                  }}
                  style={[
                    styles.subRow,
                    data.settings.mainCurrency === c.code && styles.subRowActive,
                  ]}
                >
                  <Text style={styles.subRowText}>
                    {c.symbol} · {c.code} · {c.name}
                  </Text>
                  {data.settings.mainCurrency === c.code ? (
                    <Ionicons name="checkmark" size={20} color={colors.brand.softBlue} />
                  ) : null}
                </Pressable>
              ))}
            </View>
          ) : null}
        </Section>

        {/* Account / lists */}
        <Section title={t("settings.section.account")}>
          <Row
            testID="settings-income-row"
            icon="cash-outline"
            label={t("income.title")}
            onPress={() => router.push("/income")}
          />
          <Row
            testID="settings-bills-row"
            icon="document-text-outline"
            label={t("bills.title")}
            onPress={() => router.push("/bills")}
          />
          <Row
            testID="settings-goals-row"
            icon="flag-outline"
            label={t("goals.title")}
            onPress={() => router.push("/goals")}
          />
          <Row
            testID="settings-reports-row"
            icon="bar-chart-outline"
            label={t("reports.title")}
            onPress={() => router.push("/reports")}
          />
        </Section>

        {/* Data */}
        <Section title={t("settings.section.data")}>
          <Row
            testID="settings-export-row"
            icon="download-outline"
            label={t("settings.export")}
            value={t("settings.comingSoon")}
            disabled
          />
          <Row
            testID="settings-backup-row"
            icon="cloud-upload-outline"
            label={t("settings.backup")}
            value={t("settings.comingSoon")}
            disabled
          />
        </Section>

        {/* Legal */}
        <Section title={t("settings.section.legal")}>
          <Row testID="settings-terms-row" icon="document-outline" label={t("settings.terms")} disabled value={t("settings.comingSoon")} />
          <Row testID="settings-privacy-row" icon="shield-outline" label={t("settings.privacy")} disabled value={t("settings.comingSoon")} />
        </Section>

        {/* Danger zone */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.md }}>
          <Button
            testID="settings-reset-btn"
            label={t("settings.reset")}
            variant="danger"
            onPress={() => setShowReset(true)}
          />
        </View>

        <Text style={styles.version}>{t("settings.version")} 1.0.0 · Queda</Text>
      </ScrollView>

      <ConfirmDialog
        visible={showReset}
        title={t("settings.reset")}
        message={t("settings.resetConfirm")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        destructive
        onCancel={() => setShowReset(false)}
        onConfirm={async () => {
          await resetAll();
          setShowReset(false);
          router.replace("/");
        }}
      />
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Row({
  icon,
  label,
  value,
  onPress,
  disabled,
  testID,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  disabled?: boolean;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled || !onPress}
      style={({ pressed }) => [
        styles.row,
        { opacity: disabled ? 0.6 : pressed ? 0.8 : 1 },
      ]}
    >
      <Ionicons name={icon} size={20} color={colors.text.primary} />
      <Text style={styles.rowLabel}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {onPress && !disabled ? (
        <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.main },
  scroll: { paddingVertical: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },
  section: { gap: spacing.sm },
  sectionTitle: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: spacing.lg,
  },
  sectionBody: { gap: 1, backgroundColor: colors.background.card },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background.main,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
  },
  rowValue: {
    fontSize: 13,
    color: colors.text.secondary,
    fontFamily: "DMSans_400Regular",
  },
  subList: {
    backgroundColor: colors.background.envelopeSurface,
  },
  subRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  subRowActive: { backgroundColor: colors.brand.softBlueLight },
  subRowText: {
    fontSize: 14,
    color: colors.text.primary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
  },
  planRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.main,
  },
  planBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background.card,
    alignItems: "center",
  },
  planBtnActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  planText: {
    fontSize: 14,
    color: colors.text.primary,
    fontFamily: "DMSans_700Bold",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  planTextActive: { color: colors.text.inverse },
  version: {
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: "center",
    fontFamily: "DMSans_400Regular",
    paddingTop: spacing.md,
  },
});
