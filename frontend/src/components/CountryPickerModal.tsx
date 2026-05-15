import React from "react";
import { View, Text, Modal, Pressable, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { X, Check } from "lucide-react-native";
import { COUNTRIES, Country } from "@/src/api/deeper";
import { useApp } from "@/src/contexts/AppContext";

interface Props {
  visible: boolean;
  selected?: string;
  onClose: () => void;
  onPick: (code: string) => void;
  title?: string;
}

export const CountryPickerModal: React.FC<Props> = ({ visible, selected, onClose, onPick, title }) => {
  const { colors, t } = useApp();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={onClose}>
        <Pressable style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderStrong }]} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{title || t("dpn_select_country")}</Text>
            <TouchableOpacity testID="modal-close" onPress={onClose} hitSlop={10}>
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
                onPress={() => onPick(item.code)}
                style={[styles.row, { borderBottomColor: colors.border }]}
              >
                <View style={styles.rowLeft}>
                  <Text style={{ fontSize: 22 }}>{item.flag}</Text>
                  <Text style={[styles.name, { color: colors.textPrimary }]}>{item.name}</Text>
                </View>
                {item.code === selected && <Check size={18} color={colors.accentPrimary} />}
              </TouchableOpacity>
            )}
            style={{ maxHeight: 420 }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  card: { width: "100%", maxWidth: 420, borderRadius: 18, borderWidth: 1, padding: 6, overflow: "hidden" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  title: { fontSize: 17, fontWeight: "800" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderBottomWidth: 1 },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  name: { fontSize: 15, fontWeight: "700" },
});
