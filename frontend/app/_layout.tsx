import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold, useFonts as useDMFonts } from "@expo-google-fonts/dm-sans";
import { Outfit_400Regular, Outfit_600SemiBold, Outfit_700Bold, useFonts as useOutfitFonts } from "@expo-google-fonts/outfit";
import { useIconFonts } from "@/src/hooks/use-icon-fonts";
import { AppDataProvider } from "@/src/store/AppDataContext";

// Keep the native splash visible from cold start until icon fonts register.
// Required because @expo/vector-icons' componentDidMount fallback fires
// Font.loadAsync against a broken vendor path if any <Icon> mounts before
// the family is registered — which throws on Android Expo Go.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [iconsLoaded, iconsError] = useIconFonts();
  const [outfitLoaded] = useOutfitFonts({
    Outfit_400Regular,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });
  const [dmLoaded] = useDMFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  const ready = (iconsLoaded || iconsError) && outfitLoaded && dmLoaded;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  // If the CDN is unreachable we fall through on error rather than wedging
  // the app — icons will tofu, but the app still boots.
  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <AppDataProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#FFFFFF" } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="setup" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="can-i-buy" options={{ presentation: "modal" }} />
          <Stack.Screen name="add-expense" options={{ presentation: "modal" }} />
          <Stack.Screen name="add-income" options={{ presentation: "modal" }} />
          <Stack.Screen name="add-bill" options={{ presentation: "modal" }} />
          <Stack.Screen name="add-envelope" options={{ presentation: "modal" }} />
          <Stack.Screen name="add-goal" options={{ presentation: "modal" }} />
          <Stack.Screen name="income" />
          <Stack.Screen name="bills" />
          <Stack.Screen name="goals" />
          <Stack.Screen name="reports" />
          <Stack.Screen name="settings" />
        </Stack>
      </AppDataProvider>
    </SafeAreaProvider>
  );
}
