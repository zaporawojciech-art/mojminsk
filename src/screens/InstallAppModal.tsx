import { useEffect, useState } from 'react';
import { Drawer } from 'vaul';
import {
  ArrowDown,
  Bell,
  Check,
  Download,
  PlusSquare,
  Share,
  ShieldCheck,
  Smartphone,
  WifiOff,
  X,
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function InstallAppModal({
  open,
  onOpenChange,
  container,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  container?: HTMLElement | null;
}) {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // 1. Check if already running in standalone mode (installed PWA)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(Boolean(isStandaloneMode));
    };

    checkStandalone();

    // 2. Platform detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroidDevice = /android/.test(userAgent);

    if (isIOSDevice) {
      setPlatform('ios');
    } else if (isAndroidDevice) {
      setPlatform('android');
    } else {
      setPlatform('other');
    }

    // 3. Listen to beforeinstallprompt (Android / Chrome / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstalledSuccess(true);
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      setIsInstalling(true);
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalledSuccess(true);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('Błąd podczas instalacji PWA:', err);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal container={container}>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm transition-opacity" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md flex flex-col rounded-t-[36px] bg-white outline-none shadow-2xl">
          {/* iOS Drawer Grabber Handle */}
          <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-mist-300" aria-hidden />

          <div className="max-h-[85vh] overflow-y-auto px-6 pb-[max(env(safe-area-inset-bottom),24px)] pt-3">
            {/* Header with App Icon */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-coral p-2 shadow-card ring-2 ring-mist">
                  <img
                    src="/icons/icon-192.png"
                    alt="mójMińsk"
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      // Fallback if image not yet loaded
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="grid h-full w-full place-items-center rounded-xl bg-ink text-white font-display font-bold text-[20px]">
                    mM
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <Drawer.Title className="font-display text-[20px] font-bold text-ink">
                      mójMińsk
                    </Drawer.Title>
                    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-extrabold text-sky-800">
                      PWA
                    </span>
                  </div>
                  <p className="text-[12.5px] font-medium text-ink-500">
                    Aplikacja Mińska Mazowieckiego
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-mist text-ink-500 hover:text-ink active:scale-95"
                aria-label="Zamknij"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* If Already Installed */}
            {isStandalone || installedSuccess ? (
              <div className="mt-5 rounded-3xl bg-emerald-50 border border-emerald-200 p-5 text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-600 text-white shadow-card">
                  <Check className="h-6 w-6" />
                </span>
                <p className="mt-3 font-display text-[17px] font-bold text-emerald-950">
                  Aplikacja jest już zainstalowana!
                </p>
                <p className="mt-1 text-[13px] text-emerald-800 leading-snug">
                  Masz pełny dostęp z ekranu początkowego, powiadomienia o awariach i tryb offline.
                </p>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="mt-4 h-11 w-full rounded-full bg-emerald-700 text-[13.5px] font-bold text-white transition-transform active:scale-95"
                >
                  Przejdź do aplikacji
                </button>
              </div>
            ) : (
              <>
                {/* Value Propositions / Why install */}
                <div className="mt-5 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl bg-mist/70 p-2.5 text-center">
                    <span className="mx-auto grid h-8 w-8 place-items-center rounded-xl bg-coral-100 text-coral-800">
                      <Smartphone className="h-4 w-4" />
                    </span>
                    <p className="mt-1.5 font-display text-[12px] font-bold text-ink">Pełny ekran</p>
                    <p className="text-[10px] text-ink-400">Bez pasków Safari</p>
                  </div>
                  <div className="rounded-2xl bg-mist/70 p-2.5 text-center">
                    <span className="mx-auto grid h-8 w-8 place-items-center rounded-xl bg-sky-100 text-sky-800">
                      <Bell className="h-4 w-4" />
                    </span>
                    <p className="mt-1.5 font-display text-[12px] font-bold text-ink">Alerty LIVE</p>
                    <p className="text-[10px] text-ink-400">Wypadki i awarie</p>
                  </div>
                  <div className="rounded-2xl bg-mist/70 p-2.5 text-center">
                    <span className="mx-auto grid h-8 w-8 place-items-center rounded-xl bg-sand-100 text-ink">
                      <WifiOff className="h-4 w-4" />
                    </span>
                    <p className="mt-1.5 font-display text-[12px] font-bold text-ink">ZDiTM offline</p>
                    <p className="text-[10px] text-ink-400">Rozkłady bez sieci</p>
                  </div>
                </div>

                {/* Platform Specific Instructions */}
                {platform === 'ios' ? (
                  /* iOS Safari Step-by-Step Guide */
                  <div className="mt-5 space-y-3">
                    <div className="rounded-3xl border border-mist-300 bg-sand-100/60 p-4">
                      <p className="text-[12px] font-bold uppercase tracking-wider text-ink-500">
                        Instalacja na iPhone / iPad (Safari)
                      </p>
                      <p className="mt-0.5 text-[14px] font-display font-bold text-ink">
                        Zainstaluj w 3 szybkich krokach:
                      </p>

                      <ol className="mt-3.5 space-y-3 text-[13px] text-ink-700">
                        <li className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-card">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-sky-100 text-sky-800">
                            <Share className="h-4 w-4" />
                          </span>
                          <span className="leading-snug">
                            1. Tapnij ikonę <b>Udostępnij</b> na dolnym pasku przeglądarki Safari.
                          </span>
                        </li>

                        <li className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-card">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-coral-100 text-coral-800">
                            <PlusSquare className="h-4 w-4" />
                          </span>
                          <span className="leading-snug">
                            2. Przewiń listę i wybierz <b>„Do ekranu początkowego”</b>.
                          </span>
                        </li>

                        <li className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-card">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-sand text-ink">
                            <Check className="h-4 w-4" />
                          </span>
                          <span className="leading-snug">
                            3. W prawym górnym rogu tapnij <b>„Dodaj”</b>. Gotowe!
                          </span>
                        </li>
                      </ol>
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-1 text-center text-[12px] font-medium text-ink-400">
                      <ArrowDown className="h-4 w-4 animate-bounce text-coral" />
                      Przycisk udostępniania znajduje się na samym dole ekranu telefonu
                    </div>
                  </div>
                ) : (
                  /* Android / Desktop One-Click or Browser Prompt */
                  <div className="mt-5 space-y-4">
                    <div className="rounded-3xl bg-mist/60 p-4 text-[13px] text-ink-600">
                      <p className="font-bold text-ink">Instalacja jednym tapnięciem</p>
                      <p className="mt-1 leading-snug">
                        Zainstaluj aplikację na telefonie, aby otwierać ją bezpośrednio z pulpitu bez wpisywania adresu w przeglądarce.
                      </p>
                    </div>

                    {deferredPrompt ? (
                      <button
                        type="button"
                        disabled={isInstalling}
                        onClick={handleInstallClick}
                        className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-coral text-[15px] font-bold text-ink shadow-coral transition-transform active:scale-95 disabled:opacity-50"
                      >
                        <Download className="h-5 w-5" />
                        {isInstalling ? 'Instalowanie...' : 'Zainstaluj mójMińsk'}
                      </button>
                    ) : (
                      <div className="rounded-3xl border border-mist-300 bg-white p-4 text-[12.5px] text-ink-700 shadow-card">
                        <p className="font-bold">Wskazówka dla przeglądarki Chrome:</p>
                        <p className="mt-1 text-ink-500">
                          Kliknij menu przeglądarki (trzy kropki w prawym górnym rogu) i wybierz <b>„Zainstaluj aplikację”</b> lub <b>„Dodaj do ekranu głównego”</b>.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Security / Size info */}
                <div className="mt-5 border-t border-mist pt-3 text-center">
                  <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-ink-400">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Zajmuje tylko ~2 MB · Błyskawiczna instalacja bez Google Play i App Store
                  </p>
                </div>
              </>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
