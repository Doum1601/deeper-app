import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { useApp } from "@/src/contexts/AppContext";

interface Props {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export const ScreenHeader: React.FC<Props> = ({ title, subtitle, right }) => {
  const router = useRouter();
  const { colors } = useApp();
  return (
    <View style={[styles.wrap, { borderBottomColor: colors.border }]}>
      <View style={styles.row}>
        <TouchableOpacity testID="header-back" onPress={() => router.back()} hitSlop={10} style={styles.back}>
          <ChevronLeft size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.titleBox}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          {subtitle ? <Text style={[styles.sub, { color: colors.textMuted }]}>{subtitle}</Text> : null}
        </View>
        <View style={styles.right}>{right}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12, borderBottomWidth: 1 },
  row: { flexDirection: "row", alignItems: "center", minHeight: 40 },
  back: { padding: 6 },
  titleBox: { flex: 1, paddingHorizontal: 6 },
  title: { fontSize: 20, fontWeight: "900", letterSpacing: -0.5 },
  sub: { fontSize: 12, marginTop: 2 },
  right: { minWidth: 36, alignItems: "flex-end" },
});
