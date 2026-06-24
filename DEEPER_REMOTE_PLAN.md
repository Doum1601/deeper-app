# 🎯 PLAN — Télécommande simplifiée du Deeper Connect (à reprendre plus tard)

> **POUR L'AGENT IA (future session) :** Ce fichier est une PASSATION. L'utilisateur
> va revenir dans quelques semaines avec des données capturées sur son vrai Deeper.
> Lis ce fichier EN ENTIER, puis demande-lui les captures (section 5) et implémente
> la section 6. Ne ré-explore pas tout : le contexte est ici.

---

## 1. Objectif de l'utilisateur
L'interface web du Deeper Connect (`http://34.34.34.34`, AtomOS) a **trop de fonctions**
pour la plupart des gens. L'utilisateur veut une app mobile **ultra-simple** qui n'expose
QUE 3 actions sur son **vrai** appareil :
1. **Reset / Reboot** de l'appareil
2. **Changer de réseau**
3. **Changer de pays** (pays de sortie DPN, ou région — à confirmer selon firmware)

## 2. Contraintes connues
- Deeper Connect **n'a PAS d'API publique officielle** documentée.
- L'interface AtomOS est une page web (SPA) qui appelle ses **propres endpoints HTTP internes**.
- Login admin requis (défaut `admin`/`admin`).
- IP interne : `34.34.34.34` (anciens firmwares : `11.22.33.44`).

## 3. INSIGHT TECHNIQUE CLÉ (ne pas l'oublier)
- Un `fetch()` direct depuis le code React Native vers `http://34.34.34.34` **ÉCHOUE**
  (origine externe → bloqué / cleartext / pas de cookie de session). C'est pourquoi la
  détection « pingDeeper » affiche toujours « Deeper non trouvé » alors que Chrome marche.
- **La solution = un WebView chargé SUR `http://34.34.34.34`.** À l'intérieur du WebView,
  on est sur l'origine du Deeper → `fetch()` vers ses endpoints fonctionne (même origine,
  pas de CORS, **cookie de session inclus automatiquement**).
- Donc : **WebView (caché ou visible) + JavaScript injecté qui appelle les endpoints AtomOS.**
- Note : `app.json` a déjà `android.usesCleartextTraffic: true` (ajouté pour les builds).

## 4. Architecture décidée (pont natif ↔ WebView ↔ AtomOS)
```
[ UI native simple ]  --(injectJavaScript)-->  [ WebView sur 34.34.34.34 ]  --(fetch same-origin)-->  [ endpoints AtomOS ]
        ^                                                                                                      |
        |---------------------( window.ReactNativeWebView.postMessage : résultat / erreur )-------------------|
```
- L'app affiche 3 boutons. Au tap, elle envoie une commande au WebView (caché) via
  `webviewRef.injectJavaScript("...")`.
- Le JS injecté fait `fetch(endpoint, {...})` (same-origin) et renvoie le résultat avec
  `window.ReactNativeWebView.postMessage(JSON.stringify(result))`.
- L'app écoute `onMessage` et affiche succès/erreur.
- Si l'utilisateur n'est pas loggé : le WebView affiche d'abord la page de login (visible),
  l'utilisateur se connecte UNE fois, le cookie de session reste, puis les actions marchent.

### Deux phases
- **Phase 1 (simple, robuste, sans endpoints)** : le WebView ouvre directement la **sous-page**
  AtomOS de l'action (deep-link, ex. `34.34.34.34/#/system`), en cachant le reste. 1 bouton = 1 sous-page épurée.
- **Phase 2 (1 tap, injection JS)** : on appelle l'endpoint directement → aucune navigation visible.

---

## 5. ⚠️ CE QUE L'UTILISATEUR DOIT FOURNIR (à remplir plus tard)
Capturé via Chrome sur ordinateur : `http://34.34.34.34` → F12 → onglet **Network** →
faire l'action → clic droit sur la requête → **Copy as cURL**. Coller ici :

### A) REBOOT / RESET
- URL de la sous-page (barre du navigateur, ex. `34.34.34.34/#/...`) : `__________`
- Requête (Copy as cURL) :
```
(coller ici)
```

### B) CHANGER DE RÉSEAU
- URL de la sous-page : `__________`
- Requête (Copy as cURL) :
```
(coller ici)
```

### C) CHANGER DE PAYS
- URL de la sous-page : `__________`
- Requête (Copy as cURL) :
```
(coller ici)
```

> Si l'utilisateur ne fournit que le Reboot, commencer par celui-là (validation de l'approche).

---

## 6. PLAN D'IMPLÉMENTATION (pour l'agent, dès que la section 5 est remplie)
1. Créer un composant pont : `src/components/DeeperBridge.tsx`
   - Monte un `<WebView ref source={{uri:"http://34.34.34.34"}} onMessage=... />` (caché : style hauteur 0 ou hors écran, OU visible pour le login).
   - Expose des fonctions via ref/contexte : `reboot()`, `changeNetwork(params)`, `changeCountry(code)`.
   - Chaque fonction = `injectJavaScript` d'un `fetch()` vers l'endpoint capturé + `postMessage` du résultat.
   - Gérer l'état login : si une action renvoie 401/redirection login → afficher le WebView visible pour login.
2. Créer un écran simple : `app/remote.tsx` (ou remplacer l'usage actuel)
   - 3 gros boutons (Reset / Réseau / Pays) avec états loading/succès/erreur + `data-testid`.
   - Brancher sur les fonctions du DeeperBridge.
3. Réutiliser `mixedContentMode="always"`, `javaScriptEnabled`, `domStorageEnabled`,
   `originWhitelist={["*"]}` (déjà utilisés dans `app/webview.tsx`).
4. Garder le mode démo/simulateur existant comme fallback quand le Deeper est injoignable.
5. Tester sur l'appareil réel via Expo Go (tunnel) ou build.

### Fichiers de référence existants (déjà dans le projet)
- `app/webview.tsx` : exemple de WebView fonctionnel (import conditionnel natif, mixedContentMode).
- `src/api/deeper.ts` : `pingDeeper()` (échoue depuis RN — voir section 3) + simulateur (fallback).
- `app/onboarding/scan.tsx` : écran de détection actuel (à terme, le rendre optionnel).

---

## 7. État actuel du projet (rappel)
- App Expo/React Native (SDK 54). APK natif fonctionne. Aperçu **web** a des bugs de rendu
  (react-native-web) NON résolus — sans impact sur le natif (voir `memory/SESSION_NOTES.md`).
- Test rapide sur téléphone : voir `RUN_ON_PHONE.md` (Expo Go).
- Les écrans de contrôle actuels affichent des **données simulées** (pas le vrai Deeper).
  Le seul lien réel actuel = WebView AtomOS (`app/webview.tsx`).
