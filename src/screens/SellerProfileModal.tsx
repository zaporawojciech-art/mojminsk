import {
  CheckCircle2,
  Clock,
  Lock,
  MapPin,
  MessageCircle,
  ShieldCheck,
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

  const isVerified = isSelf ? currentUser.verified : true;
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
        'fixed inset-0 z-50 flex flex-col bg-mist select-none',
        isClosing ? 'native-screen-exit' : 'native-screen-slide',
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-hidden bg-mist">
        <NativeHeader
          title="Wizytówka sąsiada"
          backLabel="Wróć"
          onBack={onClose}
        />

        <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-4 pb-28">
          {/* Hero Profile Card */}
          <div className="rounded-4xl bg-white p-6 text-center shadow-card border border-mist-300">
            <div className="relative mx-auto h-24 w-24">
              <img
                src={avatarUrl(avatarSeed)}
                alt={sellerName}
                className="h-full w-full rounded-3xl bg-sand-100 object-cover shadow-float ring-4 ring-white"
              />
              {isVerified ? (
                <div
                  title="Zweryfikowany listem z PIN-em"
                  className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-emerald-600 text-white shadow ring-2 ring-white"
                >
                  <ShieldCheck className="h-5 w-5" />
                </div>
              ) : (
                <div
                  title="Oczekuje na kod z listu"
                  className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-amber-500 text-ink shadow ring-2 ring-white"
                >
                  <Clock className="h-4 w-4" />
                </div>
              )}
            </div>

            <h1 className="mt-3.5 font-display text-[22px] font-bold text-ink">
              {sellerName}
            </h1>
            <div className="mt-1 flex items-center justify-center gap-1.5 text-[13px] text-ink-500">
              <MapPin className="h-4 w-4 text-coral-700" />
              <span>ul. {sellerStreet} · Mińsk Mazowiecki</span>
            </div>

            <div className="mt-3.5 inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-100 px-3 py-1 text-[11.5px] font-bold text-sky-900">
              <ShieldCheck className="h-4 w-4" />
              {isVerified ? 'Zweryfikowany mieszkaniec' : 'Weryfikacja w toku'}
            </div>
          </div>

          {/* Verification info banner */}
          <div className="rounded-3xl bg-sand-100 p-4 shadow-sm border border-sand-200">
            <div className="flex items-start gap-3">
              {isVerified ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
              ) : (
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
              )}
              <div className="text-[12.5px] leading-relaxed text-ink-700">
                <p className="font-bold text-ink">
                  {isVerified ? 'Adres zamieszkania zweryfikowany' : 'Konto w okresie próbnym (14 dni)'}
                </p>
                <p className="mt-1 text-ink-600">
                  {isVerified
                    ? `Sąsiad mieszka w Mińsku Mazowieckim przy ul. ${sellerStreet}. Adres został potwierdzony tradycyjnym listem powitalnym z jednorazowym kodem PIN.`
                    : `Użytkownik zadeklarował zamieszkanie przy ul. ${sellerStreet} i oczekuje na doręczenie listu powitalnego z kodem aktywacyjnym PIN.`}
                </p>
              </div>
            </div>
          </div>

          {/* Privacy & Anonymity Reassurance Card */}
          <div className="rounded-3xl bg-white p-4 shadow-sm border border-mist-300">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-mist text-ink-600">
                <Lock className="h-4 w-4" />
              </span>
              <div className="text-[12.5px] leading-relaxed text-ink-600">
                <p className="font-bold text-ink">Prywatność i anonimowość mieszkańców</p>
                <p className="mt-1 text-ink-500">
                  W mójMińsk szanujemy Twoją prywatność. Nie profilujemy historii sprzedaży ani nie udostępniamy katalogu pozostałych rzeczy oferowanych przez mieszkańców.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="border-t border-mist bg-white px-5 py-3 pb-[max(env(safe-area-inset-bottom),14px)] shrink-0 shadow-float">
          {isSelf ? (
            <button
              onClick={onClose}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink text-[14.5px] font-bold text-white transition-transform active:scale-95"
            >
              Zamknij
            </button>
          ) : relatedAd ? (
            <button
              onClick={() => {
                onClose();
                onStartChat(relatedAd);
              }}
              className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-coral text-[15px] font-bold text-ink shadow-coral transition-transform active:scale-95"
            >
              <MessageCircle className="h-5 w-5" />
              Napisz do sąsiada na czacie
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink text-[14.5px] font-bold text-white transition-transform active:scale-95"
            >
              Zamknij
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
