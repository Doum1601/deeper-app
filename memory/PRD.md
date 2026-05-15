# Deeper Connect Controller — PRD

## Overview
Expo React Native mobile app that acts as a remote control for a Deeper Connect device (AtomOS dashboard at `34.34.34.34`). The app talks to the Deeper directly over the home Wi-Fi network. In the cloud preview (where 34.34.34.34 is unreachable), a built-in mock simulator returns realistic data so the full UI is interactive.

## Scope (v1 — essentials)
- Onboarding (welcome → network scan / manual IP → admin login)
- Local app lock with PIN + biometric (FaceID/TouchID)
- Tabs: Dashboard, DPN, Devices, Settings
- Dashboard: status, bandwidth sparkline, CPU/RAM/temp/uptime, quick toggles (DPN, mode, AdBlock, Parental)
- DPN: Smart/Full mode segmented control, country picker, active tunnels, add/remove tunnel, reboot Deeper
- Devices: list with per-device DPN toggle + block toggle
- Settings: theme (dark/light), language (FR/EN), PIN, biometric, IP, logout
- Multi-language FR/EN, multi-theme dark/light (switchable)

## Architecture
- **Frontend**: Expo Router, file-based routing, single `AppContext` provider (theme, lang, auth, lock, IP, demo).
- **Storage**: `@/src/utils/storage` (AsyncStorage for preferences, SecureStore for PIN).
- **Deeper API client**: `src/api/deeper.ts` — `pingDeeper()` to probe IP, mock simulator (`DeeperSimulator`) with rolling bandwidth, drifting hardware stats, tunnels, devices.
- **Backend**: minimal FastAPI (unused for v1, kept for future cloud-sync of multi-Deeper).
- **Charts**: react-native-svg sparklines for bandwidth.
- **Icons**: lucide-react-native (banned: emoji icons).

## Design
Archetype: Swiss & High-Contrast (dark-first), accent Cyan `#00E5FF` / Amber `#FFB300`.
- Mono font for technical readouts.
- Flat surfaces, 1px borders, no shadows in dark mode.
- All interactive elements have `testID` attributes.

## Out of scope (v1)
- Sécurité avancée: pare-feu, profils Strict/Basique
- Contrôle parental (profils enfants, horaires)
- Logs & Historique
- Multi-Deeper management
- Domain / IP routing config
- App Relocator

## Key Routes
- `/` → splash redirect
- `/onboarding/welcome`, `/onboarding/scan`, `/onboarding/login`
- `/lock` (PIN entry / setup)
- `/(tabs)/dashboard`, `/(tabs)/dpn`, `/(tabs)/devices`, `/(tabs)/settings`
