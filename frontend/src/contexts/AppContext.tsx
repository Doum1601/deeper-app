import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance } from "react-native";
import { storage } from "@/src/utils/storage";
import { darkTheme, lightTheme, ThemeColors } from "@/src/theme/colors";
import { Lang, TKey, translations } from "@/src/i18n/translations";
import { configureClient } from "@/src/api/deeper";

type ThemeMode = "dark" | "light";

export interface DeeperRecord { id: string; label: string; ip: string; active: boolean; }

interface AppContextValue {
  // theme
  themeMode: ThemeMode;
  colors: ThemeColors;
  setThemeMode: (m: ThemeMode) => void;
  // language
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey) => string;
  // connection
  deeperIp: string;
  setDeeperIp: (ip: string) => void;
  demoMode: boolean;
  setDemoMode: (v: boolean) => void;
  // auth
  authed: boolean;
  setAuthed: (v: boolean) => void;
  remember: boolean;
  setRemember: (v: boolean) => void;
  // pin / lock
  pin: string | null;
  setPin: (p: string | null) => Promise<void>;
  biometricEnabled: boolean;
  setBiometricEnabled: (v: boolean) => void;
  appLocked: boolean;
  setAppLocked: (v: boolean) => void;
  hydrated: boolean;
  // session
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const K = {
  theme: "deeper.theme",
  lang: "deeper.lang",
  ip: "deeper.ip",
  demo: "deeper.demo",
  remember: "deeper.remember",
  bio: "deeper.bio",
  pin: "deeper.pin", // secure
  authed: "deeper.authed",
  deepers: "deeper.devices",
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const sysTheme = (Appearance.getColorScheme() === "light" ? "light" : "dark") as ThemeMode;
  const [themeMode, setThemeModeState] = useState<ThemeMode>("dark");
  const [lang, setLangState] = useState<Lang>("fr");
  const [deeperIp, setDeeperIpState] = useState<string>("34.34.34.34");
  const [demoMode, setDemoModeState] = useState<boolean>(true);
  const [authed, setAuthedState] = useState<boolean>(false);
  const [remember, setRememberState] = useState<boolean>(false);
  const [pin, setPinState] = useState<string | null>(null);
  const [biometricEnabled, setBiometricEnabledState] = useState<boolean>(false);
  const [appLocked, setAppLocked] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [deepers, setDeepers] = useState<DeeperRecord[]>([]);

  // Hydrate from storage
  useEffect(() => {
    (async () => {
      const [savedTheme, savedLang, savedIp, savedDemo, savedRem, savedBio, savedPin, savedAuth, savedDeepers] = await Promise.all([
        storage.getItem<string>(K.theme, ""),
        storage.getItem<string>(K.lang, ""),
        storage.getItem<string>(K.ip, ""),
        storage.getItem<boolean>(K.demo, true),
        storage.getItem<boolean>(K.remember, false),
        storage.getItem<boolean>(K.bio, false),
        storage.secureGet<string>(K.pin, ""),
        storage.getItem<boolean>(K.authed, false),
        storage.getItem<string>(K.deepers, ""),
      ]);
      if (savedTheme === "dark" || savedTheme === "light") setThemeModeState(savedTheme);
      else setThemeModeState(sysTheme);
      if (savedLang === "fr" || savedLang === "en") setLangState(savedLang);
      if (savedIp) setDeeperIpState(savedIp);
      setDemoModeState(savedDemo ?? true);
      setRememberState(!!savedRem);
      setBiometricEnabledState(!!savedBio);
      setPinState(savedPin && savedPin.length >= 4 ? savedPin : null);
      const isAuthed = !!savedRem && !!savedAuth;
      setAuthedState(isAuthed);
      // If app should be locked at startup
      if (isAuthed && (savedPin || savedBio)) setAppLocked(true);
      configureClient({ ip: savedIp || "34.34.34.34", demo: savedDemo ?? true });
      try {
        const parsed: DeeperRecord[] = savedDeepers ? JSON.parse(savedDeepers) : [];
        if (Array.isArray(parsed)) setDeepers(parsed);
      } catch (e) { console.warn("Failed to parse saved Deepers list:", e); }
      setHydrated(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setThemeMode = useCallback((m: ThemeMode) => {
    setThemeModeState(m);
    storage.setItem(K.theme, m);
  }, []);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    storage.setItem(K.lang, l);
  }, []);
  const setDeeperIp = useCallback((ip: string) => {
    setDeeperIpState(ip);
    storage.setItem(K.ip, ip);
    configureClient({ ip, demo: demoMode });
  }, [demoMode]);
  const setDemoMode = useCallback((v: boolean) => {
    setDemoModeState(v);
    storage.setItem(K.demo, v);
    configureClient({ ip: deeperIp, demo: v });
  }, [deeperIp]);
  const setAuthed = useCallback((v: boolean) => {
    setAuthedState(v);
    if (remember) storage.setItem(K.authed, v);
  }, [remember]);
  const setRemember = useCallback((v: boolean) => {
    setRememberState(v);
    storage.setItem(K.remember, v);
    if (!v) storage.removeItem(K.authed);
  }, []);
  const setPin = useCallback(async (p: string | null) => {
    setPinState(p);
    if (p) await storage.secureSet(K.pin, p);
    else await storage.secureRemove(K.pin);
  }, []);
  const setBiometricEnabled = useCallback((v: boolean) => {
    setBiometricEnabledState(v);
    storage.setItem(K.bio, v);
  }, []);

  const logout = useCallback(async () => {
    setAuthedState(false);
    setAppLocked(false);
    await storage.removeItem(K.authed);
  }, []);

  const persistDeepers = useCallback((list: DeeperRecord[]) => {
    setDeepers(list);
    storage.setItem(K.deepers, JSON.stringify(list));
  }, []);

  const addDeeper = useCallback((label: string, ip: string) => {
    const item: DeeperRecord = { id: `dpr_${Date.now()}`, label, ip, active: false };
    persistDeepers([...deepers, item]);
  }, [deepers, persistDeepers]);

  const removeDeeper = useCallback((id: string) => {
    persistDeepers(deepers.filter(d => d.id !== id));
  }, [deepers, persistDeepers]);

  const switchDeeper = useCallback((id: string) => {
    const target = deepers.find(d => d.id === id);
    if (!target) return;
    persistDeepers(deepers.map(d => ({ ...d, active: d.id === id })));
    setDeeperIpState(target.ip);
    storage.setItem(K.ip, target.ip);
    configureClient({ ip: target.ip, demo: demoMode });
  }, [deepers, demoMode, persistDeepers]);

  const colors = themeMode === "dark" ? darkTheme : lightTheme;
  const t = useCallback((key: TKey) => translations[lang][key] ?? key, [lang]);

  const value = useMemo<AppContextValue>(() => ({
    themeMode, colors, setThemeMode,
    lang, setLang, t,
    deeperIp, setDeeperIp, demoMode, setDemoMode,
    authed, setAuthed, remember, setRemember,
    pin, setPin, biometricEnabled, setBiometricEnabled,
    appLocked, setAppLocked, hydrated,
    deepers, addDeeper, removeDeeper, switchDeeper,
    logout,
  }), [themeMode, colors, setThemeMode, lang, setLang, t, deeperIp, setDeeperIp, demoMode, setDemoMode, authed, setAuthed, remember, setRemember, pin, setPin, biometricEnabled, setBiometricEnabled, appLocked, hydrated, deepers, addDeeper, removeDeeper, switchDeeper, logout]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
};
