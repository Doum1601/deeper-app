import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProvider, useApp } from "@/src/contexts/AppContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";

function ThemedStack() {
  const { themeMode } = useApp();
  return (
    <>
      <StatusBar style={themeMode === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: themeMode === "dark" ? "#050505" : "#FAFAFA" } }} />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <ThemedStack />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
