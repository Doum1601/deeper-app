import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useApp } from "@/src/contexts/AppContext";

export default function Index() {
  const router = useRouter();
  const { hydrated, authed, appLocked, colors } = useApp();

  useEffect(() => {
    if (!hydrated) return;
    if (!authed) {
      router.replace("/onboarding/welcome");
    } else if (appLocked) {
      router.replace("/lock");
    } else {
      router.replace("/(tabs)/dashboard");
    }
  }, [hydrated, authed, appLocked, router]);

  return (
    <View testID="splash-loader" style={[styles.container, { backgroundColor: colors.baseBg }]}>
      <ActivityIndicator size="large" color={colors.accentPrimary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
});
