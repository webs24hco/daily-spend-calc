import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { EXPENSE_CATEGORIES, radii } from "@/src/constants";
import { ExpenseCategory } from "@/src/types";

interface CategoryIconProps {
  category: ExpenseCategory;
  size?: number;
}

export function CategoryIcon({ category, size = 44 }: CategoryIconProps) {
  const cfg = EXPENSE_CATEGORIES[category];
  return (
    <View
      style={[
        styles.box,
        { width: size, height: size, borderRadius: size / 3, backgroundColor: cfg.bg },
      ]}
    >
      <Ionicons name={cfg.iconName as keyof typeof Ionicons.glyphMap} size={size / 2} color={cfg.color} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
  },
});
