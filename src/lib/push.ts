import { supabaseRest, supabaseRpc } from './supabaseClient';

const DEFAULT_VAPID_PUBLIC_KEY =
  'BHtI_cgIrzzVAUxl-LwS5B1rjwuLMm6HzXNHSisAVB9ZZZ9kgp9bAZ3pSQoQH65Cfa7usOlHBKwgE8g_SBXryeA';

export const VAPID_PUBLIC_KEY =
  import.meta.env.VITE_VAPID_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export function isIosNotStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent || '';
  const isIos = /iPad|iPhone|iPod/.test(ua);
  const isStandalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    Boolean((window.navigator as unknown as { standalone?: boolean }).standalone);
  return isIos && !isStandalone;
}

export async function getPushSubscriptionStatus(): Promise<boolean> {
  if (!isPushSupported()) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    return Boolean(sub);
  } catch {
    return false;
  }
}

export async function enablePushNotifications(): Promise<{
  ok: boolean;
  error: string | null;
}> {
  if (!isPushSupported()) {
    return {
      ok: false,
      error: isIosNotStandalone()
        ? 'Na iOS dodaj najpierw aplikację do ekranu początkowego, aby włączyć powiadomienia.'
        : 'Twoja przeglądarka nie obsługuje powiadomień Web Push.',
    };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return {
        ok: false,
        error: 'Brak zgody na wyświetlanie powiadomień w ustawieniach przeglądarki.',
      };
    }

    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      const appServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: appServerKey.buffer as ArrayBuffer,
      });
    }

    const json = sub.toJSON();
    const endpoint = json.endpoint;
    const p256dh = json.keys?.p256dh;
    const auth = json.keys?.auth;

    if (!endpoint || !p256dh || !auth) {
      return { ok: false, error: 'Nie udało się wygenerować kluczy powiadomień.' };
    }

    const { error } = await supabaseRpc('upsert_push_subscription', {
      p_endpoint: endpoint,
      p_p256dh: p256dh,
      p_auth: auth,
      p_user_agent: navigator.userAgent,
    });

    if (error) {
      return { ok: false, error };
    }

    return { ok: true, error: null };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : 'Nie udało się aktywować powiadomień Web Push.',
    };
  }
}

export async function disablePushNotifications(): Promise<void> {
  if (!isPushSupported()) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      const endpoint = sub.endpoint;
      await sub.unsubscribe();
      await supabaseRest(
        `push_subscriptions?endpoint=eq.${encodeURIComponent(endpoint)}`,
        { method: 'DELETE' },
        'return=minimal',
      );
    }
  } catch {
    // ignore errors when unsubscribing
  }
}
