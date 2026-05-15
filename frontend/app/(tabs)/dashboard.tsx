import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, Switch, Dimensions, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Activity, Cpu, MemoryStick, Thermometer, Clock, Users, Globe2, Shield, ChevronsRight, BellOff } from "lucide-react-native";
import { useApp } from "@/src/contexts/AppContext";
import { fetchState, setDpnEnabled, setAdblock, setParental, setMode, DeeperState, COUNTRIES } from "@/src/api/deeper";
import { Sparkline } from "@/src/components/Sparkline";

function formatUptime(sec: number) {
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (d > 0) return `${d}j ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function Dashboard() {
  const { colors, t, demoMode } = useApp();
  const [state, setState] = useState<DeeperState | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const pollRef = useRef<number | null>(null);

  const load = async () => {
    const s = await fetchState();
    setState(s);
  };

  useEffect(() => {
    load();
    pollRef.current = setInterval(load, 2500) as unknown as number;
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (!state) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.baseBg, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: colors.textSecondary }}>{t("loading")}</Text>
      </SafeAreaView>
    );
  }

  const lastBw = state.bandwidth[state.bandwidth.length - 1];
  const downValues = state.bandwidth.map(p => p.down);
  const upValues = state.bandwidth.map(p => p.up);
  const chartWidth = Dimensions.get("window").width - 24 * 2 - 32;
  const country = COUNTRIES.find(c => c.code === state.selectedCountry);

  const onToggleDpn = async (v: boolean) => { setState(await setDpnEnabled(v)); };
  const onToggleAdblock = async (v: boolean) => { setState(await setAdblock(v)); };
  const onToggleParental = async (v: boolean) => { setState(await setParental(v)); };
  const onSwitchMode = async () => { setState(await setMode(state.mode === "smart" ? "full" : "smart")); };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.baseBg }]} edges={["top"]}>
      {demoMode && (
        <View testID="demo-banner" style={[styles.demoBanner, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderStrong }]}>
          <View style={[styles.demoDot, { backgroundColor: colors.accentSecondary }]} />
          <Text style={[styles.demoBannerText, { color: colors.textSecondary }]}>{t("demo_banner")}</Text>
        </View>
      )}
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl tintColor={colors.accentPrimary} refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header / status */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.overline, { color: colors.accentPrimary }]}>ATOMOS · v2.4</Text>
            <View style={styles.statusRow}>
              <View style={[styles.dot, { backgroundColor: state.status.online ? colors.statusSuccess : colors.statusError }]} />
              <Text style={[styles.statusText, { color: colors.textPrimary }]}>{state.status.online ? t("dash_online") : t("dash_offline")}</Text>
            </View>
          </View>
          <View style={[styles.uptimePill, { borderColor: colors.border }]}>
            <Clock size={12} color={colors.textSecondary} />
            <Text style={[styles.uptimePillText, { color: colors.textSecondary }]}>{formatUptime(state.status.uptimeSec)}</Text>
          </View>
        </View>

        {/* Bandwidth card */}
        <View testID="bandwidth-card" style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={styles.iconLabel}>
              <Activity size={14} color={colors.accentPrimary} strokeWidth={2} />
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t("dash_bandwidth")}</Text>
            </View>
          </View>
          <View style={styles.bwRow}>
            <View style={styles.bwCol}>
              <Text style={[styles.bwLabel, { color: colors.textMuted }]}>↓ {t("dash_download")}</Text>
              <Text style={[styles.bwValue, { color: colors.textPrimary }]}>{lastBw.down.toFixed(1)}<Text style={[styles.bwUnit, { color: colors.textSecondary }]}> Mbps</Text></Text>
              <View style={{ marginTop: 8 }}>
                <Sparkline values={downValues} width={chartWidth / 2 - 12} height={42} stroke={colors.accentPrimary} fillId="grad-down" />
              </View>
            </View>
            <View style={[styles.bwDivider, { backgroundColor: colors.border }]} />
            <View style={styles.bwCol}>
              <Text style={[styles.bwLabel, { color: colors.textMuted }]}>↑ {t("dash_upload")}</Text>
              <Text style={[styles.bwValue, { color: colors.textPrimary }]}>{lastBw.up.toFixed(1)}<Text style={[styles.bwUnit, { color: colors.textSecondary }]}> Mbps</Text></Text>
              <View style={{ marginTop: 8 }}>
                <Sparkline values={upValues} width={chartWidth / 2 - 12} height={42} stroke={colors.accentSecondary} fillId="grad-up" />
              </View>
            </View>
          </View>
        </View>

        {/* Hardware stats grid */}
        <View style={styles.grid}>
          <StatCard color={colors} icon={<Cpu size={14} color={colors.accentPrimary} />} label={t("dash_cpu")} value={`${Math.round(state.status.cpu)}%`} />
          <StatCard color={colors} icon={<MemoryStick size={14} color={colors.accentPrimary} />} label={t("dash_ram")} value={`${Math.round(state.status.ram)}%`} />
          <StatCard color={colors} icon={<Thermometer size={14} color={colors.accentPrimary} />} label={t("dash_temp")} value={`${state.status.tempC.toFixed(1)}°C`} />
          <StatCard color={colors} icon={<Users size={14} color={colors.accentPrimary} />} label={t("dash_devices_count")} value={`${state.devices.length}`} />
        </View>

        {/* Quick actions */}
        <Text style={[styles.section, { color: colors.textSecondary }]}>{t("dash_quick")}</Text>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, padding: 0 }]}>
          <QuickRow color={colors} testID="quick-dpn" icon={<Globe2 size={18} color={colors.accentPrimary} />} label={t("dash_dpn")} value={state.dpnEnabled} onChange={onToggleDpn} subtitle={state.mode === "smart" ? t("dash_mode_smart") : t("dash_mode_full")} />
          <Divider color={colors.border} />
          <TouchableOpacity testID="quick-mode" activeOpacity={0.7} onPress={onSwitchMode} style={styles.modeRow}>
            <View style={styles.iconLabel}>
              <ChevronsRight size={18} color={colors.accentSecondary} />
              <View>
                <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>{t("dpn_mode")}</Text>
                <Text style={[styles.rowSub, { color: colors.textMuted }]}>{state.mode === "smart" ? t("dash_mode_smart") : `${t("dash_mode_full")} · ${country?.flag} ${country?.name}`}</Text>
              </View>
            </View>
            <View style={[styles.modeBadge, { borderColor: colors.borderStrong }]}>
              <Text style={[styles.modeBadgeText, { color: colors.textPrimary }]}>{state.mode === "smart" ? "SMART" : "FULL"}</Text>
            </View>
          </TouchableOpacity>
          <Divider color={colors.border} />
          <QuickRow color={colors} testID="quick-adblock" icon={<BellOff size={18} color={colors.accentPrimary} />} label={t("dash_adblock")} value={state.adblock} onChange={onToggleAdblock} />
          <Divider color={colors.border} />
          <QuickRow color={colors} testID="quick-parental" icon={<Shield size={18} color={colors.accentPrimary} />} label={t("dash_parental")} value={state.parental} onChange={onToggleParental} />
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const StatCard = ({ color, icon, label, value }: any) => (
  <View style={[styles.statCard, { backgroundColor: color.surface, borderColor: color.border }]}>
    <View style={styles.iconLabel}>
      {icon}
      <Text style={[styles.cardLabel, { color: color.textSecondary }]}>{label}</Text>
    </View>
    <Text style={[styles.statValue, { color: color.textPrimary }]}>{value}</Text>
  </View>
);

const QuickRow = ({ color, testID, icon, label, value, onChange, subtitle }: any) => (
  <View style={styles.quickRow}>
    <View style={styles.iconLabel}>
      {icon}
      <View>
        <Text style={[styles.rowLabel, { color: color.textPrimary }]}>{label}</Text>
        {subtitle && <Text style={[styles.rowSub, { color: color.textMuted }]}>{subtitle}</Text>}
      </View>
    </View>
    <Switch
      testID={testID}
      value={value}
      onValueChange={onChange}
      trackColor={{ true: color.accentPrimary, false: color.surfaceElevated }}
      thumbColor={value ? "#000" : color.textMuted}
      ios_backgroundColor={color.surfaceElevated}
    />
  </View>
);

const Divider = ({ color }: any) => (<View style={{ height: 1, backgroundColor: color, marginHorizontal: 16 }} />);

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 80 },
  demoBanner: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, marginHorizontal: 24, marginTop: 12 },
  demoDot: { width: 8, height: 8, borderRadius: 100 },
  demoBannerText: { fontSize: 12, fontWeight: "600", flex: 1 },
  headerRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 },
  overline: { fontSize: 10, fontWeight: "800", letterSpacing: 2.5 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  dot: { width: 10, height: 10, borderRadius: 100 },
  statusText: { fontSize: 22, fontWeight: "900", letterSpacing: -0.4 },
  uptimePill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 100, borderWidth: 1 },
  uptimePillText: { fontSize: 11, fontWeight: "700", fontFamily: "monospace" },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  iconLabel: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 2 },
  bwRow: { flexDirection: "row", alignItems: "stretch" },
  bwCol: { flex: 1, paddingHorizontal: 4 },
  bwDivider: { width: 1, marginHorizontal: 8 },
  bwLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 6 },
  bwValue: { fontSize: 28, fontWeight: "800", fontFamily: "monospace", letterSpacing: -1 },
  bwUnit: { fontSize: 13, fontWeight: "600", fontFamily: "monospace" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 4 },
  statCard: { width: "47.7%", flexGrow: 1, borderRadius: 14, borderWidth: 1, padding: 14, minWidth: 120 },
  statValue: { fontSize: 22, fontWeight: "800", fontFamily: "monospace", letterSpacing: -0.5, marginTop: 8 },
  section: { fontSize: 11, fontWeight: "800", letterSpacing: 2, marginTop: 22, marginBottom: 10 },
  quickRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, paddingHorizontal: 18 },
  rowLabel: { fontSize: 15, fontWeight: "700" },
  rowSub: { fontSize: 12, fontWeight: "600", marginTop: 2, letterSpacing: 0.5 },
  modeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, paddingHorizontal: 18 },
  modeBadge: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  modeBadgeText: { fontSize: 11, fontWeight: "900", letterSpacing: 1, fontFamily: "monospace" },
});
