import {
  CheckCircle2,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { Img, NativeHeader, zl } from '../components/ui';
import { avatarUrl, type Ad, type User } from '../data/mockData';

interface SellerProfileModalProps {
  sellerName: string;
  sellerStreet: string;
  currentUser: User;
  allAds: Ad[];
  onClose: () => void;
  onOpenAd: (ad: Ad) => void;
  onStartChat: (ad: Ad) => void;
}

export function SellerProfileModal({
  sellerName,
  sellerStreet,
  currentUser: _currentUser,
  allAds,
  onClose,
  onOpenAd,
  onStartChat,
}: SellerProfileModalProps) {
  // Ads by this seller
  const sellerAds = allAds.filter(
    (a) => a.author.toLowerCase() === sellerName.toLowerCase() || a.street.toLowerCase() === sellerStreet.toLowerCase(),
  );

  const activeAds = sellerAds.filter((a) => (a.status ?? 'active') === 'active');
  const pastAds = sellerAds.filter((a) => (a.status ?? 'active') !== 'active');

  const avatarSeed = `${sellerName}-${sellerStreet}`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-mist native-screen-slide select-none">
      <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-hidden bg-mist">
        {/* Native Top Header */}
        <NativeHeader
          title="Profil sąsiada"
          backLabel="Ogłoszenie"
          onBack={onClose}
        />

        <div className="flex-1 overflow-y-auto overscroll-contain pb-8">
          {/* Hero Profile Card */}
          <div className="bg-white p-5 pb-6 border-b border-mist text-center">
            <div className="relative mx-auto h-24 w-24">
              <img
                src={avatarUrl(avatarSeed)}
                alt={sellerName}
                className="h-full w-full rounded-3xl bg-sand-100 object-cover shadow-float ring-4 ring-white"
              />
              <div
                title="Zweryfikowany kodem listowym"
                className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-emerald-600 text-white shadow"
              >
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>

            <h1 className="mt-3.5 font-display text-[22px] font-bold text-ink">
              {sellerName}
            </h1>
            <div className="mt-1 flex items-center justify-center gap-1.5 text-[13px] text-ink-500">
              <MapPin className="h-4 w-4 text-coral" />
              <span>ul. {sellerStreet} · Mińsk Mazowiecki</span>
            </div>

            <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-[11.5px] font-bold text-sky-800">
              <ShieldCheck className="h-4 w-4" />
              Zweryfikowany adres i tożsamość
            </div>

            {/* Quick trust metrics */}
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
          </div>

          {/* Verification info banner */}
          <div className="p-4">
            <div className="flex items-start gap-3 rounded-3xl bg-sand-100 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sand-700" />
              <div className="text-[12px] leading-snug text-ink-700">
                <p className="font-bold">Mieszkaniec Mińska Mazowieckiego</p>
                <p className="mt-0.5 text-ink-500">
                  Adres fizyczny został zweryfikowany listem z jednorazowym kodem dostarczonym przez listonosza. Bezpieczne transakcje sąsiedzkie.
                </p>
              </div>
            </div>
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
                Ten sąsiad nie ma obecnie innych aktywnych ogłoszeń.
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
                    className="group cursor-pointer rounded-3xl bg-white p-2.5 shadow-card transition-all hover:shadow-float active:scale-[0.98]"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-mist">
                      <Img src={a.image} alt={a.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
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

          {/* Section: Past / Completed Listings */}
          {pastAds.length > 0 && (
            <div className="mt-6 px-4">
              <h2 className="mb-3 font-display text-[16px] font-bold text-ink-500">
                Archiwalne / Zakończone ({pastAds.length})
              </h2>
              <div className="space-y-2">
                {pastAds.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 rounded-2xl bg-white p-2.5 shadow-card opacity-70"
                  >
                    <Img src={a.image} alt={a.title} className="h-12 w-12 rounded-xl object-cover shrink-0 grayscale" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-ink">{a.title}</p>
                      <span className="rounded-full bg-mist px-2 py-0.5 text-[10px] font-bold text-ink-500">
                        Sprzedane sąsiadowi
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
        </div>

        {/* Bottom Direct Message Button */}
        {sellerAds.length > 0 && (
          <div className="border-t border-mist bg-white px-5 py-3 pb-[max(env(safe-area-inset-bottom),14px)] shrink-0 shadow-float">
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
          </div>
        )}
      </div>
    </div>
  );
}
