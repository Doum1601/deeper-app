import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Animated, Easing, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ShieldCheck, ArrowRight } from "lucide-react-native";
import { useApp } from "@/src/contexts/AppContext";

const SPLASH_BG = "https://static.prod-images.emergentagent.com/jobs/ad5fdbd6-4f0a-4470-88fb-c778153c1f46/images/1074d30cc8c07e6ae5d4799eff2668d6f8c566f88cdc199365662db38ec9cc6a.png";

export default function Welcome() {
  const router = useRouter();
  const { colors, t, themeMode } = useApp();
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      Animated.timing(lift, { toValue: 0, duration: 600, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
    ]).start();
  }, [fade, lift]);

  return (
    <View testID="welcome-screen" style={{ flex: 1, backgroundColor: colors.baseBg }}>
      <ImageBackground source={{ uri: SPLASH_BG }} style={StyleSheet.absoluteFill} imageStyle={{ opacity: themeMode === "dark" ? 0.42 : 0.18 }} resizeMode="cover" />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: themeMode === "dark" ? "rgba(5,5,5,0.55)" : "rgba(250,250,250,0.65)" }]} />
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <Animated.View style={[styles.content, { opacity: fade, transform: [{ translateY: lift }] }]}>
          <View style={[styles.logoBox, { borderColor: colors.borderStrong, backgroundColor: colors.surface }]}>
            <ShieldCheck size={36} color={colors.accentPrimary} strokeWidth={1.5} />
          </View>
          <Text style={[styles.overline, { color: colors.accentPrimary }]}>ATOMOS · DEEPER CONTROL</Text>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{t("welcome_title")}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t("welcome_subtitle")}</Text>

          <TouchableOpacity
            testID="welcome-start-button"
            activeOpacity={0.85}
            onPress={() => router.push("/onboarding/scan")}
            style={[styles.cta, { backgroundColor: colors.accentPrimary }]}
          >
            <Text style={[styles.ctaText, { color: "#000" }]}>{t("welcome_cta")}</Text>
            <ArrowRight size={18} color="#000" strokeWidth={2.5} />
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: 24 },
  content: { flex: 1, justifyContent: "flex-end", paddingBottom: 56 },
  logoBox: { width: 72, height: 72, borderRadius: 18, borderWidth: 1, alignItems: "center", justifyContent: "center", marginBottom: 28 },
  overline: { fontSize: 11, fontWeight: "800", letterSpacing: 3, marginBottom: 12 },
  title: { fontSize: 42, fontWeight: "900", letterSpacing: -1, lineHeight: 46 },
  subtitle: { fontSize: 16, marginTop: 14, marginBottom: 40, lineHeight: 22 },
  cta: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 56, borderRadius: 14, gap: 10 },
  ctaText: { fontSize: 16, fontWeight: "800", letterSpacing: 0.3 },
});
