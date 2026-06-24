# 📱 Tester l'app « Deeper Connect Controller » sur votre téléphone avec Expo Go

Ce guide vous permet de voir l'app **en rendu natif exact** (comme l'APK), et de tester
**chaque modification instantanément** sur votre téléphone, **sans recréer d'APK**.

> ✅ Rendu identique à l'APK · ✅ Rechargement instantané à chaque sauvegarde · ✅ Gratuit
> ❌ Aucun des bugs de l'aperçu web (ils n'existent que sur navigateur)

---

## 1. Pré-requis (à installer UNE seule fois sur votre ordinateur)

1. **Node.js 20 ou plus** → https://nodejs.org (prendre la version « LTS »)
2. **Yarn** (gestionnaire de paquets) :
   ```bash
   npm install -g yarn
   ```
3. **Git** → https://git-scm.com
4. Sur votre **téléphone** : installez l'application **« Expo Go »**
   - Android : Google Play → « Expo Go »
   - iPhone : App Store → « Expo Go »
   - ⚠️ Prenez la **dernière version** (elle supporte le SDK 54 de votre app).

5. **Votre téléphone et votre ordinateur doivent être sur le MÊME réseau Wi-Fi.**
   (idéalement le réseau local de votre résidence, là où se trouve le Deeper)

---

## 2. Récupérer le code (UNE seule fois)

Ouvrez un terminal sur votre ordinateur et tapez :

```bash
git clone https://github.com/Doum1601/deeper-app.git
cd deeper-app/frontend
```

---

## 3. Préparer le projet (UNE seule fois)

### a) Supprimer le `.env` du cloud (TRÈS IMPORTANT)
Ce fichier contient des réglages propres à l'aperçu Emergent qui empêchent le
lancement local. On le supprime — l'app n'en a pas besoin localement.

- **Windows (PowerShell)** :
  ```powershell
  del .env
  ```
- **Mac / Linux** :
  ```bash
  rm -f .env
  ```

### b) Installer les dépendances
```bash
yarn install
```
(Cette étape prend quelques minutes la première fois.)

---

## 4. Lancer l'app et l'ouvrir sur le téléphone

Toujours dans le dossier `deeper-app/frontend` :

```bash
npx expo start
```

- Un **QR code** apparaît dans le terminal.
- **Android** : ouvrez **Expo Go** → « Scan QR code » → scannez le QR.
- **iPhone** : ouvrez l'**appareil photo** → visez le QR → tapez sur la bannière « Ouvrir dans Expo Go ».

L'app se charge sur votre téléphone en quelques secondes. 🎉

### Si le téléphone ne se connecte pas (réseaux différents, Wi-Fi d'entreprise, etc.)
Lancez plutôt en mode **tunnel** (passe par internet, marche partout) :
```bash
npx expo start --tunnel
```
puis scannez le QR comme ci-dessus.

---

## 5. Tester vos prochaines modifications (le but recherché !)

Une fois `npx expo start` lancé :
1. Modifiez n'importe quel fichier du code et **sauvegardez**.
2. L'app **se recharge toute seule** sur votre téléphone (Fast Refresh) — instantané.
3. Aucun rebuild d'APK nécessaire.

Pour relancer plus tard : `cd deeper-app/frontend` puis `npx expo start`.

---

## 6. Bon à savoir

- **Mode démo / simulateur** : tant que le téléphone n'est pas connecté à votre vrai
  Deeper (`34.34.34.34`), l'app affiche des **données simulées** réalistes. C'est normal.
  Pour viser le vrai appareil : Réglages de l'app → désactivez le mode démo / entrez l'IP.
- **FaceID / empreinte, stockage sécurisé** : fonctionnent dans Expo Go (rendu natif).
- **Raccourcis du terminal** pendant que ça tourne :
  - `r` = recharger · `m` = menu · `j` = ouvrir le débogueur · `Ctrl + C` = arrêter

---

## 7. Quand passerez-vous à un vrai APK ?

Expo Go suffit pour **développer et tester**. Quand vous voudrez un **APK installable**
(sans Expo Go) ou publier, on utilisera **EAS Build** :
```bash
npm install -g eas-cli
eas build -p android --profile preview
```
(on configurera ça le moment venu — pas nécessaire pour tester au quotidien.)
