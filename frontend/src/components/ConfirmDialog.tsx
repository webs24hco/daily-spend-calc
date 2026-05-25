// Cross-platform confirmation dialog. Avoids relying on Alert for web preview.

import React from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { Button } from "@/src/components/Button";
import { colors, radii, spacing } from "@/src/constants";

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  testID?: string;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive,
  onConfirm,
  onCancel,
  testID,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View testID={testID ?? "confirm-dialog"} style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            <Button
              testID="confirm-dialog-cancel"
              label={cancelLabel}
              onPress={onCancel}
              variant="secondary"
            />
            <Button
              testID="confirm-dialog-confirm"
              label={confirmLabel}
              onPress={onConfirm}
              variant={destructive ? "danger" : "primary"}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(11, 25, 44, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.background.main,
    borderRadius: radii.lg,
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
    fontFamily: "Outfit_700Bold",
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    fontFamily: "DMSans_400Regular",
    lineHeight: 20,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
