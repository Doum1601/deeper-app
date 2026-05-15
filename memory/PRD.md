# Deeper Connect Controller — PRD

## Overview
Expo React Native mobile app that acts as a remote control for a Deeper Connect device (AtomOS dashboard at `34.34.34.34`). The app talks to the Deeper directly over the home Wi-Fi network. In the cloud preview, a built-in mock simulator returns realistic data so the full UI is interactive.

## v1 — Essentials (shipped)
- Onboarding (welcome → network scan / manual IP → admin login)
- Local app lock with PIN + biometric (FaceID/TouchID)
- Tabs: Dashboard, DPN, Devices, Settings
- Dashboard with bandwidth sparklines + quick toggles
- DPN Smart/Full mode, country picker, tunnels, reboot
- Devices with per-device DPN/block toggles
- Multi-language FR/EN, multi-theme dark/light

## v2 — Extensions (shipped)
### Sécurité (5th tab)
- **Profils de sécurité** : Basique / Standard / Strict (segmented control + descriptions)
- **Menaces bloquées** : compteurs Malware / Trackers / Intrusions / Phishing en temps réel
- **AdBlock** : toggle global + écran d'exceptions (ajout/suppression de domaines)
- **Contrôle parental** : toggle global + écran de profils enfants détaillés

### Contrôle parental détaillé (`/security/parental-edit`)
- Nom du profil, appareils associés (chips), 6 catégories bloquées (adult, violence, gambling, social, gaming, shopping)
- Horaires d'accès : jours actifs (boutons J/L/M/M/V/S/D), heures début/fin
- Temps d'écran quotidien (minutes)
- Suppression / création

### Logs & Historique (`/logs`)
- Filtres : Tous / Tunnels / Sécurité / Appareils / Système
- Icônes par niveau (info / warn / error), timestamp localisé FR/EN
- Génération auto par le simulateur (à chaque action ⇒ log)

### Multi-Deeper (`/settings/multi-deeper`)
- Liste des Deepers enregistrés (Maison / Bureau / etc.)
- Ajout (label + IP), bascule rapide, suppression
- Persistance via AsyncStorage

### App Relocator (`/dpn/app-relocator`)
- Liste apps → pays (Netflix→US, BBC iPlayer→GB, Spotify→SG par défaut)
- Ajout (nom + bundleId + pays), changement de pays, suppression

### Domain Config (`/dpn/domain-config`)
- Liste domaines → pays (netflix.com→US, bbc.co.uk→GB, *.cn→JP par défaut)
- Ajout + changement + suppression

### IP Config (`/dpn/ip-config`)
- Liste plages IP/CIDR → pays (8.8.8.0/24→US, 1.1.1.0/24→AU par défaut)
- Ajout + changement + suppression

## Architecture
- **Frontend** : Expo Router, file-based routing, `AppContext` global (theme, lang, auth, lock, IP, demo, multi-Deeper).
- **Storage** : `@/src/utils/storage` (AsyncStorage + SecureStore pour PIN, et liste multi-Deeper).
- **Deeper API client** : `src/api/deeper.ts` — `DeeperSimulator` simule l'intégralité du AtomOS (status, bandwidth, threats, profils sécurité, parental, app/domain/IP rules, logs auto-générés).
- **Composants partagés** : `Sparkline`, `CountryPickerModal`, `ScreenHeader`.
- **Icons** : lucide-react-native.

## Routes
- `/` splash redirect
- `/onboarding/welcome` · `/onboarding/scan` · `/onboarding/login`
- `/lock` (PIN setup/entry, biometric)
- `/(tabs)/dashboard` · `/(tabs)/dpn` · `/(tabs)/security` · `/(tabs)/devices` · `/(tabs)/settings`
- `/security/adblock-exceptions` · `/security/parental` · `/security/parental-edit?id=…`
- `/dpn/app-relocator` · `/dpn/domain-config` · `/dpn/ip-config`
- `/settings/multi-deeper`
- `/logs`

## v3 candidates (not shipped)
- Diagnostics : test latence/débit vers nœuds DPN, export logs email/PDF
- Notifications push pour intrusions/temps d'écran
- WebView fallback vers AtomOS pour fonctions avancées
- Synchronisation Cloud des préférences (backend FastAPI déjà en place)
