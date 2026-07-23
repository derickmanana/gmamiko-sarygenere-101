import type { CapacitorConfig } from "@capacitor/cli";

// GMAMIKO101 — Capacitor configuration for Android APK / Google Play.
// The APK loads the deployed PWA URL, so users always get the latest build.
// If you want a fully bundled offline APK instead, remove `server.url` and
// set `webDir: "dist/client"` after running `bun run build`.
const config: CapacitorConfig = {
  appId: "app.gmamiko101.mada",
  appName: "GMAMIKO101",
  webDir: "dist/client",
  bundledWebRuntime: false,
  backgroundColor: "#0f1a14",
  server: {
    url: "https://gmamiko-sarygenere-101.lovable.app",
    androidScheme: "https",
    cleartext: false,
    allowNavigation: [
      "gmamiko-sarygenere-101.lovable.app",
      "*.lovable.app",
      "*.supabase.co",
    ],
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    // Support Android 6+ (API 23); Capacitor 6 targets API 34 by default.
    minWebViewVersion: 60,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: "#0f1a14",
      showSpinner: false,
    },
  },
};

export default config;
