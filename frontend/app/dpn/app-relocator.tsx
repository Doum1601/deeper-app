import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Pressable, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Trash2, Smartphone, X } from "lucide-react-native";
import { useApp } from "@/src/contexts/AppContext";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { CountryPickerModal } from "@/src/components/CountryPickerModal";
import { fetchState, addAppRelocation, removeAppRelocation, updateAppRelocationCountry, AppRelocation, COUNTRIES } from "@/src/api/deeper";

export default function AppRelocatorScreen() {
  const { colors, t } = useApp();
  const [items, setItems] = useState<AppRelocation[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [pickerFor, setPickerFor] = useState<{ id?: string; pendingApp?: { name: string; bundle: string } } | null>(null);
  const [appName, setAppName] = useState("");
  const [bundle, setBundle] = useState("");

  useEffect(() => { fetchState().then(s => setItems(s.appRelocations)); }, []);

  const onAdd = () => {
    if (!appName.trim() || !bundle.trim()) { Alert.alert("Champs requis"); return; }
    setAddOpen(false);
    setPickerFor({ pendingApp: { name: appName.trim(), bundle: bundle.trim() } });
  };

  const onPickCountry = async (code: string) => {
    if (pickerFor?.id) {
      const next = await updateAppRelocationCountry(pickerFor.id, code);
      setItems(next.appRelocations);
    } else if (pickerFor?.pendingApp) {
      const next = await addAppRelocation(pickerFor.pendingApp.name, pickerFor.pendingApp.bundle, code);
      setItems(next.appRelocations);
      setAppName(""); setBundle("");
    }
    setPickerFor(null);
  };

  const onRemove = async (id: string) => {
    const next = await removeAppRelocation(id);
    setItems(next.appRelocations);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.baseBg }]} edges={["top"]}>
      <ScreenHeader title={t("ar_title")} subtitle={t("ar_desc")} />

      <FlatList
        data={items}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={() => <Text style={{ color: colors.textSecondary, textAlign: "center", marginTop: 40 }}>—</Text>}
        renderItem={({ item }) => {
          const c = COUNTRIES.find(x => x.code === item.countryCode);
          return (
            <View testID={`ar-row-${item.id}`} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.appIcon, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <Smartphone size={18} color={colors.accentPrimary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.appName, { color: colors.textPrimary }]}>{item.appName}</Text>
                <Text style={[styles.appBundle, { color: colors.textMuted }]} numberOfLines={1}>{item.bundleId}</Text>
              </View>
              <TouchableOpacity
                testID={`ar-country-${item.id}`}
                onPress={() => setPickerFor({ id: item.id })}
                style={[styles.flagBtn, { borderColor: colors.borderStrong }]}
              >
                <Text style={{ fontSize: 18 }}>{c?.flag}</Text>
                <Text style={[styles.flagCode, { color: colors.textPrimary }]}>{c?.code}</Text>
              </TouchableOpacity>
              <TouchableOpacity testID={`ar-remove-${item.id}`} onPress={() => onRemove(item.id)} hitSlop={8} style={{ marginLeft: 6 }}>
                <Trash2 size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <TouchableOpacity testID="ar-fab" onPress={() => setAddOpen(true)} activeOpacity={0.85} style={[styles.fab, { backgroundColor: colors.accentPrimary }]}>
        <Plus size={20} color="#000" strokeWidth={2.5} />
        <Text style={styles.fabText}>{t("ar_add")}</Text>
      </TouchableOpacity>

      {/* Add modal */}
      <Modal visible={addOpen} transparent animationType="fade" onRequestClose={() => setAddOpen(false)}>
        <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={() => setAddOpen(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <Pressable style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.borderStrong }]} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{t("ar_add")}</Text>
                <TouchableOpacity testID="ar-modal-close" onPress={() => setAddOpen(false)} hitSlop={10}><X size={18} color={colors.textSecondary} /></TouchableOpacity>
              </View>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t("ar_app_name")}</Text>
              <TextInput
                testID="ar-app-input"
                value={appName}
                onChangeText={setAppName}
                placeholder={t("ar_app_placeholder")}
                placeholderTextColor={colors.textMuted}
                style={[styles.input, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.surfaceElevated }]}
              />
              <Text style={[styles.label, { color: colors.textSecondary, marginTop: 14 }]}>{t("ar_bundle")}</Text>
              <TextInput
                testID="ar-bundle-input"
                value={bundle}
                onChangeText={setBundle}
                autoCapitalize="none"
                placeholder={t("ar_bundle_placeholder")}
                placeholderTextColor={colors.textMuted}
                style={[styles.input, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.surfaceElevated, fontFamily: "monospace", fontSize: 13 }]}
              />
              <TouchableOpacity testID="ar-modal-next" onPress={onAdd} activeOpacity={0.85} style={[styles.modalBtn, { backgroundColor: colors.accentPrimary }]}>
                <Text style={{ color: "#000", fontWeight: "800" }}>{t("add")}</Text>
              </TouchableOpacity>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

      <CountryPickerModal visible={!!pickerFor} onClose={() => setPickerFor(null)} onPick={onPickCountry} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, borderWidth: 1 },
  appIcon: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  appName: { fontSize: 14, fontWeight: "800" },
  appBundle: { fontSize: 11, marginTop: 2, fontFamily: "monospace" },
  flagBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  flagCode: { fontSize: 12, fontWeight: "800", fontFamily: "monospace" },
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
