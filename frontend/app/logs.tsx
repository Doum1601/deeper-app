import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Activity, ChevronRight, AlertTriangle, Info, AlertCircle, Globe2, Shield, Smartphone, Cpu } from "lucide-react-native";
import { useApp } from "@/src/contexts/AppContext";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { fetchState, LogType, LogEntry } from "@/src/api/deeper";

const FILTERS: { key: LogType | "all"; tKey: any; icon: any }[] = [
  { key: "all", tKey: "logs_filter_all", icon: Activity },
  { key: "tunnel", tKey: "logs_filter_tunnel", icon: Globe2 },
  { key: "security", tKey: "logs_filter_security", icon: Shield },
  { key: "device", tKey: "logs_filter_device", icon: Smartphone },
  { key: "system", tKey: "logs_filter_system", icon: Cpu },
];

function levelIcon(level: LogEntry["level"], c: any) {
  if (level === "error") return <AlertCircle size={14} color={c.statusError} />;
  if (level === "warn") return <AlertTriangle size={14} color={c.statusWarning} />;
  return <Info size={14} color={c.accentPrimary} />;
}

function formatTime(ts: number, lang: string) {
  const d = new Date(ts);
  return d.toLocaleString(lang === "fr" ? "fr-FR" : "en-US", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function LogsScreen() {
  const { colors, t, lang } = useApp();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogType | "all">("all");

  useEffect(() => {
    fetchState().then(s => setLogs(s.logs));
    const id = setInterval(() => fetchState().then(s => setLogs(s.logs)), 5000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => filter === "all" ? logs : logs.filter(l => l.type === filter), [logs, filter]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.baseBg }]} edges={["top"]}>
      <ScreenHeader title={t("logs_title")} subtitle={`${filtered.length} évènements`} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {FILTERS.map(f => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              testID={`logs-filter-${f.key}`}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.8}
              style={[styles.chip, { borderColor: active ? colors.accentPrimary : colors.borderStrong, backgroundColor: active ? colors.surface : "transparent" }]}
            >
              <Text style={[styles.chipText, { color: active ? colors.textPrimary : colors.textSecondary }]}>{t(f.tKey)}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(l) => l.id}
        ItemSeparatorComponent={() => <View style={[styles.sep, { backgroundColor: colors.border }]} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, paddingTop: 4 }}
        ListEmptyComponent={() => (
          <Text style={{ color: colors.textSecondary, textAlign: "center", marginTop: 40 }}>{t("logs_empty")}</Text>
        )}
        renderItem={({ item }) => (
          <View testID={`log-${item.id}`} style={styles.logRow}>
            <View style={[styles.logIcon, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {levelIcon(item.level, colors)}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.logMsg, { color: colors.textPrimary }]} numberOfLines={2}>{item.message}</Text>
              <View style={styles.metaRow}>
                <Text style={[styles.logTime, { color: colors.textMuted }]}>{formatTime(item.ts, lang)}</Text>
                <View style={[styles.typeChip, { borderColor: colors.borderStrong }]}>
                  <Text style={[styles.typeChipText, { color: colors.textSecondary }]}>{item.type.toUpperCase()}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  filters: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, borderWidth: 1, marginRight: 8 },
  chipText: { fontSize: 12, fontWeight: "800", letterSpacing: 0.5 },
  logRow: { flexDirection: "row", gap: 12, paddingVertical: 12, alignItems: "flex-start", paddingHorizontal: 4 },
  logIcon: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  logMsg: { fontSize: 14, fontWeight: "600", lineHeight: 19 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  logTime: { fontSize: 11, fontFamily: "monospace", fontWeight: "700" },
  typeChip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  typeChipText: { fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  sep: { height: 1, marginLeft: 52 },
});
