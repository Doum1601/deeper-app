import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Check, Trash2, Save, Clock } from "lucide-react-native";
import { useApp } from "@/src/contexts/AppContext";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { fetchState, upsertParentalProfile, removeParentalProfile, ParentalProfile, ParentalCategory, ConnectedDevice } from "@/src/api/deeper";

const CATS: ParentalCategory[] = ["adult", "violence", "gambling", "social", "gaming", "shopping"];
const WEEKDAY_KEYS = ["days_sun", "days_mon", "days_tue", "days_wed", "days_thu", "days_fri", "days_sat"] as const;

export default function ParentalEdit() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { colors, t } = useApp();
  const [devices, setDevices] = useState<ConnectedDevice[]>([]);
  const [name, setName] = useState("");
  const [deviceIds, setDeviceIds] = useState<string[]>([]);
  const [cats, setCats] = useState<ParentalCategory[]>([]);
  const [schedEnabled, setSchedEnabled] = useState(false);
  const [weekdays, setWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [start, setStart] = useState("07:00");
  const [end, setEnd] = useState("21:00");
  const [screenTime, setScreenTime] = useState("120");
  const [profileId, setProfileId] = useState<string>("");

  useEffect(() => {
    fetchState().then(s => {
      setDevices(s.devices);
      if (params.id) {
        const p = s.parentalProfiles.find(x => x.id === params.id);
        if (p) {
          setProfileId(p.id);
          setName(p.name);
          setDeviceIds(p.deviceIds);
          setCats(p.blockedCategories);
          setSchedEnabled(!!p.schedule);
          if (p.schedule) {
            setWeekdays(p.schedule.weekday);
            setStart(p.schedule.start);
            setEnd(p.schedule.end);
          }
          setScreenTime(String(p.screenTimeMinutes));
        }
      } else {
        setProfileId(`p_${Date.now()}`);
      }
    });
  }, [params.id]);

  const toggleArr = <T,>(arr: T[], v: T) => arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];

  const save = async () => {
    if (!name.trim()) { Alert.alert("Nom requis"); return; }
    const minutes = parseInt(screenTime || "0", 10);
    const p: ParentalProfile = {
      id: profileId,
      name: name.trim(),
      deviceIds,
      blockedCategories: cats,
      schedule: schedEnabled ? { weekday: weekdays, start, end } : null,
      screenTimeMinutes: isNaN(minutes) ? 0 : minutes,
    };
    await upsertParentalProfile(p);
    router.back();
  };

  const remove = async () => {
    if (!params.id) return;
    await removeParentalProfile(profileId);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.baseBg }]} edges={["top"]}>
      <ScreenHeader
        title={params.id ? t("par_edit") : t("par_new")}
        right={params.id ? (
          <TouchableOpacity testID="parental-delete" onPress={remove} hitSlop={8} style={styles.headerBtn}>
            <Trash2 size={20} color={colors.statusError} />
          </TouchableOpacity>
        ) : null}
      />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Name */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t("par_name")}</Text>
          <TextInput
            testID="parental-name-input"
            value={name}
            onChangeText={setName}
            placeholder={t("par_name_placeholder")}
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.surface }]}
          />

          {/* Devices */}
          <Text style={[styles.label, { color: colors.textSecondary, marginTop: 22 }]}>{t("par_devices")}</Text>
          <View style={styles.chipWrap}>
            {devices.map(d => {
              const active = deviceIds.includes(d.id);
              return (
                <TouchableOpacity
                  key={d.id}
                  testID={`parental-device-${d.id}`}
                  onPress={() => setDeviceIds(toggleArr(deviceIds, d.id))}
                  activeOpacity={0.8}
                  style={[styles.chip, { borderColor: active ? colors.accentPrimary : colors.borderStrong, backgroundColor: active ? colors.surface : "transparent" }]}
                >
                  <Text style={[styles.chipText, { color: active ? colors.textPrimary : colors.textSecondary }]}>{d.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Categories */}
          <Text style={[styles.label, { color: colors.textSecondary, marginTop: 22 }]}>{t("par_categories")}</Text>
          <View style={styles.chipWrap}>
            {CATS.map(c => {
              const active = cats.includes(c);
              return (
                <TouchableOpacity
                  key={c}
                  testID={`parental-cat-${c}`}
                  onPress={() => setCats(toggleArr(cats, c))}
                  activeOpacity={0.8}
                  style={[styles.chip, { borderColor: active ? colors.statusError : colors.borderStrong, backgroundColor: active ? "rgba(255,59,48,0.08)" : "transparent" }]}
                >
                  {active && <Check size={12} color={colors.statusError} />}
                  <Text style={[styles.chipText, { color: active ? colors.statusError : colors.textSecondary }]}>{t(`par_cat_${c}` as any)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Schedule */}
          <View style={[styles.scheduleHeader, { marginTop: 22 }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t("par_schedule")}</Text>
            <TouchableOpacity
              testID="parental-schedule-toggle"
              onPress={() => setSchedEnabled(!schedEnabled)}
              style={[styles.toggleBtn, { backgroundColor: schedEnabled ? colors.accentPrimary : colors.surfaceElevated, borderColor: schedEnabled ? colors.accentPrimary : colors.borderStrong }]}
            >
              <Text style={[styles.toggleBtnText, { color: schedEnabled ? "#000" : colors.textSecondary }]}>{schedEnabled ? t("on") : t("off")}</Text>
            </TouchableOpacity>
          </View>
          {schedEnabled && (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.smallLabel, { color: colors.textMuted }]}>{t("par_weekdays")}</Text>
              <View style={styles.weekRow}>
                {[0, 1, 2, 3, 4, 5, 6].map(d => {
                  const active = weekdays.includes(d);
                  return (
                    <TouchableOpacity
                      key={d}
                      testID={`parental-day-${d}`}
                      onPress={() => setWeekdays(toggleArr(weekdays, d).sort())}
                      style={[styles.dayBtn, { borderColor: active ? colors.accentPrimary : colors.borderStrong, backgroundColor: active ? colors.accentPrimary : "transparent" }]}
                    >
                      <Text style={[styles.dayText, { color: active ? "#000" : colors.textSecondary }]}>{t(WEEKDAY_KEYS[d])}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={styles.timeRow}>
                <View style={styles.timeField}>
                  <Text style={[styles.smallLabel, { color: colors.textMuted }]}>{t("par_start")}</Text>
                  <TextInput
                    testID="parental-start"
                    value={start}
                    onChangeText={setStart}
                    placeholder="07:00"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.timeInput, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.surfaceElevated }]}
                  />
                </View>
                <View style={styles.timeField}>
                  <Text style={[styles.smallLabel, { color: colors.textMuted }]}>{t("par_end")}</Text>
                  <TextInput
                    testID="parental-end"
                    value={end}
                    onChangeText={setEnd}
                    placeholder="21:00"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.timeInput, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.surfaceElevated }]}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Screen time */}
          <Text style={[styles.label, { color: colors.textSecondary, marginTop: 22 }]}>{t("par_screen_time")}</Text>
          <View style={[styles.input, { flexDirection: "row", alignItems: "center", borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 14 }]}>
            <Clock size={16} color={colors.textSecondary} />
            <TextInput
              testID="parental-screen-time"
              value={screenTime}
              onChangeText={setScreenTime}
              keyboardType="number-pad"
              style={{ flex: 1, color: colors.textPrimary, fontSize: 15, fontFamily: "monospace", marginLeft: 10 }}
            />
            <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: "700" }}>{t("par_minutes")}</Text>
          </View>

          <TouchableOpacity
            testID="parental-save"
            onPress={save}
            activeOpacity={0.85}
            style={[styles.saveBtn, { backgroundColor: colors.accentPrimary }]}
          >
            <Save size={16} color="#000" strokeWidth={2.5} />
            <Text style={styles.saveBtnText}>{t("par_save")}</Text>
          </TouchableOpacity>
          <View style={{ height: 36 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 60 },
  label: { fontSize: 11, fontWeight: "800", letterSpacing: 2, marginBottom: 10 },
  smallLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1.5, marginBottom: 8 },
  input: { height: 50, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 15 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 100, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: "700" },
  scheduleHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, borderWidth: 1, marginBottom: 10 },
  toggleBtnText: { fontSize: 11, fontWeight: "800" },
  card: { padding: 14, borderRadius: 12, borderWidth: 1 },
  weekRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  dayBtn: { width: 36, height: 36, borderRadius: 100, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  dayText: { fontSize: 12, fontWeight: "800" },
  timeRow: { flexDirection: "row", gap: 12 },
  timeField: { flex: 1 },
  timeInput: { height: 42, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, fontSize: 14, fontFamily: "monospace" },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52, borderRadius: 12, marginTop: 28 },
  saveBtnText: { color: "#000", fontSize: 15, fontWeight: "800" },
  headerBtn: { padding: 6 },
});
