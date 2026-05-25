// Onboarding — 3 screens with paging. Default Spanish.

import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/src/components/Button";
import { colors, radii, spacing } from "@/src/constants";
import { useAppData, useT } from "@/src/store/AppDataContext";

const ILLUS = {
  s1: "https://static.prod-images.emergentagent.com/jobs/26770b53-a40a-4517-8bf7-8b9fad38fed9/images/1f9a470d93faf064cc2335806f83fb9370e3f8d29a920374694ad9c667a76ba2.png",
  s2: "https://static.prod-images.emergentagent.com/jobs/26770b53-a40a-4517-8bf7-8b9fad38fed9/images/5f5b5770533751f63788b72e07f9073aaf275e3c567f4e901dc5d2e936b96216.png",
  s3: "https://static.prod-images.emergentagent.com/jobs/26770b53-a40a-4517-8bf7-8b9fad38fed9/images/fcdbb30b97599d2a1ecf54a21c83a500e5e1b02a58e4c5a67e076f4097fbe0f4.png",
};

export default function Onboarding() {
  const t = useT();
  const router = useRouter();
  const { updateSettings } = useAppData();
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const { width } = Dimensions.get("window");

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newPage = Math.round(e.nativeEvent.contentOffset.x / width);
    if (newPage !== page) setPage(newPage);
  };

  const slides = [
    { key: "1", img: ILLUS.s1, title: t("onboarding.1.title"), text: t("onboarding.1.text") },
    { key: "2", img: ILLUS.s2, title: t("onboarding.2.title"), text: t("onboarding.2.text") },
    { key: "3", img: ILLUS.s3, title: t("onboarding.3.title"), text: t("onboarding.3.text") },
  ];

  const goNext = async () => {
    if (page < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: width * (page + 1), animated: true });
      setPage(page + 1);
    } else {
      await updateSettings({ onboardingCompleted: true });
      router.replace("/setup");
    }
  };

  const goSkip = async () => {
    await updateSettings({ onboardingCompleted: true });
    router.replace("/setup");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]} testID="onboarding-screen">
      <View style={styles.skipRow}>
        <Pressable testID="onboarding-skip-btn" onPress={goSkip} hitSlop={12}>
          <Text style={styles.skip}>{t("common.skip")}</Text>
        </Pressable>
      </View>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.scroll}
      >
        {slides.map((s) => (
          <View key={s.key} style={[styles.slide, { width }]}>
            <View style={styles.imageWrap}>
              <Image source={{ uri: s.img }} style={styles.image} contentFit="contain" />
            </View>
            <View style={styles.copyWrap}>
              <Text style={styles.title} testID={`onboarding-title-${s.key}`}>
                {s.title}
              </Text>
              <Text style={styles.text}>{s.text}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === page && styles.dotActive,
              ]}
            />
          ))}
        </View>
        <Button
          testID="onboarding-next-btn"
          label={page === slides.length - 1 ? t("onboarding.cta") : t("common.continue")}
          onPress={goNext}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.main },
  skipRow: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    alignItems: "flex-end",
  },
  skip: {
    fontSize: 14,
    color: colors.text.secondary,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
  },
  scroll: { flex: 1 },
  slide: { flex: 1, paddingHorizontal: spacing.lg, justifyContent: "center" },
  imageWrap: {
    aspectRatio: 1,
    width: "100%",
    maxHeight: 320,
    alignSelf: "center",
    marginBottom: spacing.xl,
  },
  image: { width: "100%", height: "100%" },
  copyWrap: { gap: spacing.md, alignItems: "center", paddingHorizontal: spacing.md },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.text.primary,
    fontFamily: "Outfit_700Bold",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  text: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    fontFamily: "DMSans_400Regular",
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  dots: {
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.brand.primary,
  },
});
