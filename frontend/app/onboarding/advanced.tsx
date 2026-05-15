import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Wifi, User, Lock, Eye, EyeOff, ArrowRight, Globe } from "lucide-react-native";
import { useApp } from "@/src/contexts/AppContext";
import { login, pingDeeper } from "@/src/api/deeper";

export default function Advanced() {
  const router = useRouter();
  const { colors, t, setDeeperIp, setDemoMode, setAuthed, pin, biometricEnabled } = useApp();
  const [ip, setIp] = useState("34.34.34.34");
  const [user, setUser] = useState("admin");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const onConnect = async () => {
    if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip.trim())) { Alert.alert("IP invalide", "Format : 192.168.0.1"); return; }
    if (!user.trim()) { Alert.alert("Utilisateur requis"); return; }
    if (password.length < 4) { Alert.alert("Mot de passe trop court"); return; }
    setLoading(true);
    const reachable = await pingDeeper(ip.trim(), 1800);
    setDeeperIp(ip.trim());
    setDemoMode(!reachable);
    const ok = await login(password);
    setLoading(false);
    if (!ok) { Alert.alert("Identifiants invalides"); return; }
    setAuthed(true);
    if (pin || biometricEnabled) router.replace("/(tabs)/dashboard");
    else router.replace("/lock?setup=1");
  };

  const onOpenAtomOS = () => {
    if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip.trim())) { Alert.alert("IP invalide"); return; }
    setDeeperIp(ip.trim());
    router.push({ pathname: "/webview", params: { ip: ip.trim() } });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.baseBg }]} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity testID="adv-back" onPress={() => router.back()} hitSlop={10}><ChevronLeft size={26} color={colors.textPrimary} /></TouchableOpacity>
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <View style={[styles.iconBox, { borderColor: colors.borderStrong, backgroundColor: colors.surface }]}>
            <Wifi size={28} color={colors.accentPrimary} strokeWidth={1.5} />
          </View>
          <Text style={[styles.overline, { color: colors.accentPrimary }]}>EXPERT</Text>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{t("adv_title")}</Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>{t("adv_subtitle")}</Text>

          <Text style={[styles.label, { color: colors.textSecondary }]}>{t("adv_ip")}</Text>
          <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Globe size={18} color={colors.textSecondary} />
            <TextInput
              testID="adv-ip-input"
              value={ip}
              onChangeText={setIp}
              keyboardType="decimal-pad"
              placeholder="34.34.34.34"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, { color: colors.textPrimary, fontFamily: "monospace" }]}
            />
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>{t("adv_user")}</Text>
          <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <User size={18} color={colors.textSecondary} />
            <TextInput
              testID="adv-user-input"
              value={user}
              onChangeText={setUser}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder={t("adv_user_placeholder")}
              placeholderTextColor={colors.textMuted}
              style={[styles.input, { color: colors.textPrimary }]}
            />
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>{t("adv_password")}</Text>
          <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Lock size={18} color={colors.textSecondary} />
            <TextInput
              testID="adv-password-input"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPw}
              autoCapitalize="none"
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, { color: colors.textPrimary }]}
            />
            <TouchableOpacity testID="adv-toggle-show" onPress={() => setShowPw(s => !s)} hitSlop={8}>
              {showPw ? <EyeOff size={18} color={colors.textSecondary} /> : <Eye size={18} color={colors.textSecondary} />}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            testID="adv-connect-button"
            activeOpacity={0.85}
            onPress={onConnect}
            disabled={loading}
            style={[styles.cta, { backgroundColor: colors.accentPrimary, opacity: loading ? 0.7 : 1 }]}
          >
            {loading ? <ActivityIndicator color="#000" /> : (<>
              <Text style={[styles.ctaText, { color: "#000" }]}>{t("adv_connect")}</Text>
              <ArrowRight size={18} color="#000" strokeWidth={2.5} />
            </>)}
          </TouchableOpacity>

          <TouchableOpacity
            testID="adv-open-atomos-button"
            activeOpacity={0.85}
            onPress={onOpenAtomOS}
            style={[styles.altCta, { borderColor: colors.borderStrong }]}
          >
            <Globe size={16} color={colors.textPrimary} strokeWidth={2} />
            <Text style={[styles.altCtaText, { color: colors.textPrimary }]}>{t("adv_open_atomos")}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 },
  body: { paddingHorizontal: 24, paddingBottom: 40 },
  iconBox: { width: 60, height: 60, borderRadius: 16, borderWidth: 1, alignItems: "center", justifyContent: "center", marginBottom: 22 },
  overline: { fontSize: 11, fontWeight: "800", letterSpacing: 3 },
  title: { fontSize: 28, fontWeight: "900", letterSpacing: -0.5, marginTop: 8 },
  sub: { fontSize: 14, marginTop: 8, lineHeight: 20, marginBottom: 24 },
  label: { fontSize: 11, fontWeight: "800", letterSpacing: 2, marginBottom: 8, marginTop: 14 },
  inputWrap: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14 },
  input: { flex: 1, height: 50, fontSize: 15 },
  cta: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 54, borderRadius: 14, gap: 10, marginTop: 28 },
  ctaText: { fontSize: 15, fontWeight: "800" },
  altCta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, borderRadius: 12, borderWidth: 1, marginTop: 12 },
  altCtaText: { fontSize: 14, fontWeight: "700" },
});
