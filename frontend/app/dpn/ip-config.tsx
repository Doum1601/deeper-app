import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Trash2, Network } from "lucide-react-native";
import { useApp } from "@/src/contexts/AppContext";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { CountryPickerModal } from "@/src/components/CountryPickerModal";
import { fetchState, addIpRule, removeIpRule, updateIpRule, IpRule, COUNTRIES } from "@/src/api/deeper";

export default function IpConfig() {
  const { colors, t } = useApp();
  const [items, setItems] = useState<IpRule[]>([]);
  const [draft, setDraft] = useState("");
  const [picker, setPicker] = useState<{ id?: string; pendingCidr?: string } | null>(null);

  useEffect(() => { fetchState().then(s => setItems(s.ipRules)); }, []);

  const onAdd = () => {
    const d = draft.trim();
    if (!d) { Alert.alert("IP requise"); return; }
    setPicker({ pendingCidr: d });
  };

  const onPick = async (code: string) => {
    if (picker?.id) {
      const next = await updateIpRule(picker.id, code);
      setItems(next.ipRules);
    } else if (picker?.pendingCidr) {
      const next = await addIpRule(picker.pendingCidr, code);
      setItems(next.ipRules);
      setDraft("");
    }
    setPicker(null);
  };

  const onRemove = async (id: string) => {
    const next = await removeIpRule(id);
    setItems(next.ipRules);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.baseBg }]} edges={["top"]}>
      <ScreenHeader title={t("ic_title")} subtitle={t("ic_desc")} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.addRow}>
          <TextInput
            testID="ic-input"
            value={draft}
            onChangeText={setDraft}
            placeholder={t("ic_cidr_placeholder")}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.input, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.surface }]}
          />
          <TouchableOpacity testID="ic-add" onPress={onAdd} activeOpacity={0.85} style={[styles.addBtn, { backgroundColor: colors.accentPrimary }]}>
            <Plus size={20} color="#000" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={items}
          keyExtractor={(d) => d.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListEmptyComponent={() => <Text style={{ color: colors.textSecondary, textAlign: "center", marginTop: 32 }}>—</Text>}
          renderItem={({ item }) => {
            const c = COUNTRIES.find(x => x.code === item.countryCode);
            return (
              <View testID={`ic-row-${item.id}`} style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Network size={14} color={colors.accentPrimary} />
                <Text style={[styles.cidr, { color: colors.textPrimary }]}>{item.cidr}</Text>
                <TouchableOpacity testID={`ic-country-${item.id}`} onPress={() => setPicker({ id: item.id })} style={[styles.flagBtn, { borderColor: colors.borderStrong }]}>
                  <Text style={{ fontSize: 16 }}>{c?.flag}</Text>
                  <Text style={[styles.flagCode, { color: colors.textPrimary }]}>{c?.code}</Text>
                </TouchableOpacity>
                <TouchableOpacity testID={`ic-remove-${item.id}`} onPress={() => onRemove(item.id)} hitSlop={8}>
                  <Trash2 size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </KeyboardAvoidingView>
      <CountryPickerModal visible={!!picker} onClose={() => setPicker(null)} onPick={onPick} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  addRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 16 },
  input: { flex: 1, height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 15, fontFamily: "monospace" },
  addBtn: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  cidr: { flex: 1, fontSize: 14, fontWeight: "700", fontFamily: "monospace" },
  flagBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 7, borderWidth: 1 },
  flagCode: { fontSize: 11, fontWeight: "800", fontFamily: "monospace" },
});
