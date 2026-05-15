import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as LocalAuthentication from "expo-local-authentication";
import { Fingerprint, Delete, Lock as LockIcon, X } from "lucide-react-native";
import { useApp } from "@/src/contexts/AppContext";

export default function Lock() {
  const router = useRouter();
  const params = useLocalSearchParams<{ setup?: string }>();
  const { colors, t, pin, setPin, biometricEnabled, setBiometricEnabled, setAppLocked } = useApp();
  const setupMode = params.setup === "1" || !pin;
  const [entered, setEntered] = useState("");
  const [stage, setStage] = useState<"enter" | "confirm">("enter"); // setup: enter -> confirm
  const [firstPin, setFirstPin] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!setupMode && biometricEnabled) tryBiometric();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tryBiometric = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !enrolled) return;
      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: t("lock_use_bio"),
        disableDeviceFallback: false,
        cancelLabel: t("cancel"),
      });
      if (res.success) {
        setAppLocked(false);
        router.replace("/(tabs)/dashboard");
      }
    } catch {
      // ignore
    }
  };

  const onPress = (digit: string) => {
    setError(null);
    if (entered.length >= 4) return;
    const next = entered + digit;
    setEntered(next);
    if (next.length === 4) {
      setTimeout(() => handleComplete(next), 120);
    }
  };

  const onDelete = () => { setError(null); setEntered((s) => s.slice(0, -1)); };

  const handleComplete = async (code: string) => {
    if (setupMode) {
      if (stage === "enter") {
        setFirstPin(code);
        setEntered("");
        setStage("confirm");
      } else {
        if (code === firstPin) {
          await setPin(code);
          // Offer biometric on first setup if available
          const hasHardware = await LocalAuthentication.hasHardwareAsync();
          const enrolled = await LocalAuthentication.isEnrolledAsync();
          if (hasHardware && enrolled) setBiometricEnabled(true);
          setAppLocked(false);
          router.replace("/(tabs)/dashboard");
        } else {
          setError(t("lock_pin_mismatch"));
          setEntered("");
          setStage("enter");
          setFirstPin("");
        }
      }
    } else {
      if (code === pin) {
        setAppLocked(false);
        router.replace("/(tabs)/dashboard");
      } else {
        setError(t("lock_pin_wrong"));
        setEntered("");
      }
    }
  };

  const subtitle = setupMode
    ? (stage === "enter" ? t("lock_set_pin_sub") : t("lock_confirm_pin"))
    : t("lock_subtitle");
  const title = setupMode ? t("lock_set_pin") : t("lock_title");

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.baseBg }]} edges={["top", "bottom"]}>
      <View style={styles.head}>
        <View style={[styles.iconBox, { borderColor: colors.borderStrong, backgroundColor: colors.surface }]}>
          <LockIcon size={26} color={colors.accentPrimary} strokeWidth={1.5} />
        </View>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>{subtitle}</Text>

        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map(i => (
            <View
              key={i}
              testID={`lock-dot-${i}`}
              style={[
                styles.dot,
                {
                  backgroundColor: entered.length > i ? colors.accentPrimary : "transparent",
                  borderColor: error ? colors.statusError : (entered.length > i ? colors.accentPrimary : colors.borderStrong),
                },
              ]}
            />
          ))}
        </View>
        {error && <Text style={[styles.errorText, { color: colors.statusError }]}>{error}</Text>}
      </View>

      <View style={styles.padWrap}>
        <View style={styles.pad}>
          {["1","2","3","4","5","6","7","8","9"].map(d => (
            <TouchableOpacity
              key={d}
              testID={`lock-key-${d}`}
              activeOpacity={0.7}
              onPress={() => onPress(d)}
              style={[styles.key, { borderColor: colors.border, backgroundColor: colors.surface }]}
            >
              <Text style={[styles.keyText, { color: colors.textPrimary }]}>{d}</Text>
            </TouchableOpacity>
          ))}
          {!setupMode && biometricEnabled ? (
            <TouchableOpacity
              testID="lock-bio-button"
              activeOpacity={0.7}
              onPress={tryBiometric}
              style={[styles.key, { borderColor: colors.border, backgroundColor: colors.surface }]}
            >
              <Fingerprint size={26} color={colors.accentPrimary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.key} />
          )}
          <TouchableOpacity
            testID="lock-key-0"
            activeOpacity={0.7}
            onPress={() => onPress("0")}
            style={[styles.key, { borderColor: colors.border, backgroundColor: colors.surface }]}
          >
            <Text style={[styles.keyText, { color: colors.textPrimary }]}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="lock-key-del"
            activeOpacity={0.7}
            onPress={onDelete}
            style={styles.key}
          >
            <Delete size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
        {setupMode && (
          <TouchableOpacity
            testID="lock-skip-setup"
            activeOpacity={0.7}
            onPress={() => { setAppLocked(false); router.replace("/(tabs)/dashboard"); }}
            style={styles.skipBtn}
          >
            <X size={14} color={colors.textSecondary} />
            <Text style={[styles.skipText, { color: colors.textSecondary }]}>Plus tard</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: 24 },
  head: { alignItems: "center", paddingTop: 48 },
  iconBox: { width: 56, height: 56, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  title: { fontSize: 26, fontWeight: "900", letterSpacing: -0.5 },
  sub: { fontSize: 14, marginTop: 8, textAlign: "center" },
  dotsRow: { flexDirection: "row", gap: 18, marginTop: 32 },
  dot: { width: 16, height: 16, borderRadius: 100, borderWidth: 2 },
  errorText: { fontSize: 13, marginTop: 14, fontWeight: "700" },
  padWrap: { flex: 1, justifyContent: "flex-end", paddingBottom: Platform.OS === "ios" ? 24 : 36 },
  pad: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 14 },
  key: { width: "30%", aspectRatio: 1.4, borderRadius: 16, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  keyText: { fontSize: 28, fontWeight: "600", fontFamily: "monospace" },
  skipBtn: { flexDirection: "row", alignSelf: "center", alignItems: "center", gap: 6, marginTop: 18, padding: 8 },
  skipText: { fontSize: 13, fontWeight: "600" },
});
