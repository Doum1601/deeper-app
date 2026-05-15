import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, Modal, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Trash2, Router, Check, X } from "lucide-react-native";
import { useApp } from "@/src/contexts/AppContext";
import { ScreenHeader } from "@/src/components/ScreenHeader";

export default function MultiDeeperScreen() {
  const { colors, t, deepers, addDeeper, removeDeeper, switchDeeper, deeperIp } = useApp();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [ip, setIp] = useState("");

  const onSave = () => {
    if (!label.trim() || !ip.trim()) { Alert.alert("Champs requis"); return; }
    if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip.trim())) { Alert.alert("IP invalide", "Format : 192.168.0.1"); return; }
    addDeeper(label.trim(), ip.trim());
    setLabel(""); setIp(""); setOpen(false);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.baseBg }]} edges={["top"]}>
      <ScreenHeader title={t("md_title")} subtitle={`${deepers.length + 1} Deeper(s)`} />

      <FlatList
        data={deepers}
        keyExtractor={(d) => d.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListHeaderComponent={() => (
          <View testID="md-current" style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.accentPrimary, marginBottom: 14 }]}>
            <View style={[styles.iconBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.accentPrimary }]}>
              <Router size={20} color={colors.accentPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.rowGap}>
                <Text style={[styles.lbl, { color: colors.textPrimary }]}>Deeper actuel</Text>
                <View style={[styles.activePill, { backgroundColor: colors.accentPrimary }]}>
                  <Text style={styles.activePillText}>ACTIF</Text>
                </View>
              </View>
              <Text style={[styles.ip, { color: colors.textMuted }]}>{deeperIp}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={() => <Text style={{ color: colors.textSecondary, textAlign: "center", marginTop: 24 }}>{t("md_empty")}</Text>}
        renderItem={({ item }) => (
          <View testID={`md-row-${item.id}`} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.iconBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
              <Router size={18} color={colors.accentSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.lbl, { color: colors.textPrimary }]}>{item.label}</Text>
              <Text style={[styles.ip, { color: colors.textMuted }]}>{item.ip}</Text>
            </View>
            <TouchableOpacity testID={`md-switch-${item.id}`} onPress={() => switchDeeper(item.id)} style={[styles.switchBtn, { borderColor: colors.borderStrong }]}>
              <Check size={14} color={colors.accentPrimary} />
              <Text style={[styles.switchText, { color: colors.textPrimary }]}>{t("md_switch")}</Text>
            </TouchableOpacity>
            <TouchableOpacity testID={`md-remove-${item.id}`} onPress={() => removeDeeper(item.id)} hitSlop={8} style={{ marginLeft: 6 }}>
              <Trash2 size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity testID="md-fab" onPress={() => setOpen(true)} activeOpacity={0.85} style={[styles.fab, { backgroundColor: colors.accentPrimary }]}>
        <Plus size={20} color="#000" strokeWidth={2.5} />
        <Text style={styles.fabText}>{t("md_add")}</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={() => setOpen(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <Pressable style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.borderStrong }]} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{t("md_add")}</Text>
                <TouchableOpacity testID="md-modal-close" onPress={() => setOpen(false)} hitSlop={10}><X size={18} color={colors.textSecondary} /></TouchableOpacity>
              </View>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t("md_label")}</Text>
              <TextInput
                testID="md-label-input"
                value={label}
                onChangeText={setLabel}
                placeholder="Maison"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.surfaceElevated }]}
              />
              <Text style={[styles.label, { color: colors.textSecondary, marginTop: 14 }]}>{t("md_ip")}</Text>
              <TextInput
                testID="md-ip-input"
                value={ip}
                onChangeText={setIp}
                keyboardType="decimal-pad"
                placeholder="34.34.34.34"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.surfaceElevated, fontFamily: "monospace" }]}
              />
              <TouchableOpacity testID="md-save" onPress={onSave} activeOpacity={0.85} style={[styles.modalBtn, { backgroundColor: colors.accentPrimary }]}>
                <Text style={{ color: "#000", fontWeight: "800" }}>{t("save")}</Text>
              </TouchableOpacity>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  iconBox: { width: 42, height: 42, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  rowGap: { flexDirection: "row", alignItems: "center", gap: 8 },
  lbl: { fontSize: 15, fontWeight: "800" },
  ip: { fontSize: 12, marginTop: 2, fontFamily: "monospace", fontWeight: "700" },
  activePill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4 },
  activePillText: { color: "#000", fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  switchBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  switchText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.4 },
  fab: { position: "absolute", bottom: 28, right: 18, paddingHorizontal: 18, height: 50, borderRadius: 100, flexDirection: "row", alignItems: "center", gap: 8 },
  fabText: { color: "#000", fontSize: 14, fontWeight: "800", letterSpacing: 0.3 },
  backdrop: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  modalCard: { width: 340, maxWidth: "100%", borderRadius: 18, borderWidth: 1, padding: 18 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  modalTitle: { fontSize: 16, fontWeight: "800" },
  label: { fontSize: 10, fontWeight: "800", letterSpacing: 2, marginBottom: 6 },
  input: { height: 46, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, fontSize: 14 },
  modalBtn: { marginTop: 18, height: 46, borderRadius: 10, alignItems: "center", justifyContent: "center" },
});
