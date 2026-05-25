import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { colors, radii, shadows, spacing } from "@/src/constants";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  padded?: boolean;
  testID?: string;
}

export function Card({ children, style, elevated = false, padded = true, testID }: CardProps) {
  return (
    <View
      testID={testID}
      style={[
        styles.card,
        padded && styles.padded,
        elevated && shadows.soft,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  padded: {
    padding: spacing.lg,
  },
});
