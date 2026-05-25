import React from "react";
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { colors, radii, spacing } from "@/src/constants";

interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  error?: string;
  hint?: string;
  containerStyle?: ViewStyle;
  testID?: string;
  prefix?: string;
  keyboardType?: KeyboardTypeOptions;
}

export function Input({
  label,
  error,
  hint,
  containerStyle,
  prefix,
  testID,
  ...props
}: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputWrapper,
          { borderColor: error ? colors.status.riskCoral : colors.border },
        ]}
      >
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput
          testID={testID}
          placeholderTextColor={colors.text.tertiary}
          style={styles.input}
          {...props}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {hint && !error ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    fontFamily: "DMSans_500Medium",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.main,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  prefix: {
    fontSize: 16,
    color: colors.text.secondary,
    marginRight: spacing.sm,
    fontFamily: "DMSans_500Medium",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    paddingVertical: spacing.md,
    fontFamily: "DMSans_400Regular",
  },
  error: {
    fontSize: 13,
    color: colors.status.riskCoral,
    fontFamily: "DMSans_400Regular",
  },
  hint: {
    fontSize: 13,
    color: colors.text.tertiary,
    fontFamily: "DMSans_400Regular",
  },
});
