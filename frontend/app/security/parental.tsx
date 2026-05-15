import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Users, ChevronRight, Plus, Clock } from "lucide-react-native";
import { useApp } from "@/src/contexts/AppContext";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { fetchState, ParentalProfile } from "@/src/api/deeper";

export default function ParentalProfiles() {
  const router = useRouter();
  const { colors, t } = useApp();
  const [profiles, setProfiles] = useState<ParentalProfile[]>([]);

  useEffect(() => {
    const refresh = () => fetchState().then(s => setProfiles(s.parentalProfiles));
    refresh();
    const id = setInterval(refresh, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.baseBg }]} edges={["top"]}>
      <ScreenHeader title={t("par_title")} subtitle={`${profiles.length}`} />

      <FlatList
        data={profiles}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, paddingTop: 8 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={() => <Text style={{ color: colors.textSecondary, textAlign: "center", marginTop: 40 }}>—</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            testID={`parental-profile-${item.id}`}
            onPress={() => router.push({ pathname: "/security/parental-edit", params: { id: item.id } })}
            activeOpacity={0.8}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
              <Users size={20} color={colors.accentPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.textPrimary }]}>{item.name}</Text>
              <Text style={[styles.sub, { color: colors.textMuted }]}>
                {item.deviceIds.length} appareil(s) · {item.blockedCategories.length} catégorie(s)
              </Text>
              {item.schedule && (
                <View style={styles.scheduleRow}>
                  <Clock size={11} color={colors.textMuted} />
                  <Text style={[styles.scheduleText, { color: colors.textMuted }]}>
                    {item.schedule.start} – {item.schedule.end}
                  </Text>
                </View>
              )}
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        testID="parental-new"
        onPress={() => router.push("/security/parental-edit")}
        activeOpacity={0.85}
        style={[styles.fab, { backgroundColor: colors.accentPrimary }]}
      >
        <Plus size={20} color="#000" strokeWidth={2.5} />
        <Text style={styles.fabText}>{t("par_new")}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  iconBox: { width: 42, height: 42, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  name: { fontSize: 15, fontWeight: "800" },
  sub: { fontSize: 12, marginTop: 2, fontWeight: "600" },
  scheduleRow: { flexDirection: "row", gap: 5, marginTop: 4, alignItems: "center" },
  scheduleText: { fontSize: 11, fontWeight: "700", fontFamily: "monospace" },
  fab: { position: "absolute", bottom: 28, right: 18, paddingHorizontal: 18, height: 50, borderRadius: 100, flexDirection: "row", alignItems: "center", gap: 8 },
  fabText: { color: "#000", fontSize: 14, fontWeight: "800", letterSpacing: 0.3 },
});
