import React, { useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Platform, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { AlertTriangle, RefreshCw, ExternalLink } from "lucide-react-native";
import { useApp } from "@/src/contexts/AppContext";
import { ScreenHeader } from "@/src/components/ScreenHeader";

// Conditional import: react-native-webview doesn't exist on web build
let WebView: any = null;
if (Platform.OS !== "web") {
  try { WebView = require("react-native-webview").WebView; } catch { /* ignore */ }
}

export default function AtomOSWebView() {
  const { colors, t, deeperIp } = useApp();
  const params = useLocalSearchParams<{ ip?: string }>();
  const targetIp = (params.ip as string) || deeperIp || "34.34.34.34";
  const url = `http://${targetIp}/`;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const isWeb = Platform.OS === "web";

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.baseBg }]} edges={["top", "bottom"]}>
      <ScreenHeader
        title={t("webview_title")}
        subtitle={url}
        right={(
          <TouchableOpacity testID="webview-reload" onPress={() => { setError(null); setLoading(true); setReloadKey(k => k + 1); }} hitSlop={8} style={styles.headerBtn}>
            <RefreshCw size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
      />

      {isWeb || !WebView ? (
        <View style={styles.center}>
          <View style={[styles.iconBox, { borderColor: colors.borderStrong, backgroundColor: colors.surface }]}>
            <AlertTriangle size={36} color={colors.statusWarning} strokeWidth={1.5} />
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{t("webview_not_native")}</Text>
          <Text style={[styles.help, { color: colors.textSecondary }]}>
            Sur la preview web, les navigateurs bloquent l'accès HTTP à votre réseau local (mixed content). Téléchargez l'app native ou ouvrez le lien dans votre navigateur lorsque vous êtes sur le Wi-Fi maison.
          </Text>
          <TouchableOpacity
            testID="webview-open-browser"
            onPress={() => Linking.openURL(url)}
            activeOpacity={0.85}
            style={[styles.openBtn, { backgroundColor: colors.accentPrimary }]}
          >
            <ExternalLink size={16} color="#000" strokeWidth={2.5} />
            <Text style={styles.openBtnText}>{t("webview_open_browser")}</Text>
          </TouchableOpacity>
          <Text style={[styles.urlLabel, { color: colors.textMuted }]}>{url}</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <View style={[styles.iconBox, { borderColor: colors.borderStrong, backgroundColor: colors.surface }]}>
            <AlertTriangle size={36} color={colors.statusError} strokeWidth={1.5} />
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{t("webview_error")}</Text>
          <Text style={[styles.help, { color: colors.textSecondary }]}>{t("webview_error_msg")}</Text>
          <TouchableOpacity testID="webview-retry" onPress={() => { setError(null); setLoading(true); setReloadKey(k => k + 1); }} activeOpacity={0.85} style={[styles.openBtn, { backgroundColor: colors.accentPrimary }]}>
            <RefreshCw size={16} color="#000" strokeWidth={2.5} />
            <Text style={styles.openBtnText}>{t("webview_retry")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <WebView
            key={reloadKey}
            testID="webview-frame"
            source={{ uri: url }}
            originWhitelist={["*"]}
            startInLoadingState
            onLoadEnd={() => setLoading(false)}
            onError={(e: any) => { setLoading(false); setError(e?.nativeEvent?.description || "load_error"); }}
            onHttpError={(e: any) => { setLoading(false); setError(`HTTP ${e?.nativeEvent?.statusCode}`); }}
            allowsBackForwardNavigationGestures
            domStorageEnabled
            javaScriptEnabled
            mixedContentMode="always"
            style={{ flex: 1, backgroundColor: colors.baseBg }}
          />
          {loading && (
            <View style={[styles.loaderOverlay, { backgroundColor: colors.baseBg }]}>
              <ActivityIndicator color={colors.accentPrimary} size="large" />
              <Text style={[styles.loaderText, { color: colors.textSecondary }]}>{t("webview_loading")}</Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerBtn: { padding: 6 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  iconBox: { width: 72, height: 72, borderRadius: 18, borderWidth: 1, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  title: { fontSize: 20, fontWeight: "900", textAlign: "center", letterSpacing: -0.3 },
  help: { fontSize: 13, marginTop: 10, lineHeight: 20, textAlign: "center", maxWidth: 320 },
  openBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 18, height: 48, borderRadius: 12, marginTop: 24 },
  openBtnText: { color: "#000", fontSize: 14, fontWeight: "800" },
  urlLabel: { fontSize: 12, fontFamily: "monospace", marginTop: 14 },
  loaderOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center", gap: 14 },
  loaderText: { fontSize: 13, fontWeight: "700", letterSpacing: 0.3 },
});
