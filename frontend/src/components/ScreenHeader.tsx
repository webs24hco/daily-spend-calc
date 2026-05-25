import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/src/constants";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showBack?: boolean;
  right?: React.ReactNode;
  testID?: string;
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  showBack = true,
  right,
  testID,
}: ScreenHeaderProps) {
  const router = useRouter();
  const handleBack = () => {
    if (onBack) onBack();
    else if (router.canGoBack()) router.back();
  };
  return (
    <View testID={testID} style={styles.container}>
      <View style={styles.row}>
        {showBack ? (
          <Pressable
            testID="screen-header-back"
            onPress={handleBack}
            hitSlop={12}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </Pressable>
        ) : (
          <View style={styles.backBtn} />
        )}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.right}>{right}</View>
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: colors.background.card,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
    fontFamily: "Outfit_700Bold",
    textAlign: "center",
  },
  right: {
    minWidth: 40,
    alignItems: "flex-end",
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    fontFamily: "DMSans_400Regular",
  },
});
