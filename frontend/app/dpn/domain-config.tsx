import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Trash2, Globe } from "lucide-react-native";
import { useApp } from "@/src/contexts/AppContext";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { CountryPickerModal } from "@/src/components/CountryPickerModal";
import { fetchState, addDomainRule, removeDomainRule, updateDomainRule, DomainRule, COUNTRIES } from "@/src/api/deeper";

export default function DomainConfig() {
  const { colors, t } = useApp();
  const [items, setItems] = useState<DomainRule[]>([]);
  const [draft, setDraft] = useState("");
  const [picker, setPicker] = useState<{ id?: string; pendingDomain?: string } | null>(null);

  useEffect(() => { fetchState().then(s => setItems(s.domainRules)); }, []);

  const onAdd = () => {
    const d = draft.trim().toLowerCase();
    if (!d) { Alert.alert("Domaine requis"); return; }
    setPicker({ pendingDomain: d });
  };

  const onPick = async (code: string) => {
    if (picker?.id) {
      const next = await updateDomainRule(picker.id, code);
      setItems(next.domainRules);
    } else if (picker?.pendingDomain) {
      const next = await addDomainRule(picker.pendingDomain, code);
      setItems(next.domainRules);
      setDraft("");
    }
    setPicker(null);
  };

  const onRemove = async (id: string) => {
    const next = await removeDomainRule(id);
    setItems(next.domainRules);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.baseBg }]} edges={["top"]}>
      <ScreenHeader title={t("dc_title")} subtitle={t("dc_desc")} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.addRow}>
          <TextInput
            testID="dc-input"
            value={draft}
            onChangeText={setDraft}
            placeholder={t("dc_domain_placeholder")}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={[styles.input, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.surface }]}
          />
          <TouchableOpacity testID="dc-add" onPress={onAdd} activeOpacity={0.85} style={[styles.addBtn, { backgroundColor: colors.accentPrimary }]}>
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
              <View testID={`dc-row-${item.id}`} style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Globe size={14} color={colors.accentPrimary} />
                <Text style={[styles.domain, { color: colors.textPrimary }]}>{item.domain}</Text>
                <TouchableOpacity testID={`dc-country-${item.id}`} onPress={() => setPicker({ id: item.id })} style={[styles.flagBtn, { borderColor: colors.borderStrong }]}>
                  <Text style={{ fontSize: 16 }}>{c?.flag}</Text>
                  <Text style={[styles.flagCode, { color: colors.textPrimary }]}>{c?.code}</Text>
                </TouchableOpacity>
                <TouchableOpacity testID={`dc-remove-${item.id}`} onPress={() => onRemove(item.id)} hitSlop={8}>
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
  input: { flex: 1, height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 15 },
  addBtn: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  domain: { flex: 1, fontSize: 14, fontWeight: "700", fontFamily: "monospace" },
  flagBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 7, borderWidth: 1 },
  flagCode: { fontSize: 11, fontWeight: "800", fontFamily: "monospace" },
});
