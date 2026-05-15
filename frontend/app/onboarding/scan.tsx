import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Animated, Easing, Keyboard } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Wifi, Radar, ArrowRight, ChevronLeft, AlertTriangle, CheckCircle2 } from "lucide-react-native";
import { useApp } from "@/src/contexts/AppContext";
import { pingDeeper } from "@/src/api/deeper";

export default function Scan() {
  const router = useRouter();
  const { colors, t, setDeeperIp, setDemoMode } = useApp();
  const [scanning, setScanning] = useState(true);
  const [found, setFound] = useState<string | null>(null);
  const [manualIp, setManualIp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
        Animated.timing(pulse, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setScanning(true);
      setError(null);
      const candidates = ["34.34.34.34", "192.168.0.1", "192.168.1.1"];
      for (const ip of candidates) {
        const ok = await pingDeeper(ip, 1200);
        if (cancelled) return;
        if (ok) { setFound(ip); setScanning(false); return; }
      }
      if (!cancelled) {
        setScanning(false);
        setError("not_found");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const connectWithIp = (ip: string, demo: boolean) => {
    setDeeperIp(ip);
    setDemoMode(demo);
    router.push("/onboarding/login");
  };

  const onManualConnect = async () => {
    Keyboard.dismiss();
    if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(manualIp.trim())) {
      setError("invalid_ip");
      return;
    }
    setScanning(true);
    const ok = await pingDeeper(manualIp.trim(), 2000);
    setScanning(false);
    if (ok) connectWithIp(manualIp.trim(), false);
    else connectWithIp(manualIp.trim(), true); // unreachable -> demo
  };

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.8] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.baseBg }]} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity testID="scan-back-button" onPress={() => router.back()} hitSlop={10}>
          <ChevronLeft size={26} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={[styles.overline, { color: colors.accentPrimary }]}>STEP 01</Text>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{t("scan_title")}</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>{t("scan_subtitle")}</Text>

        <View style={styles.radarBox}>
          <View style={styles.radarStack}>
            <Animated.View style={[styles.pulseRing, { borderColor: colors.accentPrimary, transform: [{ scale }], opacity }]} />
            <Animated.View style={[styles.pulseRing, { borderColor: colors.accentPrimary, transform: [{ scale: Animated.add(scale, new Animated.Value(0.3)) }], opacity }]} />
            <View style={[styles.radarDot, { backgroundColor: colors.surface, borderColor: colors.borderStrong }]}>
              {scanning ? (
                <Radar size={36} color={colors.accentPrimary} strokeWidth={1.5} />
              ) : found ? (
                <CheckCircle2 size={36} color={colors.statusSuccess} strokeWidth={1.5} />
              ) : (
                <AlertTriangle size={36} color={colors.statusWarning} strokeWidth={1.5} />
              )}
            </View>
          </View>
          {scanning && (
            <View style={styles.statusRow}>
              <ActivityIndicator color={colors.accentPrimary} size="small" />
              <Text style={[styles.statusText, { color: colors.textSecondary }]}>{t("loading")}</Text>
            </View>
          )}
          {!scanning && found && (
            <Text testID="scan-found-text" style={[styles.statusText, { color: colors.statusSuccess, marginTop: 18 }]}>
              {t("scan_found")} · {found}
            </Text>
          )}
          {!scanning && !found && (
            <Text testID="scan-notfound-text" style={[styles.statusText, { color: colors.statusWarning, marginTop: 18 }]}>
              {t("scan_not_found")}
            </Text>
          )}
        </View>

        {!scanning && (
          <>
            {!found && (
              <Text style={[styles.help, { color: colors.textSecondary }]}>{t("scan_help")}</Text>
            )}

            {found && (
              <TouchableOpacity
                testID="scan-connect-found-button"
                activeOpacity={0.85}
                onPress={() => connectWithIp(found, false)}
                style={[styles.primaryBtn, { backgroundColor: colors.accentPrimary }]}
              >
                <Wifi size={18} color="#000" strokeWidth={2.5} />
                <Text style={[styles.primaryBtnText, { color: "#000" }]}>{t("scan_connect")}</Text>
                <ArrowRight size={18} color="#000" strokeWidth={2.5} />
              </TouchableOpacity>
            )}

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <Text style={[styles.label, { color: colors.textSecondary }]}>{t("scan_manual")}</Text>
            <View style={[styles.inputWrap, { borderColor: error === "invalid_ip" ? colors.statusError : colors.border, backgroundColor: colors.surface }]}>
              <TextInput
                testID="scan-manual-ip-input"
                value={manualIp}
                onChangeText={(txt) => { setManualIp(txt); setError(null); }}
                placeholder={t("scan_manual_placeholder")}
                placeholderTextColor={colors.textMuted}
                style={[styles.input, { color: colors.textPrimary }]}
                keyboardType="decimal-pad"
                autoCorrect={false}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              testID="scan-manual-connect-button"
              activeOpacity={0.85}
              onPress={onManualConnect}
              style={[styles.secondaryBtn, { borderColor: colors.borderStrong }]}
            >
              <Text style={[styles.secondaryBtnText, { color: colors.textPrimary }]}>{t("scan_connect")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="scan-demo-button"
              activeOpacity={0.7}
              onPress={() => connectWithIp("34.34.34.34", true)}
              style={styles.demoBtn}
            >
              <Text style={[styles.demoText, { color: colors.accentPrimary }]}>{t("scan_demo")}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 },
  body: { flex: 1, paddingHorizontal: 24 },
  overline: { fontSize: 11, fontWeight: "800", letterSpacing: 3 },
  title: { fontSize: 32, fontWeight: "900", letterSpacing: -0.8, marginTop: 8 },
  sub: { fontSize: 15, marginTop: 8, lineHeight: 22 },
  radarBox: { alignItems: "center", marginTop: 36, marginBottom: 28 },
  radarStack: { width: 180, height: 180, alignItems: "center", justifyContent: "center" },
  pulseRing: { position: "absolute", width: 90, height: 90, borderRadius: 100, borderWidth: 1.5 },
  radarDot: { width: 90, height: 90, borderRadius: 100, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 18 },
  statusText: { fontSize: 13, fontWeight: "700", letterSpacing: 0.5 },
  help: { fontSize: 13, lineHeight: 20, marginTop: 4, marginBottom: 16 },
  primaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 54, borderRadius: 12, gap: 10, marginTop: 8 },
  primaryBtnText: { fontSize: 15, fontWeight: "800" },
  divider: { height: 1, marginVertical: 22 },
  label: { fontSize: 11, fontWeight: "800", letterSpacing: 2, marginBottom: 10 },
  inputWrap: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14 },
  input: { height: 52, fontSize: 16, fontFamily: "monospace" },
  secondaryBtn: { height: 52, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center", marginTop: 12 },
  secondaryBtnText: { fontSize: 15, fontWeight: "700" },
  demoBtn: { alignItems: "center", padding: 14, marginTop: 6 },
  demoText: { fontSize: 13, fontWeight: "700", letterSpacing: 0.5 },
});
