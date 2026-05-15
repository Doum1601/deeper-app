import React from "react";
import { Tabs } from "expo-router";
import { LayoutDashboard, Globe2, ShieldCheck, Smartphone, Settings as SettingsIcon } from "lucide-react-native";
import { useApp } from "@/src/contexts/AppContext";
import { Platform } from "react-native";

export default function TabsLayout() {
  const { colors, t } = useApp();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.accentPrimary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 86 : 68,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700", letterSpacing: 0.4 },
        sceneStyle: { backgroundColor: colors.baseBg },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t("tab_dashboard"),
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size - 2} strokeWidth={1.8} />,
          tabBarButtonTestID: "tab-dashboard",
        }}
      />
      <Tabs.Screen
        name="dpn"
        options={{
          title: t("tab_dpn"),
          tabBarIcon: ({ color, size }) => <Globe2 color={color} size={size - 2} strokeWidth={1.8} />,
          tabBarButtonTestID: "tab-dpn",
        }}
      />
      <Tabs.Screen
        name="security"
        options={{
          title: t("tab_security"),
          tabBarIcon: ({ color, size }) => <ShieldCheck color={color} size={size - 2} strokeWidth={1.8} />,
          tabBarButtonTestID: "tab-security",
        }}
      />
      <Tabs.Screen
        name="devices"
        options={{
          title: t("tab_devices"),
          tabBarIcon: ({ color, size }) => <Smartphone color={color} size={size - 2} strokeWidth={1.8} />,
          tabBarButtonTestID: "tab-devices",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("tab_settings"),
          tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={size - 2} strokeWidth={1.8} />,
          tabBarButtonTestID: "tab-settings",
        }}
      />
    </Tabs>
  );
}
