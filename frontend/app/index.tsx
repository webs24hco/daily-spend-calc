// Entry router: decides where to send the user based on persisted state.
//   - First time → /onboarding
//   - Onboarded but not set up → /setup
//   - Otherwise → /(tabs)

import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { colors } from "@/src/constants";
import { useAppData } from "@/src/store/AppDataContext";

export default function Index() {
  const { data, loaded } = useAppData();

  if (!loaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand.primary} />
      </View>
    );
  }

  if (!data.settings.onboardingCompleted) {
    return <Redirect href="/onboarding" />;
  }
  if (!data.settings.setupCompleted) {
    return <Redirect href="/setup" />;
  }
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.main,
  },
});
