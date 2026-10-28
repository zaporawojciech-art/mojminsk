import {
  Lock,
  MapPin,
  MessageCircle,
} from 'lucide-react';
import { NativeHeader, cn } from '../components/ui';
import { avatarUrl, type Ad, type User } from '../data/mockData';

interface SellerProfileModalProps {
  sellerName: string;
  sellerStreet: string;
  currentUser: User;
  allAds: Ad[];
  onClose: () => void;
  onOpenAd?: (ad: Ad) => void;
  onStartChat: (ad: Ad) => void;
  isClosing?: boolean;
}

export function SellerProfileModal({
  sellerName,
  sellerStreet,
  currentUser,
  allAds,
  onClose,
  onStartChat,
  isClosing = false,
}: SellerProfileModalProps) {
  const isSelf =
    sellerName.toLowerCase() === currentUser.name.toLowerCase() &&
    sellerStreet.toLowerCase() === currentUser.street.name.toLowerCase();

  const avatarSeed = isSelf ? currentUser.seed : `${sellerName}-${sellerStreet}`;

  // Find any active ad from this seller to allow initiating chat
  const relatedAd = allAds.find(
    (a) =>
      a.author.toLowerCase() === sellerName.toLowerCase() ||
      a.street.toLowerCase() === sellerStreet.toLowerCase(),
  );

  return (
    <div
      className={cn(
        'fixed inset-0 md:relative md:inset-auto md:h-full md:w-full z-50 flex flex-col bg-mist select-none',
        isClosing ? 'native-screen-exit' : 'native-screen-slide',
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-md md:max-w-none flex-col overflow-hidden bg-mist">
        <NativeHeader
          title="Wizytówka sąsiada"
          backLabel="Wróć"
          onBack={onClose}
        />

        <div className="flex-1 overflow-y-auto overscroll-contain p-5 md:px-8 lg:px-12 md:py-8 space-y-4 md:space-y-0 md:grid md:grid-cols-12 md:gap-6 md:items-start pb-28 md:pb-8">
          {/* Hero Profile Card */}
          <div className="md:col-span-5 rounded-4xl md:rounded-2xl bg-white p-6 text-center shadow-card md:shadow-xs border border-mist-300 md:border-mist-200">
            <div className="relative mx-auto h-24 w-24">
              <img
                src={avatarUrl(avatarSeed)}
                alt={sellerName}
                className="h-full w-full rounded-3xl bg-sand-100 object-cover shadow-float ring-4 ring-white"
              />
            </div>

            <h1 className="mt-3.5 font-display text-[22px] font-bold text-ink">
              {sellerName}
            </h1>
            <div className="mt-1 flex items-center justify-center gap-1.5 text-[13px] text-ink-500">
              <MapPin className="h-4 w-4 text-coral-700" />
              <span>ul. {sellerStreet} · Mińsk Mazowiecki</span>
            </div>

            {/* Desktop Action Button */}
            <div className="hidden md:block mt-5 pt-4 border-t border-mist-200">
              {!isSelf && relatedAd ? (
                <button
                  onClick={() => {
                    onClose();
                    onStartChat(relatedAd);
                  }}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-[13.5px] font-bold text-white shadow-sm hover:bg-ink-800 transition-all cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                  Napisz na czacie
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-[13.5px] font-bold text-white shadow-sm hover:bg-ink-800 transition-all cursor-pointer"
                >
                  Zamknij wizytówkę
                </button>
              )}
            </div>
          </div>

          {/* Privacy & Anonymity Reassurance Card */}
          <div className="md:col-span-7 rounded-3xl md:rounded-2xl bg-white p-4 md:p-6 shadow-sm md:shadow-xs border border-mist-300 md:border-mist-200">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-mist text-ink-600">
                <Lock className="h-4 w-4" />
              </span>
              <div className="text-[12.5px] md:text-[13.5px] leading-relaxed text-ink-600">
                <p className="font-bold text-ink">Prywatność i anonimowość mieszkańców</p>
                <p className="mt-1 text-ink-500">
                  W mójMińsk szanujemy Twoją prywatność. Nie profilujemy historii sprzedaży ani nie udostępniamy katalogu pozostałych rzeczy oferowanych przez mieszkańców. Kontakt z sąsiadem odbywa się wyłącznie przez bezpieczny czat wewnętrzny.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Action Bar */}
        <div className="md:hidden border-t border-mist bg-white px-5 py-3 pb-[max(env(safe-area-inset-bottom),14px)] shrink-0 shadow-float">
          {isSelf ? (
            <button
              onClick={onClose}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-[14.5px] font-bold text-white shadow-sm hover:bg-ink-700 transition-all active:scale-[0.98]"
            >
              Zamknij
            </button>
          ) : relatedAd ? (
            <button
              onClick={() => {
                onClose();
                onStartChat(relatedAd);
              }}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-[14.5px] font-bold text-white shadow-sm hover:bg-ink-700 transition-all active:scale-[0.98]"
            >
              <MessageCircle className="h-4.5 w-4.5" />
              Napisz na czacie
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-[14.5px] font-bold text-white shadow-sm hover:bg-ink-700 transition-all active:scale-[0.98]"
            >
              Zamknij
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
