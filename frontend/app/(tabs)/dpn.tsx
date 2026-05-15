import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable, ActivityIndicator, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Globe2, Plus, Power, RotateCw, Check, X, ChevronRight, Zap, Signal, Trash2 } from "lucide-react-native";
import { useApp } from "@/src/contexts/AppContext";
import { fetchState, setMode, setCountry, addTunnel, removeTunnel, rebootDeeper, DeeperState, DpnMode, COUNTRIES, Country } from "@/src/api/deeper";

function latencyColor(ms: number, c: any) {
  if (ms < 60) return c.statusSuccess;
  if (ms < 150) return c.statusWarning;
  return c.statusError;
}

export default function DPN() {
  const { colors, t } = useApp();
  const [state, setState] = useState<DeeperState | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerAction, setPickerAction] = useState<"country" | "addTunnel">("country");
  const [rebootOpen, setRebootOpen] = useState(false);
  const [rebooting, setRebooting] = useState(false);

  useEffect(() => {
    fetchState().then(setState);
    const id = setInterval(() => fetchState().then(setState), 3000);
    return () => clearInterval(id);
  }, []);

  if (!state) {
    return <SafeAreaView style={[styles.safe, { backgroundColor: colors.baseBg, justifyContent: "center", alignItems: "center" }]}><ActivityIndicator color={colors.accentPrimary} /></SafeAreaView>;
  }

  const onModeChange = async (m: DpnMode) => { setState(await setMode(m)); };
  const onPickCountry = async (code: string) => {
    setPickerOpen(false);
    if (pickerAction === "country") setState(await setCountry(code));
    else setState(await addTunnel(code));
  };
  const onRemoveTunnel = async (id: string) => { setState(await removeTunnel(id)); };
  const doReboot = async () => {
    setRebooting(true);
    await rebootDeeper();
    setTimeout(() => { setRebooting(false); setRebootOpen(false); fetchState().then(setState); }, 1200);
  };

  const country = COUNTRIES.find(c => c.code === state.selectedCountry);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.baseBg }]} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.h1, { color: colors.textPrimary }]}>{t("dpn_title")}</Text>

        {/* Mode segmented */}
        <Text style={[styles.section, { color: colors.textSecondary }]}>{t("dpn_mode")}</Text>
        <View style={[styles.segment, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <TouchableOpacity
            testID="dpn-mode-smart"
            onPress={() => onModeChange("smart")}
            activeOpacity={0.8}
            style={[styles.segmentItem, state.mode === "smart" && { backgroundColor: colors.surface, borderColor: colors.accentPrimary }]}
          >
            <Zap size={14} color={state.mode === "smart" ? colors.accentPrimary : colors.textSecondary} />
            <Text style={[styles.segmentText, { color: state.mode === "smart" ? colors.textPrimary : colors.textSecondary }]}>{t("dash_mode_smart")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="dpn-mode-full"
            onPress={() => onModeChange("full")}
            activeOpacity={0.8}
            style={[styles.segmentItem, state.mode === "full" && { backgroundColor: colors.surface, borderColor: colors.accentPrimary }]}
          >
            <Globe2 size={14} color={state.mode === "full" ? colors.accentPrimary : colors.textSecondary} />
            <Text style={[styles.segmentText, { color: state.mode === "full" ? colors.textPrimary : colors.textSecondary }]}>{t("dash_mode_full")}</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.help, { color: colors.textMuted }]}>{state.mode === "smart" ? t("dpn_smart_desc") : t("dpn_full_desc")}</Text>

        {/* Country picker if Full Route */}
        {state.mode === "full" && (
          <>
            <Text style={[styles.section, { color: colors.textSecondary, marginTop: 22 }]}>{t("dpn_country")}</Text>
            <TouchableOpacity
              testID="dpn-country-picker"
              onPress={() => { setPickerAction("country"); setPickerOpen(true); }}
              activeOpacity={0.8}
              style={[styles.countryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.iconLabel}>
                <Text style={{ fontSize: 28 }}>{country?.flag}</Text>
                <View>
                  <Text style={[styles.countryName, { color: colors.textPrimary }]}>{country?.name}</Text>
                  <Text style={[styles.countryCode, { color: colors.textMuted }]}>{country?.code} · {t("dpn_change_node")}</Text>
                </View>
              </View>
              <ChevronRight color={colors.textSecondary} size={20} />
            </TouchableOpacity>
          </>
        )}

        {/* Tunnels */}
        <View style={styles.tunnelHeader}>
          <Text style={[styles.section, { color: colors.textSecondary }]}>{t("dpn_active_tunnels")}</Text>
          <View style={[styles.countPill, { borderColor: colors.borderStrong }]}>
            <Text style={[styles.countPillText, { color: colors.textSecondary }]}>{state.tunnels.length}</Text>
          </View>
        </View>

        {state.tunnels.map(tn => {
          const c = COUNTRIES.find(x => x.code === tn.countryCode);
          return (
            <View key={tn.id} testID={`tunnel-${tn.id}`} style={[styles.tunnelCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.tunnelLeft}>
                <Text style={{ fontSize: 22 }}>{c?.flag}</Text>
                <View>
                  <Text style={[styles.tunnelName, { color: colors.textPrimary }]}>{tn.name}</Text>
                  <View style={styles.tunnelMeta}>
                    <Signal size={11} color={latencyColor(tn.latencyMs, colors)} />
                    <Text style={[styles.tunnelMetaText, { color: latencyColor(tn.latencyMs, colors) }]}>{tn.latencyMs} ms</Text>
                    <Text style={[styles.tunnelMetaSep, { color: colors.textMuted }]}>·</Text>
                    <Text style={[styles.tunnelMetaText, { color: colors.textMuted }]}>{tn.throughputMbps} Mbps</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity testID={`tunnel-remove-${tn.id}`} onPress={() => onRemoveTunnel(tn.id)} hitSlop={10} style={styles.tunnelRemove}>
                <Trash2 size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          );
        })}

        <TouchableOpacity
          testID="dpn-add-tunnel"
          onPress={() => { setPickerAction("addTunnel"); setPickerOpen(true); }}
          activeOpacity={0.7}
          style={[styles.addTunnel, { borderColor: colors.borderStrong }]}
        >
          <Plus size={18} color={colors.accentPrimary} />
          <Text style={[styles.addTunnelText, { color: colors.accentPrimary }]}>{t("dpn_add_tunnel")}</Text>
        </TouchableOpacity>

        {/* Danger zone */}
        <Text style={[styles.section, { color: colors.textSecondary, marginTop: 26 }]}>DANGER ZONE</Text>
        <TouchableOpacity
          testID="dpn-reboot-button"
          onPress={() => setRebootOpen(true)}
          activeOpacity={0.8}
          style={[styles.rebootBtn, { borderColor: colors.statusError, backgroundColor: colors.surface }]}
        >
          <Power size={18} color={colors.statusError} />
          <Text style={[styles.rebootText, { color: colors.statusError }]}>{t("dpn_reboot")}</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Country picker modal */}
      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <Pressable style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]} onPress={() => setPickerOpen(false)}>
          <Pressable style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.borderStrong }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{t("dpn_select_country")}</Text>
              <TouchableOpacity testID="modal-close" onPress={() => setPickerOpen(false)} hitSlop={10}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(c: Country) => c.code}
              renderItem={({ item }: { item: Country }) => (
                <TouchableOpacity
                  testID={`country-pick-${item.code}`}
                  activeOpacity={0.7}
                  onPress={() => onPickCountry(item.code)}
                  style={[styles.countryRow, { borderBottomColor: colors.border }]}
                >
                  <View style={styles.iconLabel}>
                    <Text style={{ fontSize: 22 }}>{item.flag}</Text>
                    <Text style={[styles.countryName, { color: colors.textPrimary }]}>{item.name}</Text>
                  </View>
                  {item.code === state.selectedCountry && pickerAction === "country" && (
                    <Check size={18} color={colors.accentPrimary} />
                  )}
                </TouchableOpacity>
              )}
              style={{ maxHeight: 420 }}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Reboot confirmation */}
      <Modal visible={rebootOpen} transparent animationType="fade" onRequestClose={() => !rebooting && setRebootOpen(false)}>
        <View style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}>
          <View style={[styles.confirmCard, { backgroundColor: colors.surface, borderColor: colors.borderStrong }]}>
            <View style={[styles.confirmIcon, { backgroundColor: "rgba(255,59,48,0.12)" }]}>
              <RotateCw size={26} color={colors.statusError} />
            </View>
            <Text style={[styles.confirmTitle, { color: colors.textPrimary }]}>{t("dpn_reboot_confirm")}</Text>
            <Text style={[styles.confirmMsg, { color: colors.textSecondary }]}>{t("dpn_reboot_msg")}</Text>

            {rebooting ? (
              <View style={styles.rebootingRow}>
                <ActivityIndicator color={colors.accentPrimary} />
                <Text style={[styles.rebootingText, { color: colors.textSecondary }]}>{t("dpn_reboot_doing")}</Text>
              </View>
            ) : (
              <View style={styles.confirmActions}>
                <TouchableOpacity testID="reboot-cancel" onPress={() => setRebootOpen(false)} style={[styles.cancelBtn, { borderColor: colors.borderStrong }]}>
                  <Text style={[styles.cancelText, { color: colors.textPrimary }]}>{t("dpn_cancel")}</Text>
                </TouchableOpacity>
                <TouchableOpacity testID="reboot-confirm" onPress={doReboot} style={[styles.confirmBtn, { backgroundColor: colors.statusError }]}>
                  <Text style={[styles.confirmBtnText, { color: "#fff" }]}>{t("dpn_confirm")}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 80 },
  h1: { fontSize: 28, fontWeight: "900", letterSpacing: -0.6, marginBottom: 4 },
  section: { fontSize: 11, fontWeight: "800", letterSpacing: 2, marginTop: 22, marginBottom: 10 },
  iconLabel: { flexDirection: "row", alignItems: "center", gap: 12 },
  segment: { flexDirection: "row", borderRadius: 12, borderWidth: 1, padding: 4, gap: 4 },
  segmentItem: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 11, borderRadius: 9, borderWidth: 1, borderColor: "transparent" },
  segmentText: { fontSize: 13, fontWeight: "800", letterSpacing: 0.5 },
  help: { fontSize: 12, marginTop: 10, lineHeight: 18 },
  countryCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderRadius: 14, borderWidth: 1 },
  countryName: { fontSize: 15, fontWeight: "700" },
  countryCode: { fontSize: 12, marginTop: 2, fontWeight: "600", letterSpacing: 0.5 },
  tunnelHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  countPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 100, borderWidth: 1, marginTop: 14 },
  countPillText: { fontSize: 11, fontWeight: "800", fontFamily: "monospace" },
  tunnelCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  tunnelLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  tunnelName: { fontSize: 14, fontWeight: "700", fontFamily: "monospace" },
  tunnelMeta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  tunnelMetaText: { fontSize: 11, fontWeight: "700", fontFamily: "monospace" },
  tunnelMetaSep: { fontSize: 11 },
  tunnelRemove: { padding: 8 },
  addTunnel: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 12, borderWidth: 1, borderStyle: "dashed", marginTop: 8 },
  addTunnelText: { fontSize: 13, fontWeight: "800", letterSpacing: 0.5 },
  rebootBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: 16, borderRadius: 12, borderWidth: 1 },
  rebootText: { fontSize: 14, fontWeight: "800", letterSpacing: 0.5 },
  modalBackdrop: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  modalCard: { width: "100%", maxWidth: 420, borderRadius: 18, borderWidth: 1, padding: 6, overflow: "hidden" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  modalTitle: { fontSize: 17, fontWeight: "800" },
  countryRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderBottomWidth: 1 },
  confirmCard: { width: "100%", maxWidth: 380, borderRadius: 18, borderWidth: 1, padding: 24, alignItems: "center" },
  confirmIcon: { width: 56, height: 56, borderRadius: 100, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  confirmTitle: { fontSize: 18, fontWeight: "800", marginBottom: 8, textAlign: "center" },
  confirmMsg: { fontSize: 13, textAlign: "center", lineHeight: 20, marginBottom: 22 },
  confirmActions: { flexDirection: "row", gap: 10, width: "100%" },
  cancelBtn: { flex: 1, height: 46, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  cancelText: { fontSize: 14, fontWeight: "700" },
  confirmBtn: { flex: 1, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  confirmBtnText: { fontSize: 14, fontWeight: "800" },
  rebootingRow: { flexDirection: "row", gap: 10, alignItems: "center", marginTop: 4 },
  rebootingText: { fontSize: 14, fontWeight: "700" },
});
