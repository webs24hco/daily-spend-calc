import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { colors, radii, spacing } from "@/src/constants";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "lg" | "md" | "sm";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
  testID?: string;
  leftIcon?: React.ReactNode;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "lg",
  disabled,
  loading,
  style,
  fullWidth = true,
  testID,
  leftIcon,
}: ButtonProps) {
  const isPrimary = variant === "primary";
  const isSecondary = variant === "secondary";
  const isGhost = variant === "ghost";
  const isDanger = variant === "danger";

  const heightMap = { lg: 56, md: 48, sm: 40 };
  const fontMap = { lg: 16, md: 15, sm: 14 };

  const bg = isPrimary
    ? colors.brand.primary
    : isSecondary
      ? colors.background.card
      : isDanger
        ? colors.status.riskCoralBg
        : "transparent";

  const textColor = isPrimary
    ? colors.text.inverse
    : isDanger
      ? colors.status.riskCoral
      : colors.text.primary;

  const borderColor = isSecondary ? colors.border : "transparent";

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bg,
          borderColor,
          borderWidth: isSecondary ? 1 : 0,
          height: heightMap[size],
          width: fullWidth ? "100%" : undefined,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
        },
        isGhost && styles.ghostButton,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.buttonContent}>
          {leftIcon}
          <Text style={[styles.buttonLabel, { color: textColor, fontSize: fontMap[size] }]}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  ghostButton: {
    backgroundColor: "transparent",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  buttonLabel: {
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
  },
});
