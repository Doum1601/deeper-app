import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Trash2, Globe } from "lucide-react-native";
import { useApp } from "@/src/contexts/AppContext";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { fetchState, addAdblockException, removeAdblockException } from "@/src/api/deeper";

export default function AdblockExceptions() {
  const { colors, t } = useApp();
  const [items, setItems] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => { fetchState().then(s => setItems(s.adblockExceptions)); }, []);

  const add = async () => {
    const d = draft.trim().toLowerCase();
    if (!d || items.includes(d)) return;
    const next = await addAdblockException(d);
    setItems(next.adblockExceptions);
    setDraft("");
  };

  const remove = async (d: string) => {
    const next = await removeAdblockException(d);
    setItems(next.adblockExceptions);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.baseBg }]} edges={["top"]}>
      <ScreenHeader title={t("sec_adblock_exceptions")} subtitle={`${items.length} ${t("sec_adblock")}`} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.addRow}>
          <TextInput
            testID="adblock-input"
            value={draft}
            onChangeText={setDraft}
            placeholder={t("sec_adblock_placeholder")}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={[styles.input, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.surface }]}
          />
          <TouchableOpacity testID="adblock-add" onPress={add} activeOpacity={0.8} style={[styles.addBtn, { backgroundColor: colors.accentPrimary }]}>
            <Plus size={20} color="#000" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={items}
          keyExtractor={(d) => d}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListEmptyComponent={() => <Text style={{ color: colors.textSecondary, textAlign: "center", marginTop: 32 }}>—</Text>}
          renderItem={({ item }) => (
            <View testID={`adblock-row-${item}`} style={[styles.itemRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.itemLeft}>
                <Globe size={16} color={colors.accentPrimary} />
                <Text style={[styles.itemText, { color: colors.textPrimary }]}>{item}</Text>
              </View>
              <TouchableOpacity testID={`adblock-remove-${item}`} onPress={() => remove(item)} hitSlop={10}>
                <Trash2 size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  addRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 16 },
  input: { flex: 1, height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 15 },
  addBtn: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  itemRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderRadius: 12, borderWidth: 1 },
  itemLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  itemText: { fontSize: 14, fontWeight: "700", fontFamily: "monospace" },
});
