import React from "react";
import { StyleSheet, View } from "react-native";
import { colors, radii } from "@/src/constants";

interface ProgressBarProps {
  value: number; // 0..1
  color?: string;
  trackColor?: string;
  height?: number;
  testID?: string;
}

export function ProgressBar({
  value,
  color = colors.brand.softBlue,
  trackColor = colors.border,
  height = 8,
  testID,
}: ProgressBarProps) {
  const pct = Math.min(1, Math.max(0, value));
  return (
    <View
      testID={testID}
      style={[styles.track, { height, backgroundColor: trackColor, borderRadius: height / 2 }]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${pct * 100}%`,
            height,
            backgroundColor: color,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    overflow: "hidden",
    borderRadius: radii.pill,
  },
  fill: {
    height: "100%",
  },
});
