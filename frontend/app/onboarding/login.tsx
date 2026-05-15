import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Keyboard, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Lock, ArrowRight, Eye, EyeOff } from "lucide-react-native";
import { useApp } from "@/src/contexts/AppContext";
import { login } from "@/src/api/deeper";

export default function Login() {
  const router = useRouter();
  const { colors, t, deeperIp, remember, setRemember, setAuthed, pin, biometricEnabled, setAppLocked } = useApp();
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    Keyboard.dismiss();
    setError(null);
    setLoading(true);
    const ok = await login(password);
    setLoading(false);
    if (!ok) { setError("err"); return; }
    setAuthed(true);
    if (pin || biometricEnabled) {
      // After login, ask user to set PIN/biometric ONLY if none set yet. Otherwise go to dashboard.
      router.replace("/(tabs)/dashboard");
    } else {
      // Optionally go to setup PIN
      router.replace("/lock?setup=1");
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.baseBg }]} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity testID="login-back-button" onPress={() => router.back()} hitSlop={10}>
          <ChevronLeft size={26} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <View style={[styles.iconBox, { borderColor: colors.borderStrong, backgroundColor: colors.surface }]}>
          <Lock size={28} color={colors.accentPrimary} strokeWidth={1.5} />
        </View>

        <Text style={[styles.overline, { color: colors.accentPrimary }]}>STEP 02</Text>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{t("login_title")}</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>{t("login_subtitle")}</Text>

        <View style={[styles.ipBadge, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Text style={[styles.ipBadgeLabel, { color: colors.textMuted }]}>DEEPER</Text>
          <Text testID="login-deeper-ip" style={[styles.ipBadgeText, { color: colors.textPrimary }]}>{deeperIp}</Text>
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>{t("login_placeholder")}</Text>
        <View style={[styles.inputWrap, { borderColor: error ? colors.statusError : colors.border, backgroundColor: colors.surface }]}>
          <TextInput
            testID="login-password-input"
            value={password}
            onChangeText={(txt) => { setPassword(txt); setError(null); }}
            secureTextEntry={!showPw}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { color: colors.textPrimary }]}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity testID="login-toggle-show" onPress={() => setShowPw(s => !s)} hitSlop={8}>
            {showPw ? <EyeOff size={20} color={colors.textSecondary} /> : <Eye size={20} color={colors.textSecondary} />}
          </TouchableOpacity>
        </View>
        {error && (
          <Text style={[styles.errorText, { color: colors.statusError }]}>{t("login_error")}</Text>
        )}

        <Pressable testID="login-remember-row" onPress={() => setRemember(!remember)} style={styles.rememberRow}>
          <View style={[styles.checkbox, { borderColor: remember ? colors.accentPrimary : colors.borderStrong, backgroundColor: remember ? colors.accentPrimary : "transparent" }]}>
            {remember && <View style={styles.checkboxInner} />}
          </View>
          <Text style={[styles.rememberText, { color: colors.textPrimary }]}>{t("login_remember")}</Text>
        </Pressable>

        <TouchableOpacity
          testID="login-submit-button"
          activeOpacity={0.85}
          onPress={onSubmit}
          disabled={loading || password.length < 4}
          style={[styles.cta, { backgroundColor: password.length < 4 ? colors.surfaceElevated : colors.accentPrimary, opacity: loading ? 0.7 : 1 }]}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Text style={[styles.ctaText, { color: password.length < 4 ? colors.textMuted : "#000" }]}>{t("login_cta")}</Text>
              <ArrowRight size={18} color={password.length < 4 ? colors.textMuted : "#000"} strokeWidth={2.5} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 },
  body: { flex: 1, paddingHorizontal: 24 },
  iconBox: { width: 60, height: 60, borderRadius: 16, borderWidth: 1, alignItems: "center", justifyContent: "center", marginBottom: 22 },
  overline: { fontSize: 11, fontWeight: "800", letterSpacing: 3 },
  title: { fontSize: 32, fontWeight: "900", letterSpacing: -0.8, marginTop: 8 },
  sub: { fontSize: 15, marginTop: 8, lineHeight: 22, marginBottom: 22 },
  ipBadge: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, gap: 12, alignSelf: "flex-start", marginBottom: 26 },
  ipBadgeLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 2 },
  ipBadgeText: { fontSize: 14, fontFamily: "monospace", fontWeight: "700" },
  label: { fontSize: 11, fontWeight: "800", letterSpacing: 2, marginBottom: 10 },
  inputWrap: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 12, paddingHorizontal: 14 },
  input: { flex: 1, height: 52, fontSize: 16 },
  errorText: { fontSize: 13, marginTop: 8, fontWeight: "600" },
  rememberRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 18 },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  checkboxInner: { width: 8, height: 8, backgroundColor: "#000", borderRadius: 2 },
  rememberText: { fontSize: 14, fontWeight: "600" },
  cta: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 56, borderRadius: 14, gap: 10, marginTop: 28 },
  ctaText: { fontSize: 16, fontWeight: "800" },
});
