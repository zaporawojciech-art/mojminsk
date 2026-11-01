import { registerSW } from 'virtual:pwa-register';

/**
 * Automatyczna aktualizacja PWA (Auto-Reload on deploy):
 * 1. Sprawdza czy jest nowy Service Worker natychmiast przy starcie.
 * 2. Odpytuje o aktualizację co 60 sekund oraz przy każdym powrocie do aplikacji (focus / visibilitychange).
 * 3. Gdy nowy Service Worker przejmuje kontrolę (controllerchange), automatycznie przeładowuje aplikację.
 */
export function initPWAAutoReload() {
  if (typeof window === 'undefined') return;

  // Automatyczny reload w przypadku błędu ładowania dynamicznych chunków lub arkuszy CSS po nowym deployu
  window.addEventListener(
    'error',
    (event) => {
      const target = event.target as HTMLElement | null;
      const isCssError = target instanceof HTMLLinkElement && target.rel === 'stylesheet';
      const isChunkError =
        typeof event.message === 'string' &&
        (event.message.includes('Failed to fetch dynamically imported module') ||
          event.message.includes('error loading dynamically imported module') ||
          event.message.includes('Loading chunk'));

      if (isCssError || isChunkError) {
        console.warn('Wykryto nieaktualny zasób (CSS/JS chunk) po nowym deployu — czyszczę i odświeżam...');
        window.location.reload();
      }
    },
    true,
  );

  // Nasłuchiwanie na przejęcie kontroli przez nowego Service Workera
  if ('serviceWorker' in navigator) {
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }

  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      // Wykryto nowy build - natychmiast aktywujemy nowego workera
      void updateSW(true);
    },
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;

      // Cykliczne sprawdzanie aktualizacji co 60 sekund
      window.setInterval(() => {
        void registration.update();
      }, 60 * 1000);

      // Sprawdzanie aktualizacji gdy użytkownik wraca do aplikacji / odblokowuje telefon
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          void registration.update();
        }
      });

      window.addEventListener('focus', () => {
        void registration.update();
      });
    },
  });
}
