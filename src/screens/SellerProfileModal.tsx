import {
  Car,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Heart,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import { Img, NativeHeader, cn, zl } from '../components/ui';
import { avatarUrl, type Ad, type User } from '../data/mockData';

interface SellerProfileModalProps {
  sellerName: string;
  sellerStreet: string;
  currentUser: User;
  allAds: Ad[];
  onClose: () => void;
  onOpenAd: (ad: Ad) => void;
  onStartChat: (ad: Ad) => void;
  isClosing?: boolean;
}

export function SellerProfileModal({
  sellerName,
  sellerStreet,
  currentUser,
  allAds,
  onClose,
  onOpenAd,
  onStartChat,
  isClosing = false,
}: SellerProfileModalProps) {
  const isSelf =
    sellerName.toLowerCase() === currentUser.name.toLowerCase() &&
    sellerStreet.toLowerCase() === currentUser.street.name.toLowerCase();

  // Ads by this seller
  const sellerAds = allAds.filter((a) =>
    isSelf
      ? a.isOwner || a.author.toLowerCase().includes(currentUser.name.toLowerCase())
      : a.author.toLowerCase() === sellerName.toLowerCase() ||
        a.street.toLowerCase() === sellerStreet.toLowerCase(),
  );

  const activeAds = sellerAds.filter((a) => (a.status ?? 'active') === 'active');
  const pastAds = sellerAds.filter((a) => (a.status ?? 'active') !== 'active');
  const hasSuperNeighborAd = sellerAds.some((a) => a.promoted || a.price === null || a.kind === 'free');

  const isVerified = isSelf ? currentUser.verified : true;
  const avatarSeed = isSelf ? currentUser.seed : `${sellerName}-${sellerStreet}`;

  const showStats = isSelf ? (currentUser.privacy?.showStats ?? true) : true;
  const showPastAds = isSelf ? (currentUser.privacy?.showPastAds ?? true) : true;
  const showRides = isSelf ? (currentUser.privacy?.showRides ?? true) : true;

  const badges = [
    {
      id: 'verified',
      label: isVerified ? 'Zweryfikowany sąsiad' : 'W trakcie weryfikacji',
      icon: isVerified ? ShieldCheck : Clock,
      active: isVerified,
      tone: isVerified ? 'bg-sky-100 text-sky-900 border-sky-200' : 'bg-amber-100 text-amber-900 border-amber-200',
    },
    ...(hasSuperNeighborAd
      ? [
          {
            id: 'super',
            label: 'SuperSąsiad',
            icon: Sparkles,
            active: true,
            tone: 'bg-amber-100 text-amber-900 border-amber-300',
          },
        ]
      : []),
    ...(showRides
      ? [
          {
            id: 'driver',
            label: 'Kierowca 5.0',
            icon: Car,
            active: true,
            tone: 'bg-sand-100 text-ink border-sand-300',
          },
        ]
      : []),
    {
      id: 'helpful',
      label: 'Pomocny sąsiad',
      icon: Heart,
      active: true,
      tone: 'bg-coral-100 text-coral-900 border-coral-200',
    },
  ];

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col bg-mist select-none',
        isClosing ? 'native-screen-exit' : 'native-screen-slide',
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-hidden bg-mist">
        {/* Native Top Header */}
        <NativeHeader
          title={isSelf ? 'Twoja wizytówka publiczna' : 'Profil sąsiada'}
          backLabel={isSelf ? 'Profil' : 'Wróć'}
          onBack={onClose}
        />

        <div className="flex-1 overflow-y-auto overscroll-contain pb-8">
          {/* Self Preview Banner */}
          {isSelf && (
            <div className="mx-4 mt-3 flex items-center gap-2.5 rounded-2xl bg-ink px-3.5 py-2.5 text-white shadow-card">
              <Eye className="h-4 w-4 shrink-0 text-sand" aria-hidden />
              <p className="text-[12px] font-medium leading-snug">
                <strong className="font-bold text-sand">Tryb podglądu:</strong> Tak widzą Cię sąsiedzi w ogłoszeniach, przejazdach i rozmowach.
              </p>
            </div>
          )}

          {/* Hero Profile Card */}
          <div className="mt-3 bg-white p-5 pb-6 border-y border-mist text-center">
            <div className="relative mx-auto h-24 w-24">
              <img
                src={avatarUrl(avatarSeed)}
                alt={sellerName}
                className="h-full w-full rounded-3xl bg-sand-100 object-cover shadow-float ring-4 ring-white"
              />
              {isVerified ? (
                <div
                  title="Zweryfikowany kodem listowym"
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
              <MapPin className="h-4 w-4 text-coral" />
              <span>ul. {sellerStreet} · Mińsk Mazowiecki</span>
            </div>

            {/* Neighbor Badges (Decision #6) */}
            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5">
              {badges.map(({ id, label, icon: Icon, tone }) => (
                <span
                  key={id}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold',
                    tone,
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  {label}
                </span>
              ))}
            </div>

            {/* Quick trust metrics (Decision #6 & #8) */}
            {showStats ? (
              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-mist pt-4">
                <div className="rounded-2xl bg-mist/60 p-2 text-center">
                  <p className="font-display text-[17px] font-extrabold text-ink">{sellerAds.length}</p>
                  <p className="text-[10.5px] font-semibold text-ink-500">Wystawionych</p>
                </div>
                <div className="rounded-2xl bg-mist/60 p-2 text-center">
                  <p className="font-display text-[17px] font-extrabold text-ink flex items-center justify-center gap-0.5 text-amber-600">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    5.0
                  </p>
                  <p className="text-[10.5px] font-semibold text-ink-500">Opinie (14)</p>
                </div>
                <div className="rounded-2xl bg-mist/60 p-2 text-center">
                  <p className="font-display text-[17px] font-extrabold text-ink">~15m</p>
                  <p className="text-[10.5px] font-semibold text-ink-500">Odpisuje</p>
                </div>
              </div>
            ) : (
              isSelf && (
                <div className="mt-4 flex items-center justify-center gap-1.5 rounded-2xl bg-mist/70 px-3 py-2 text-[11.5px] font-semibold text-ink-500">
                  <EyeOff className="h-3.5 w-3.5" aria-hidden />
                  Statystyki liczbowe są ukryte dla sąsiadów (zgodnie z Twoimi ustawieniami)
                </div>
              )
            )}
          </div>

          {/* Verification info banner */}
          <div className="p-4">
            {isVerified ? (
              <div className="flex items-start gap-3 rounded-3xl bg-sand-100 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                <div className="text-[12px] leading-snug text-ink-700">
                  <p className="font-bold">Zweryfikowany mieszkaniec Mińska Mazowieckiego</p>
                  <p className="mt-0.5 text-ink-500">
                    Adres fizyczny przy ul. {sellerStreet} został potwierdzony listem z jednorazowym kodem PIN dostarczonym do skrzynki pocztowej.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-3xl bg-amber-50 border border-amber-200 p-4">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                <div className="text-[12px] leading-snug text-ink-700">
                  <p className="font-bold">Konto w 14-dniowym okresie próbnym</p>
                  <p className="mt-0.5 text-ink-500">
                    List weryfikacyjny na ul. {sellerStreet} jest w drodze. Wpisz 6-cyfrowy kod PIN w swoim profilu, aby otrzymać zieloną tarczę zaufania.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section: Active Listings */}
          <div className="px-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-[17px] font-bold text-ink">
                Aktywne ogłoszenia ({activeAds.length})
              </h2>
            </div>

            {activeAds.length === 0 ? (
              <p className="rounded-3xl bg-white p-5 text-center text-[13px] text-ink-400 shadow-card">
                {isSelf
                  ? 'Nie masz obecnie aktywnych ogłoszeń widocznych dla sąsiadów.'
                  : 'Ten sąsiad nie ma obecnie innych aktywnych ogłoszeń.'}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {activeAds.map((a) => (
                  <article
                    key={a.id}
                    onClick={() => {
                      onClose();
                      onOpenAd(a);
                    }}
                    className={cn(
                      'group cursor-pointer rounded-3xl bg-white p-2.5 shadow-card transition-all hover:shadow-float active:scale-[0.98]',
                      a.promoted && 'ring-2 ring-amber-300',
                    )}
                  >
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-mist">
                      <Img src={a.image} alt={a.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                      {a.promoted && (
                        <span className="absolute right-2 top-2 inline-flex items-center gap-0.5 rounded-full bg-amber-400 px-2 py-0.5 text-[9.5px] font-extrabold text-ink shadow">
                          <Sparkles className="h-2.5 w-2.5" />
                          Wyróżnione
                        </span>
                      )}
                      {a.price === null && (
                        <span className="absolute left-2 top-2 rounded-full bg-sky px-2 py-0.5 text-[10px] font-bold text-ink shadow">
                          Oddam
                        </span>
                      )}
                    </div>
                    <div className="p-1 pt-2">
                      <p className="font-display text-[15px] font-bold text-ink">
                        {a.price ? zl(a.price) : 'Za darmo'}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-[12.5px] font-semibold text-ink-700">
                        {a.title}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Section: Past / Completed Listings (Respects Privacy Decision #8) */}
          {showPastAds && pastAds.length > 0 && (
            <div className="mt-6 px-4">
              <h2 className="mb-3 font-display text-[16px] font-bold text-ink-500">
                Archiwalne / Zakończone ({pastAds.length})
              </h2>
              <div className="space-y-2">
                {pastAds.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 rounded-2xl bg-white p-2.5 shadow-card opacity-75"
                  >
                    <Img src={a.image} alt={a.title} className="h-12 w-12 rounded-xl object-cover shrink-0 grayscale" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-ink">{a.title}</p>
                      <span className="rounded-full bg-mist px-2 py-0.5 text-[10px] font-bold text-ink-500">
                        {a.status === 'reserved' ? 'Zarezerwowane w Mińsku' : 'Sprzedane sąsiadowi'}
                      </span>
                    </div>
                    <span className="text-[12px] font-bold text-ink-400">
                      {a.price ? zl(a.price) : 'Oddane'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!showPastAds && isSelf && pastAds.length > 0 && (
            <div className="mx-4 mt-5 flex items-center gap-2 rounded-2xl bg-white p-3 text-[12px] font-semibold text-ink-500 shadow-card">
              <EyeOff className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />
              Archiwalne ogłoszenia ({pastAds.length}) są ukryte przed sąsiadami.
            </div>
          )}
        </div>

        {/* Bottom Action Bar */}
        <div className="border-t border-mist bg-white px-5 py-3 pb-[max(env(safe-area-inset-bottom),14px)] shrink-0 shadow-float">
          {isSelf ? (
            <button
              onClick={onClose}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink text-[14.5px] font-bold text-white transition-transform active:scale-95"
            >
              Wróć do ustawień mojego profilu
            </button>
          ) : (
            sellerAds.length > 0 && (
              <button
                onClick={() => {
                  onClose();
                  onStartChat(sellerAds[0]);
                }}
                className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-coral text-[15px] font-bold text-ink shadow-coral transition-transform active:scale-95"
              >
                <MessageCircle className="h-5 w-5" />
                Napisz do {sellerName}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
