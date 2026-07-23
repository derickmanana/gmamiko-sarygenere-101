// Guarded PWA registration wrapper. Registers /sw.js only on the real
// production site, never in Lovable preview, dev, iframe, or when ?sw=off
// is used. In refused contexts, unregisters any existing /sw.js so a
// stale worker cannot keep serving old HTML.

const SW_URL = "/sw.js";

function isRefusedContext(): boolean {
  try {
    if (!import.meta.env.PROD) return true;
    if (typeof window === "undefined") return true;
    if (window.top !== window.self) return true;
    const host = window.location.hostname;
    if (
      host.startsWith("id-preview--") ||
      host.startsWith("preview--") ||
      host === "lovableproject.com" ||
      host.endsWith(".lovableproject.com") ||
      host === "lovableproject-dev.com" ||
      host.endsWith(".lovableproject-dev.com") ||
      host === "beta.lovable.dev" ||
      host.endsWith(".beta.lovable.dev")
    ) {
      return true;
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get("sw") === "off") return true;
  } catch {
    return true;
  }
  return false;
}

async function unregisterMatching() {
  try {
    if (!("serviceWorker" in navigator)) return;
    const regs = await navigator.serviceWorker.getRegistrations();
    for (const r of regs) {
      const url = r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || "";
      if (url.endsWith(SW_URL)) await r.unregister();
    }
  } catch { /* noop */ }
}

export async function registerAppServiceWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  if (isRefusedContext()) {
    await unregisterMatching();
    return;
  }
  try {
    await navigator.serviceWorker.register(SW_URL, { scope: "/" });
  } catch { /* noop — offline support best-effort */ }
}
