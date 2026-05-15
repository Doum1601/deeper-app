import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, TextInput, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Sun, Moon, Languages, Lock, Fingerprint, Wifi, LogOut, ChevronRight, Edit3, Check, X, Info, Router, Globe } from "lucide-react-native";
import { useApp } from "@/src/contexts/AppContext";

export default function Settings() {
  const router = useRouter();
  const { colors, t, themeMode, setThemeMode, lang, setLang, pin, setPin, biometricEnabled, setBiometricEnabled, deeperIp, setDeeperIp, demoMode, logout } = useApp();
  const [editIp, setEditIp] = useState(false);
  const [ipDraft, setIpDraft] = useState(deeperIp);

  const onSaveIp = () => {
    if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ipDraft.trim())) {
      Alert.alert("Invalid IP", "Format: 192.168.0.1");
      return;
    }
    setDeeperIp(ipDraft.trim());
    setEditIp(false);
  };

  const onTogglePin = async () => {
    if (pin) {
      await setPin(null);
      setBiometricEnabled(false);
    } else {
      router.push("/lock?setup=1");
    }
  };

  const onLogout = async () => {
    await logout();
    router.replace("/onboarding/welcome");
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.baseBg }]} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.h1, { color: colors.textPrimary }]}>{t("settings_title")}</Text>

        {/* Appearance */}
        <Text style={[styles.section, { color: colors.textSecondary }]}>{t("settings_appearance")}</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.rowBetween}>
            <View style={styles.rowLeft}>
              {themeMode === "dark" ? <Moon size={18} color={colors.accentPrimary} /> : <Sun size={18} color={colors.accentPrimary} />}
              <Text style={[styles.label, { color: colors.textPrimary }]}>{t("settings_theme")}</Text>
            </View>
            <View style={[styles.toggleSeg, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
              <TouchableOpacity
                testID="settings-theme-dark"
                onPress={() => setThemeMode("dark")}
                style={[styles.toggleSegItem, themeMode === "dark" && { backgroundColor: colors.surface, borderColor: colors.accentPrimary }]}
              >
                <Text style={[styles.toggleSegText, { color: themeMode === "dark" ? colors.textPrimary : colors.textMuted }]}>{t("settings_theme_dark")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="settings-theme-light"
                onPress={() => setThemeMode("light")}
                style={[styles.toggleSegItem, themeMode === "light" && { backgroundColor: colors.surface, borderColor: colors.accentPrimary }]}
              >
                <Text style={[styles.toggleSegText, { color: themeMode === "light" ? colors.textPrimary : colors.textMuted }]}>{t("settings_theme_light")}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.rowBetween}>
            <View style={styles.rowLeft}>
              <Languages size={18} color={colors.accentPrimary} />
              <Text style={[styles.label, { color: colors.textPrimary }]}>{t("settings_language")}</Text>
            </View>
            <View style={[styles.toggleSeg, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
              <TouchableOpacity
                testID="settings-lang-fr"
                onPress={() => setLang("fr")}
                style={[styles.toggleSegItem, lang === "fr" && { backgroundColor: colors.surface, borderColor: colors.accentPrimary }]}
              >
                <Text style={[styles.toggleSegText, { color: lang === "fr" ? colors.textPrimary : colors.textMuted }]}>FR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="settings-lang-en"
                onPress={() => setLang("en")}
                style={[styles.toggleSegItem, lang === "en" && { backgroundColor: colors.surface, borderColor: colors.accentPrimary }]}
              >
                <Text style={[styles.toggleSegText, { color: lang === "en" ? colors.textPrimary : colors.textMuted }]}>EN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Security */}
        <Text style={[styles.section, { color: colors.textSecondary }]}>{t("settings_security")}</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity testID="settings-pin-toggle" onPress={onTogglePin} activeOpacity={0.7} style={styles.rowBetween}>
            <View style={styles.rowLeft}>
              <Lock size={18} color={colors.accentPrimary} />
              <Text style={[styles.label, { color: colors.textPrimary }]}>{t("settings_pin")}</Text>
            </View>
            <View style={styles.rowLeft}>
              <Text style={[styles.subValue, { color: pin ? colors.statusSuccess : colors.textMuted }]}>{pin ? t("settings_pin_enabled") : t("settings_pin_disabled")}</Text>
              <ChevronRight size={18} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.rowBetween}>
            <View style={styles.rowLeft}>
              <Fingerprint size={18} color={colors.accentPrimary} />
              <Text style={[styles.label, { color: colors.textPrimary }]}>{t("settings_biometric")}</Text>
            </View>
            <Switch
              testID="settings-bio-toggle"
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              disabled={!pin}
              trackColor={{ true: colors.accentPrimary, false: colors.surfaceElevated }}
              thumbColor={biometricEnabled ? "#000" : colors.textMuted}
              ios_backgroundColor={colors.surfaceElevated}
            />
          </View>
        </View>

        {/* Connection */}
        <Text style={[styles.section, { color: colors.textSecondary }]}>{t("settings_connection")}</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.rowBetween}>
            <View style={styles.rowLeft}>
              <Wifi size={18} color={colors.accentPrimary} />
              <View>
                <Text style={[styles.label, { color: colors.textPrimary }]}>{t("settings_deeper_ip")}</Text>
                {!editIp && <Text style={[styles.subValue, { color: colors.textMuted, marginTop: 2, fontFamily: "monospace" }]}>{deeperIp}{demoMode ? " · DEMO" : ""}</Text>}
              </View>
            </View>
            {!editIp ? (
              <TouchableOpacity testID="settings-ip-edit" onPress={() => { setIpDraft(deeperIp); setEditIp(true); }} hitSlop={8}>
                <Edit3 size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>
          {editIp && (
            <View style={[styles.ipEditRow, { borderColor: colors.border }]}>
              <TextInput
                testID="settings-ip-input"
                value={ipDraft}
                onChangeText={setIpDraft}
                style={[styles.ipInput, { color: colors.textPrimary, backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
                keyboardType="decimal-pad"
                autoFocus
                placeholderTextColor={colors.textMuted}
                placeholder="34.34.34.34"
              />
              <TouchableOpacity testID="settings-ip-cancel" onPress={() => setEditIp(false)} style={[styles.smallBtn, { borderColor: colors.borderStrong }]}>
                <X size={16} color={colors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity testID="settings-ip-save" onPress={onSaveIp} style={[styles.smallBtn, { backgroundColor: colors.accentPrimary, borderColor: colors.accentPrimary }]}>
                <Check size={16} color="#000" />
              </TouchableOpacity>
            </View>
          )}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <TouchableOpacity testID="settings-atomos" onPress={() => router.push({ pathname: "/webview", params: { ip: deeperIp } })} activeOpacity={0.7} style={styles.rowBetween}>
            <View style={styles.rowLeft}>
              <Globe size={18} color={colors.accentPrimary} />
              <Text style={[styles.label, { color: colors.textPrimary }]}>{t("settings_atomos")}</Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <TouchableOpacity testID="settings-multi-deeper" onPress={() => router.push("/settings/multi-deeper")} activeOpacity={0.7} style={styles.rowBetween}>
            <View style={styles.rowLeft}>
              <Router size={18} color={colors.accentPrimary} />
              <Text style={[styles.label, { color: colors.textPrimary }]}>{t("settings_multi_deeper")}</Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* About */}
        <Text style={[styles.section, { color: colors.textSecondary }]}>{t("settings_about")}</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.rowBetween}>
            <View style={styles.rowLeft}>
              <Info size={18} color={colors.accentPrimary} />
              <Text style={[styles.label, { color: colors.textPrimary }]}>{t("settings_version")}</Text>
            </View>
            <Text style={[styles.subValue, { color: colors.textMuted, fontFamily: "monospace" }]}>1.0.0</Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity testID="settings-logout" onPress={onLogout} activeOpacity={0.8} style={[styles.logoutBtn, { borderColor: colors.statusError }]}>
          <LogOut size={16} color={colors.statusError} />
          <Text style={[styles.logoutText, { color: colors.statusError }]}>{t("settings_logout")}</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 80 },
  h1: { fontSize: 28, fontWeight: "900", letterSpacing: -0.6, marginBottom: 4 },
  section: { fontSize: 11, fontWeight: "800", letterSpacing: 2, marginTop: 22, marginBottom: 10 },
  card: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 4 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14 },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  label: { fontSize: 15, fontWeight: "700" },
  subValue: { fontSize: 13, fontWeight: "700", letterSpacing: 0.4 },
  divider: { height: 1 },
  toggleSeg: { flexDirection: "row", borderRadius: 9, borderWidth: 1, padding: 3, gap: 3 },
  toggleSegItem: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 7, borderWidth: 1, borderColor: "transparent" },
  toggleSegText: { fontSize: 12, fontWeight: "800", letterSpacing: 0.5 },
  ipEditRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, borderTopWidth: 1 },
  ipInput: { flex: 1, height: 40, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, fontFamily: "monospace", fontSize: 14 },
  smallBtn: { width: 40, height: 40, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 28, padding: 14, borderRadius: 12, borderWidth: 1 },
  logoutText: { fontSize: 14, fontWeight: "800", letterSpacing: 0.5 },
});
