import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Shield, BellOff, Users, Activity, ChevronRight, AlertOctagon, Bug, Eye, Fish } from "lucide-react-native";
import { useApp } from "@/src/contexts/AppContext";
import { fetchState, setSecurityProfile, setAdblock, setParental, DeeperState, SecurityProfile } from "@/src/api/deeper";

const PROFILES: { key: SecurityProfile; descKey: any }[] = [
  { key: "basic", descKey: "sec_profile_basic_desc" },
  { key: "standard", descKey: "sec_profile_standard_desc" },
  { key: "strict", descKey: "sec_profile_strict_desc" },
];

export default function SecurityScreen() {
  const router = useRouter();
  const { colors, t } = useApp();
  const [state, setState] = useState<DeeperState | null>(null);

  useEffect(() => {
    fetchState().then(setState);
    const id = setInterval(() => fetchState().then(setState), 4000);
    return () => clearInterval(id);
  }, []);

  if (!state) return <SafeAreaView style={[styles.safe, { backgroundColor: colors.baseBg, justifyContent: "center", alignItems: "center" }]}><ActivityIndicator color={colors.accentPrimary} /></SafeAreaView>;

  const onProfile = async (p: SecurityProfile) => setState(await setSecurityProfile(p));
  const onAdblock = async (v: boolean) => setState(await setAdblock(v));
  const onParental = async (v: boolean) => setState(await setParental(v));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.baseBg }]} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.h1, { color: colors.textPrimary }]}>{t("sec_title")}</Text>

        {/* Security profile */}
        <Text style={[styles.section, { color: colors.textSecondary }]}>{t("sec_profile")}</Text>
        <View style={[styles.profileWrap, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          {PROFILES.map((p) => {
            const active = state.securityProfile === p.key;
            return (
              <TouchableOpacity
                key={p.key}
                testID={`sec-profile-${p.key}`}
                onPress={() => onProfile(p.key)}
                activeOpacity={0.8}
                style={[styles.profileItem, active && { backgroundColor: colors.surface, borderColor: colors.accentPrimary }]}
              >
                <Text style={[styles.profileLabel, { color: active ? colors.textPrimary : colors.textSecondary }]}>{t(`sec_profile_${p.key}` as any)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={[styles.help, { color: colors.textMuted }]}>{t(`sec_profile_${state.securityProfile}_desc` as any)}</Text>

        {/* Threats */}
        <Text style={[styles.section, { color: colors.textSecondary }]}>{t("sec_threats")}</Text>
        <View style={styles.threatGrid}>
          <ThreatTile c={colors} icon={<Bug size={14} color={colors.statusError} />} label={t("sec_malware")} value={state.threats.malware} />
          <ThreatTile c={colors} icon={<Eye size={14} color={colors.accentSecondary} />} label={t("sec_trackers")} value={state.threats.trackers} />
          <ThreatTile c={colors} icon={<AlertOctagon size={14} color={colors.statusError} />} label={t("sec_intrusions")} value={state.threats.intrusions} />
          <ThreatTile c={colors} icon={<Fish size={14} color={colors.accentSecondary} />} label={t("sec_phishing")} value={state.threats.phishing} />
        </View>

        {/* AdBlock */}
        <Text style={[styles.section, { color: colors.textSecondary }]}>{t("sec_adblock")}</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.rowBetween}>
            <View style={styles.rowLeft}>
              <BellOff size={18} color={colors.accentPrimary} />
              <Text style={[styles.label, { color: colors.textPrimary }]}>{t("sec_adblock")}</Text>
            </View>
            <Switch
              testID="sec-adblock-switch"
              value={state.adblock}
              onValueChange={onAdblock}
              trackColor={{ true: colors.accentPrimary, false: colors.surfaceElevated }}
              thumbColor={state.adblock ? "#000" : colors.textMuted}
              ios_backgroundColor={colors.surfaceElevated}
            />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <TouchableOpacity testID="sec-adblock-exceptions" onPress={() => router.push("/security/adblock-exceptions")} activeOpacity={0.7} style={styles.rowBetween}>
            <View style={styles.rowLeft}>
              <Shield size={18} color={colors.textSecondary} />
              <Text style={[styles.label, { color: colors.textPrimary }]}>{t("sec_adblock_exceptions")}</Text>
            </View>
            <View style={styles.rowLeft}>
              <Text style={[styles.subValue, { color: colors.textMuted }]}>{state.adblockExceptions.length}</Text>
              <ChevronRight size={18} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Parental */}
        <Text style={[styles.section, { color: colors.textSecondary }]}>{t("sec_parental")}</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.rowBetween}>
            <View style={styles.rowLeft}>
              <Users size={18} color={colors.accentPrimary} />
              <Text style={[styles.label, { color: colors.textPrimary }]}>{t("sec_parental")}</Text>
            </View>
            <Switch
              testID="sec-parental-switch"
              value={state.parental}
              onValueChange={onParental}
              trackColor={{ true: colors.accentPrimary, false: colors.surfaceElevated }}
              thumbColor={state.parental ? "#000" : colors.textMuted}
              ios_backgroundColor={colors.surfaceElevated}
            />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <TouchableOpacity testID="sec-parental-profiles" onPress={() => router.push("/security/parental")} activeOpacity={0.7} style={styles.rowBetween}>
            <View style={styles.rowLeft}>
              <Users size={18} color={colors.textSecondary} />
              <Text style={[styles.label, { color: colors.textPrimary }]}>{t("sec_parental_profiles")}</Text>
            </View>
            <View style={styles.rowLeft}>
              <Text style={[styles.subValue, { color: colors.textMuted }]}>{state.parentalProfiles.length}</Text>
              <ChevronRight size={18} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Logs shortcut */}
        <TouchableOpacity testID="sec-logs-link" onPress={() => router.push("/logs")} activeOpacity={0.8} style={[styles.logsCta, { borderColor: colors.borderStrong, backgroundColor: colors.surface }]}>
          <Activity size={18} color={colors.accentPrimary} />
          <Text style={[styles.logsCtaText, { color: colors.textPrimary }]}>{t("sec_logs_link")}</Text>
          <ChevronRight size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const ThreatTile = ({ c, icon, label, value }: any) => (
  <View style={[styles.threatTile, { backgroundColor: c.surface, borderColor: c.border }]}>
    <View style={styles.iconLabel}>{icon}<Text style={[styles.threatLabel, { color: c.textSecondary }]}>{label}</Text></View>
    <Text style={[styles.threatValue, { color: c.textPrimary }]}>{value.toLocaleString()}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 80 },
  h1: { fontSize: 28, fontWeight: "900", letterSpacing: -0.6, marginBottom: 4 },
  section: { fontSize: 11, fontWeight: "800", letterSpacing: 2, marginTop: 22, marginBottom: 10 },
  profileWrap: { flexDirection: "row", padding: 4, gap: 4, borderRadius: 12, borderWidth: 1 },
  profileItem: { flex: 1, paddingVertical: 11, borderRadius: 9, borderWidth: 1, borderColor: "transparent", alignItems: "center" },
  profileLabel: { fontSize: 12, fontWeight: "800", letterSpacing: 0.5 },
  help: { fontSize: 12, marginTop: 10, lineHeight: 18 },
  threatGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  threatTile: { width: "47.7%", flexGrow: 1, borderRadius: 12, borderWidth: 1, padding: 12, minWidth: 130 },
  iconLabel: { flexDirection: "row", alignItems: "center", gap: 8 },
  threatLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 1.5 },
  threatValue: { fontSize: 22, fontWeight: "800", fontFamily: "monospace", marginTop: 8, letterSpacing: -0.5 },
  card: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 4 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14 },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  label: { fontSize: 15, fontWeight: "700" },
  subValue: { fontSize: 13, fontWeight: "700" },
  divider: { height: 1 },
  logsCta: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16, borderRadius: 12, borderWidth: 1, marginTop: 22 },
  logsCtaText: { flex: 1, fontSize: 14, fontWeight: "700" },
});
