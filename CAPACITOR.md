# GMAMIKO101 — Android APK (Capacitor)

The app already ships as an installable PWA. To also ship an APK
(Google Play / sideload), use Capacitor. The `capacitor.config.ts`
in the repo root is preconfigured.

## One-time setup (local machine, needs Node + Android Studio)

```bash
bun add @capacitor/core @capacitor/android
bun add -d @capacitor/cli
bunx cap add android
```

## Build & sync

```bash
bun run build          # builds the PWA into dist/client
bunx cap sync android  # copies web assets + config into android/
bunx cap open android  # opens the Android Studio project
```

Then use Android Studio → **Build → Generate Signed Bundle / APK**.

## Notes

- `minWebViewVersion: 60` covers Android 6+ (WebView is updatable via
  Play Store on 5.0+, so real-world reach is Android 6 → 15).
- `server.url` makes the APK a thin shell over the live PWA — every
  update ships instantly, no store review needed. For an offline
  bundled APK, remove `server.url` and rebuild.
- HTTPS only (`cleartext: false`, `allowMixedContent: false`).
- The PWA service worker is skipped inside Capacitor WebView
  (`isRefusedContext` treats the app as offline-capable via native).
