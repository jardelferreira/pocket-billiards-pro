/**
 * Registro único e protegido do service worker.
 * Nunca registra em desenvolvimento, dentro de iframe ou nos previews da Lovable.
 */
const SW_URL = "/sw.js";

function isBlockedContext(): boolean {
  if (!import.meta.env.PROD) return true;
  if (typeof window === "undefined") return true;
  if (window.self !== window.top) return true;

  const host = window.location.hostname;
  if (host.startsWith("id-preview--") || host.startsWith("preview--")) return true;
  if (host === "lovableproject.com" || host.endsWith(".lovableproject.com")) return true;
  if (host === "lovableproject-dev.com" || host.endsWith(".lovableproject-dev.com")) return true;
  if (host === "beta.lovable.dev" || host.endsWith(".beta.lovable.dev")) return true;
  if (new URL(window.location.href).searchParams.get("sw") === "off") return true;

  return false;
}

async function unregisterExisting(): Promise<void> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.allSettled(
    registrations
      .filter((r) => (r.active?.scriptURL ?? r.installing?.scriptURL ?? "").endsWith(SW_URL))
      .map((r) => r.unregister()),
  );
}

export async function registerServiceWorker(): Promise<void> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  if (isBlockedContext()) {
    await unregisterExisting();
    return;
  }
  try {
    const { registerSW } = await import("virtual:pwa-register");
    registerSW({ immediate: true });
  } catch {
    // offline/registro indisponível — o app continua funcionando
  }
}
