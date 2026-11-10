# Onion Growth Simulator — Android app

A React Native (Expo) shell that bundles the simulator and runs it offline in a WebView. The web app in `../index.html` stays the single source of truth; the build copies it into `src/simulatorHtml.js` as an inline HTML string, so no server or internet connection is needed at runtime.

## How it works

- `../index.html` — the simulator (controls, canvas, model, report).
- `npm run sync:html` — regenerates `src/simulatorHtml.js` from `../index.html`.
- `App.js` — renders that HTML with `react-native-webview`, handles Android back and safe-area insets.

## Requirements

- Node 20 or newer
- JDK 17
- Android SDK with a platform (35/36) and build-tools, plus `ANDROID_HOME` set

## Install

```bash
cd mobile
npm install
```

`postinstall` automatically runs `sync:html`, so the bundled HTML matches the repo.

## Run it quickly

```bash
npx expo start
```

Scan the QR code with **Expo Go**. `react-native-webview` and `react-native-safe-area-context` are part of Expo Go, so the simulator runs without a custom dev build. If a module is missing, build a dev client instead:

```bash
npx expo run:android
```

## Build an offline debug APK

```bash
npm run apk
```

This runs `expo prebuild --platform android --clean` and then `./gradlew assembleDebug`.

Output:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

Install it on a connected phone:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Or copy the APK to the phone and open it (allow "install unknown apps" for your file manager).

The `android/` folder is generated and gitignored. Do not edit it by hand — change `app.json` or `App.js` instead.

## Build a signed release APK (cloud, easiest)

The debug APK is installable as-is for sideloading. For a signed release build without managing a keystore locally, use EAS (an Expo account is required):

```bash
npx eas-cli@latest build -p android --profile preview
```

`eas.json` sets `preview` to produce an APK. EAS handles signing and gives you a download link.

## Updating the simulator

1. Edit `../index.html`.
2. Run `npm run sync:html`.
3. Rebuild (`npm run apk`).

## App identity

Set in `app.json`:

- Name: `Onion Growth Simulator`
- Android package: `ph.bongabon.onionsimulator`
- `android.versionCode` — bump before publishing an update

Replace the images in `assets/` to use a custom launcher icon.

## Notes

- The app has no network calls. Only the cited reference links open the device browser, and those need internet.
- Canvas animation runs in the WebView, so all controls, sliders, play/pause, speed and stepping behave exactly as on the web version.
