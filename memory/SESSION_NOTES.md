# Notes de session — 2026-06-24

## Contexte
Projet récupéré depuis GitHub (Doum1601/deeper-app) : app Expo/React Native
« Deeper Connect Controller ». L'APK natif fonctionne. Objectif de la session :
faire tourner l'aperçu et permettre des tests rapides sans rebuild d'APK.

## Corrigé (réel, confirmé)
- **`frontend/.env` corrompu** : un message d'erreur shell (`sh: 0: getcwd() failed...`)
  s'était collé dans `EXPO_PACKAGER_PROXY_URL` → URL invalide → démarrage cassé. Réparé.
- **Port de service web** : `expo start` écoutait sur 8081 alors que l'ingress attend 3000.
  Script `start` passé à `expo start --port 3000` (dans `package.json`). Aperçu web charge (200).

## Diagnostiqué mais NON résolu (web uniquement)
- Les écrans d'onboarding (welcome/scan) ne rendent pas leur contenu dans l'aperçu **web**
  (`react-native-web` : chaîne flex qui s'effondre + quirks expo-router/react-native-screens
  + hydratation/redirection). Plusieurs pistes tentées (mode single/static, gate d'hydratation,
  Redirect vs router.replace, hauteurs explicites) sans rendu web fiable.
- **Décision** : toutes les modifs source expérimentales ont été ANNULÉES (git checkout) pour
  ne pas risquer l'APK natif. Seul `package.json` (port) est conservé. `.env` reste corrigé.

## Décision stratégique
- Le rendu natif (APK) n'est pas affecté par ces bugs web.
- Pour tester les prochains ajouts sans rebuild d'APK → **Expo Go** (rendu natif exact,
  rechargement instantané). Guide créé : `/app/RUN_ON_PHONE.md`.

## Compatibilité Expo Go
- Tous les modules (`expo-*`, svg, webview, reanimated, gesture-handler, async-storage,
  secure-store, local-authentication) sont supportés par Expo Go (SDK 54).
- L'app n'utilise pas de backend : tout passe par le simulateur (`src/api/deeper.ts`,
  `fetch http://${ip}/`). Aucun `.env` requis en local.
- ⚠️ `frontend/.env` est committé dans le repo et contient des valeurs cloud → à SUPPRIMER
  en local avant `npx expo start` (voir le guide).

## Prochaines actions possibles
- (Choix utilisateur) Réparer proprement le rendu web des écrans onboarding (refonte layout web-safe).
- Configurer EAS Build quand un APK distribuable sera nécessaire.
