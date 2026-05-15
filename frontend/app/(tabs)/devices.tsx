import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Smartphone, Laptop, Tv, Gamepad2, Tablet, Cctv, Monitor, ArrowDown, ArrowUp, Ban, BanIcon } from "lucide-react-native";
import { useApp } from "@/src/contexts/AppContext";
import { fetchState, toggleDeviceDpn, toggleDeviceBlock, DeeperState, ConnectedDevice } from "@/src/api/deeper";

const ICONS: Record<ConnectedDevice["type"], any> = {
  phone: Smartphone,
  laptop: Laptop,
  tv: Tv,
  console: Gamepad2,
  tablet: Tablet,
  iot: Cctv,
  desktop: Monitor,
};

function formatKbps(kbps: number) {
  if (kbps >= 1024) return `${(kbps / 1024).toFixed(1)} Mbps`;
  return `${Math.round(kbps)} Kbps`;
}

export default function Devices() {
  const { colors, t } = useApp();
  const [state, setState] = useState<DeeperState | null>(null);

  useEffect(() => {
    fetchState().then(setState);
    const id = setInterval(() => fetchState().then(setState), 3000);
    return () => clearInterval(id);
  }, []);

  if (!state) {
    return <SafeAreaView style={[styles.safe, { backgroundColor: colors.baseBg, justifyContent: "center", alignItems: "center" }]}><ActivityIndicator color={colors.accentPrimary} /></SafeAreaView>;
  }

  const onDpnToggle = async (id: string) => { setState(await toggleDeviceDpn(id)); };
  const onBlockToggle = async (id: string) => { setState(await toggleDeviceBlock(id)); };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.baseBg }]} edges={["top"]}>
      <View style={styles.header}>
        <Text style={[styles.h1, { color: colors.textPrimary }]}>{t("devices_title")}</Text>
        <View style={[styles.countBadge, { borderColor: colors.borderStrong }]}>
          <Text style={[styles.countBadgeText, { color: colors.textSecondary }]}>{state.devices.length}</Text>
        </View>
      </View>

      <FlatList
        data={state.devices}
        keyExtractor={(d) => d.id}
        contentContainerStyle={{ padding: 24, paddingBottom: 80, paddingTop: 8 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={() => (
          <Text style={{ color: colors.textSecondary, textAlign: "center", marginTop: 40 }}>{t("devices_empty")}</Text>
        )}
        renderItem={({ item }) => {
          const Icon = ICONS[item.type] || Smartphone;
          return (
            <View testID={`device-${item.id}`} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.row}>
                <View style={[styles.iconBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                  <Icon size={20} color={colors.accentPrimary} strokeWidth={1.8} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { color: colors.textPrimary }]}>{item.name}</Text>
                  <Text style={[styles.ip, { color: colors.textMuted }]}>{item.ip}</Text>
                </View>
                <View style={[styles.statusPill, { borderColor: item.blocked ? colors.statusError : (item.throughDpn ? colors.accentPrimary : colors.borderStrong) }]}>
                  <Text style={[styles.statusPillText, { color: item.blocked ? colors.statusError : (item.throughDpn ? colors.accentPrimary : colors.textMuted) }]}>
                    {item.blocked ? "BLOCKED" : (item.throughDpn ? "DPN" : "BYPASS")}
                  </Text>
                </View>
              </View>

              <View style={[styles.trafficRow, { borderTopColor: colors.border }]}>
                <View style={styles.traffic}>
                  <ArrowDown size={12} color={colors.accentPrimary} />
                  <Text style={[styles.trafficText, { color: colors.textPrimary }]}>{formatKbps(item.rxKbps)}</Text>
                </View>
                <View style={styles.traffic}>
                  <ArrowUp size={12} color={colors.accentSecondary} />
                  <Text style={[styles.trafficText, { color: colors.textPrimary }]}>{formatKbps(item.txKbps)}</Text>
                </View>
                <View style={{ flex: 1 }} />
                <View style={styles.toggleGroup}>
                  <Text style={[styles.toggleLabel, { color: colors.textMuted }]}>{t("devices_through")}</Text>
                  <Switch
                    testID={`device-dpn-${item.id}`}
                    value={item.throughDpn}
                    onValueChange={() => onDpnToggle(item.id)}
                    disabled={item.blocked}
                    trackColor={{ true: colors.accentPrimary, false: colors.surfaceElevated }}
                    thumbColor={item.throughDpn ? "#000" : colors.textMuted}
                    ios_backgroundColor={colors.surfaceElevated}
                  />
                </View>
                <TouchableOpacity
                  testID={`device-block-${item.id}`}
                  onPress={() => onBlockToggle(item.id)}
                  activeOpacity={0.7}
                  style={[styles.blockBtn, { borderColor: item.blocked ? colors.statusError : colors.borderStrong, backgroundColor: item.blocked ? "rgba(255,59,48,0.1)" : "transparent" }]}
                >
                  <Ban size={14} color={item.blocked ? colors.statusError : colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 12 },
  h1: { fontSize: 28, fontWeight: "900", letterSpacing: -0.6 },
  countBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, borderWidth: 1 },
  countBadgeText: { fontSize: 12, fontWeight: "800", fontFamily: "monospace" },
  card: { borderRadius: 14, borderWidth: 1, padding: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: { width: 42, height: 42, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  name: { fontSize: 15, fontWeight: "700" },
  ip: { fontSize: 12, marginTop: 2, fontFamily: "monospace", letterSpacing: 0.5 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  statusPillText: { fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  trafficRow: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 12, paddingTop: 10, borderTopWidth: 1 },
  traffic: { flexDirection: "row", alignItems: "center", gap: 5 },
  trafficText: { fontSize: 12, fontWeight: "700", fontFamily: "monospace" },
  toggleGroup: { flexDirection: "row", alignItems: "center", gap: 8 },
  toggleLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  blockBtn: { width: 34, height: 30, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center" },
});
