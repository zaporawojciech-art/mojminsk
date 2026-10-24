import { useState } from 'react';
import {
  BadgeCheck,
  Bell,
  Car,
  Check,
  ChevronRight,
  Clock,
  Coffee,
  Dices,
  Eye,
  EyeOff,
  Gem,
  Heart,
  Lock,
  Mail,
  Megaphone,
  MessagesSquare,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Vote,
} from 'lucide-react';
import { avatarUrl, type Ad, type User } from '../data/mockData';
import { NativeHeader, StreetPill, cn } from '../components/ui';

interface ProfileScreenProps {
  user: User;
  onBack: () => void;
  onUpdate: (u: User) => void;
  onPartner: () => void;
  onMyAds?: () => void;
  myAdsCount?: number;
  myReservedAdsCount?: number;
  myPromotedAdsCount?: number;
  onOpenConversations?: () => void;
  unreadConversationsCount?: number;
  onPreviewPublic?: () => void;
  onPromoteFirstAd?: () => void;
  onOpenRides?: () => void;
  onInstallApp?: () => void;
  userAds?: Ad[];
  isClosing?: boolean;
}

function IosToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200',
        checked ? 'bg-ink' : 'bg-mist-300',
      )}
    >
      <span
        className={cn(
          'inline-block h-6 w-6 rounded-full bg-white shadow transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  );
}

export function ProfileScreen({
  user,
  onBack,
  onUpdate,
  onPartner,
  onMyAds,
  myAdsCount = 1,
  myReservedAdsCount = 0,
  myPromotedAdsCount = 0,
  onOpenConversations,
  unreadConversationsCount = 0,
  onPreviewPublic,
  onPromoteFirstAd,
  onOpenRides,
  onInstallApp,
  userAds = [],
  isClosing = false,
}: ProfileScreenProps) {
  const [pin, setPin] = useState('');
  const [showRerollQuest, setShowRerollQuest] = useState(false);
  const [showOrdersDrawer, setShowOrdersDrawer] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollSubmitted, setPollSubmitted] = useState(false);
  const [showBlikSupport, setShowBlikSupport] = useState(false);
  const [supportAmount, setSupportAmount] = useState<number>(10);
  const [supportBlikCode, setSupportBlikCode] = useState('');
  const [supportPaid, setSupportPaid] = useState(false);

  const notifications = user.notifications ?? {
    alerts: true,
    chats: true,
    orders: true,
  };

  const privacy = user.privacy ?? {
    showStats: true,
    showPastAds: true,
    showRides: true,
  };

  const hasSuperNeighbor =
    myPromotedAdsCount > 0 || userAds.some((a) => a.promoted || a.price === null || a.kind === 'free');

  const badges = [
    {
      id: 'verified',
      label: user.verified ? 'Zweryfikowany sąsiad' : 'Weryfikacja w toku',
      icon: user.verified ? ShieldCheck : Clock,
      unlocked: user.verified,
      tone: user.verified
        ? 'bg-sky-100 text-sky-900 border-sky-200'
        : 'bg-mist text-ink-400 border-mist-300',
    },
    {
      id: 'super',
      label: 'SuperSąsiad',
      icon: Sparkles,
      unlocked: hasSuperNeighbor,
      tone: hasSuperNeighbor
        ? 'bg-amber-100 text-amber-900 border-amber-300'
        : 'bg-mist text-ink-400 border-mist-300',
    },
    {
      id: 'driver',
      label: 'Kierowca 5.0',
      icon: Car,
      unlocked: true,
      tone: 'bg-sand-100 text-ink border-sand-300',
    },
    {
      id: 'helpful',
      label: 'Pomocny sąsiad',
      icon: Heart,
      unlocked: true,
      tone: 'bg-coral-100 text-coral-900 border-coral-200',
    },
  ];

  const handleToggleNotification = (key: keyof typeof notifications, val: boolean) => {
    onUpdate({
      ...user,
      notifications: {
        ...notifications,
        [key]: val,
      },
    });
  };

  const handleTogglePrivacy = (key: keyof typeof privacy, val: boolean) => {
    onUpdate({
      ...user,
      privacy: {
        ...privacy,
        [key]: val,
      },
    });
  };

  const adsMetaLabel = [
    `${myAdsCount} aktywne`,
    myReservedAdsCount > 0 ? `${myReservedAdsCount} zarez.` : null,
    myPromotedAdsCount > 0 ? `${myPromotedAdsCount} wyróż.` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col bg-mist select-none',
        isClosing ? 'native-screen-exit' : 'native-screen-slide',
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-hidden bg-mist">
        {/* Native Top Bar with Public Card Preview button (Decision #1) */}
        <NativeHeader
          title="Mój profil"
          backLabel="Wróć"
          onBack={onBack}
          right={
            onPreviewPublic && (
              <button
                type="button"
                onClick={onPreviewPublic}
                className="mr-1 flex h-10 items-center gap-1.5 rounded-full bg-mist px-3.5 text-[12.5px] font-bold text-ink transition-colors hover:bg-mist-200 active:scale-95"
                title="Zobacz, jak Twój profil widzą inni mieszkańcy"
              >
                <Eye className="h-4 w-4 text-ink-700" aria-hidden />
                <span>Wizytówka</span>
              </button>
            )
          }
        />

        <div className="flex-1 overflow-y-auto overscroll-contain pb-24">

      {/* 1. Hero Identity & 3D Avatar Section */}
      <section className="px-5 pt-5 text-center">
        <div className="relative mx-auto h-32 w-32">
          <div className="absolute inset-0 rounded-[40px] bg-[conic-gradient(from_200deg,#F26659,#EBC999,#8CA9D3,#F26659)] p-1 shadow-float">
            <img
              src={avatarUrl(user.seed)}
              alt="Twój awatar AI"
              className="h-full w-full rounded-[36px] bg-white object-cover"
            />
          </div>
          {user.verified ? (
            <span
              className="absolute -bottom-1 -right-1 grid h-10 w-10 place-items-center rounded-full bg-emerald-600 text-white ring-4 ring-mist shadow-card"
              title="Zweryfikowany mieszkaniec"
            >
              <ShieldCheck className="h-5 w-5" aria-label="Zweryfikowany" />
            </span>
          ) : (
            <span
              className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full bg-amber-500 text-ink ring-4 ring-mist shadow-card"
              title="Konto tymczasowe – oczekuje na kod PIN z listu"
            >
              <Clock className="h-4 w-4" aria-label="Konto tymczasowe" />
            </span>
          )}
        </div>

        {/* 3D Avatar Reroll Logic (Decision #4) */}
        {user.rerolls > 0 ? (
          <button
            onClick={() =>
              onUpdate({
                ...user,
                seed: `${user.name}-${Date.now()}`,
                rerolls: user.rerolls - 1,
              })
            }
            className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[12px] font-bold text-ink shadow-card transition-transform active:scale-95"
          >
            <Dices className="h-4 w-4 text-coral-700" aria-hidden />
            Wylosuj nowy awatar ({user.rerolls}/3)
          </button>
        ) : (
          <div className="mt-3.5">
            <button
              onClick={() => setShowRerollQuest((s) => !s)}
              className="inline-flex items-center gap-1.5 rounded-full bg-sand-100 px-3.5 py-2 text-[11.5px] font-bold text-ink-700 shadow-card transition-transform active:scale-95"
            >
              <Lock className="h-3.5 w-3.5 text-sand-700" aria-hidden />
              Wykorzystano 3/3 losowań · Odblokuj za aktywność
            </button>
            {showRerollQuest && (
              <div className="mx-auto mt-2.5 max-w-xs rounded-3xl bg-white p-3.5 text-left text-[12px] shadow-card">
                <p className="font-bold text-ink">Jak zdobyć dodatkowe losowanie awatara?</p>
                <p className="mt-1 text-ink-500">
                  Pomóż sąsiadom: oddaj 1 przedmiot za darmo, zrealizuj 3 przejazdy carpoolingowe lub wyróżnij ofertę.
                </p>
                <button
                  onClick={() => {
                    onUpdate({ ...user, rerolls: 1 });
                    setShowRerollQuest(false);
                  }}
                  className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-full bg-ink py-2 text-[11.5px] font-bold text-white"
                >
                  <Sparkles className="h-3.5 w-3.5 text-sand" />
                  Odbierz +1 losowanie za aktywne przejazdy (5/3)
                </button>
              </div>
            )}
          </div>
        )}

        <h1 className="mt-3.5 font-display text-[26px] font-semibold leading-tight text-ink">
          {user.name}
        </h1>
        <div className="mt-1.5 flex justify-center">
          <StreetPill
            street={`ul. ${user.street.name} · ${user.street.neighbors} sąsiadów`}
            className="bg-white text-[12px] shadow-card"
          />
        </div>

        {/* Neighbor Reputation Badges (Decision #6) */}
        <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5">
          {badges.map(({ id, label, icon: Icon, unlocked, tone }) => (
            <span
              key={id}
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-opacity',
                tone,
                !unlocked && 'opacity-65',
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* 2. 14-Day Postal Verification Banner (Decision #5) */}
      {user.verified ? (
        <div className="mx-5 mt-5 flex items-center gap-3 rounded-4xl bg-sky p-4 shadow-card">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/80 text-emerald-700">
            <BadgeCheck className="h-6 w-6" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14.5px] font-bold text-ink">Zweryfikowany mieszkaniec Mińska</p>
            <p className="text-[12px] text-ink/75">
              Adres potwierdzony listem · pełne uprawnienia społecznościowe
            </p>
          </div>
        </div>
      ) : (
        <div className="mx-5 mt-5 rounded-4xl border border-sand-200 bg-sand-100 p-4 shadow-card">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sand text-ink">
              <Mail className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[14.5px] font-bold text-ink">Konto tymczasowe</p>
                <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-extrabold text-ink">
                  Zostało {user.trialDaysLeft} z 14 dni
                </span>
              </div>
              <p className="mt-0.5 text-[12px] text-ink-500">
                List z 6-cyfrowym kodem PIN i papierową książeczką kuponów idzie na ul. {user.street.name}
              </p>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-coral transition-all"
              style={{ width: `${(user.trialDaysLeft / 14) * 100}%` }}
            />
          </div>
          <div className="mt-3 flex gap-2">
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              placeholder="6-cyfrowy PIN z listu"
              aria-label="6-cyfrowy kod z listu"
              className="h-12 min-w-0 flex-1 rounded-full bg-white px-4 text-center font-display text-[17px] font-semibold tracking-[.3em] outline-none placeholder:font-sans placeholder:text-[13px] placeholder:font-medium placeholder:tracking-normal placeholder:text-ink-400 focus:ring-2 focus:ring-ink"
            />
            <button
              disabled={pin.length !== 6}
              onClick={() => onUpdate({ ...user, verified: true })}
              className="h-12 rounded-full bg-ink px-5 text-[13.5px] font-bold text-white transition-transform active:scale-95 disabled:opacity-40"
            >
              Aktywuj
            </button>
          </div>
        </div>
      )}

      {/* 3. Numeric Community Counters (Decision #6) */}
      <div className="mx-5 mt-4 grid grid-cols-3 gap-2.5">
        {[
          ['12', 'Wpisów'],
          ['148', 'Polubień'],
          ['5', 'Przejazdów'],
        ].map(([v, l]) => (
          <div key={l} className="relative rounded-3xl bg-white p-3 text-center shadow-card">
            {!privacy.showStats && (
              <span
                className="absolute right-2.5 top-2.5 text-ink-300"
                title="Ukryte na wizytówce publicznej"
              >
                <EyeOff className="h-3 w-3" aria-hidden />
              </span>
            )}
            <p className="font-display text-[22px] font-semibold text-ink">{v}</p>
            <p className="text-[11.5px] font-medium text-ink-500">{l}</p>
          </div>
        ))}
      </div>

      {/* 4. Moje Sprawy Sąsiedzkie — iOS Grouped List (Decision #2 + Subagent Views) */}
      <div className="mx-5 mt-6">
        <p className="mb-2 px-3 text-[11.5px] font-extrabold uppercase tracking-wider text-ink-400">
          Moja aktywność i ogłoszenia
        </p>
        <ul className="overflow-hidden rounded-4xl bg-white shadow-card">
          {/* Moje ogłoszenia -> MyAdsModal (EditAdModal + PromoteAdModal) */}
          <li className="border-b border-mist">
            <button
              onClick={onMyAds}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-mist/50 active:bg-mist"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sand-100 text-ink">
                <Megaphone className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] font-semibold text-ink">Moje ogłoszenia</p>
                <p className="text-[11.5px] text-ink-400">Edycja, statusy rezerwacji i promowanie</p>
              </div>
              <span className="rounded-full bg-mist px-2.5 py-1 text-[11.5px] font-bold text-ink-700">
                {adsMetaLabel}
              </span>
              <ChevronRight className="h-4 w-4 text-ink-300" aria-hidden />
            </button>
          </li>

          {/* Skrzynka Rozmów i Rezerwacji -> AdConversationsModal */}
          <li className="border-b border-mist">
            <button
              onClick={onOpenConversations}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-mist/50 active:bg-mist"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-coral-100 text-ink">
                <MessagesSquare className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] font-semibold text-ink">Rozmowy i odbiory osobiste</p>
                <p className="text-[11.5px] text-ink-400">Zapytania (Kupuję / Sprzedaję) i rezerwacje</p>
              </div>
              {unreadConversationsCount > 0 ? (
                <span className="rounded-full bg-coral px-2.5 py-0.5 text-[11.5px] font-extrabold text-ink">
                  {unreadConversationsCount} nowe
                </span>
              ) : (
                <span className="text-[12px] text-ink-400">Skrzynka</span>
              )}
              <ChevronRight className="h-4 w-4 text-ink-300" aria-hidden />
            </button>
          </li>

          {/* Wyróżnij ogłoszenie BLIK -> PromoteAdModal */}
          {onPromoteFirstAd && (
            <li className="border-b border-mist">
              <button
                onClick={onPromoteFirstAd}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-mist/50 active:bg-mist"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-900">
                  <Sparkles className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-semibold text-ink">Pakiet SuperSąsiad & Promowanie</p>
                  <p className="text-[11.5px] text-ink-400">Wyróżnij ofertę na górze listy (One-Click BLIK)</p>
                </div>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-900">
                  od 4 zł
                </span>
                <ChevronRight className="h-4 w-4 text-ink-300" aria-hidden />
              </button>
            </li>
          )}

          {/* Moje zamówienia (Motylek Market & Strefa Kuchni) */}
          <li className="border-b border-mist">
            <button
              onClick={() => setShowOrdersDrawer((v) => !v)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-mist/50 active:bg-mist"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-coral-100 text-ink">
                <ReceiptText className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] font-semibold text-ink">Moje zamówienia</p>
                <p className="text-[11.5px] text-ink-400">Motylek Market i lokalne restauracje</p>
              </div>
              <span className="text-[12px] font-semibold text-coral-700">1 w drodze</span>
              <ChevronRight className={cn('h-4 w-4 text-ink-300 transition-transform', showOrdersDrawer && 'rotate-90')} aria-hidden />
            </button>
            {showOrdersDrawer && (
              <div className="space-y-2 bg-mist/60 px-4 py-3 text-[12.5px]">
                <div className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-card">
                  <div>
                    <span className="inline-block rounded-full bg-coral-100 px-2 py-0.5 text-[10px] font-extrabold text-coral-700">
                      W DRODZE · 12 MIN
                    </span>
                    <p className="mt-1 font-bold text-ink">#2481 · Pizzeria Bella Ciao</p>
                    <p className="text-[11.5px] text-ink-500">Kurier Kamil (rower mójMińsk) · 48,00 zł</p>
                  </div>
                  <span className="font-display text-[14px] font-bold text-ink">ul. {user.street.name}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white p-3 opacity-80">
                  <div>
                    <span className="inline-block rounded-full bg-mist px-2 py-0.5 text-[10px] font-bold text-ink-500">
                      DORĘCZONO WCZORAJ
                    </span>
                    <p className="mt-1 font-bold text-ink">#2419 · Motylek Market (e-zakupy)</p>
                    <p className="text-[11.5px] text-ink-500">Torba papierowa · 124,50 zł (dostawa 0 zł)</p>
                  </div>
                </div>
              </div>
            )}
          </li>

          {/* Moje przejazdy (Carpooling) */}
          <li className="border-b border-mist">
            <button
              onClick={onOpenRides}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-mist/50 active:bg-mist"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-100 text-ink">
                <Car className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] font-semibold text-ink">Moje przejazdy sąsiedzkie</p>
                <p className="text-[11.5px] text-ink-400">Mińsk Maz. ↔ Warszawa · Ocena 5.0 ★</p>
              </div>
              <span className="text-[12px] text-ink-400">5 tras</span>
              <ChevronRight className="h-4 w-4 text-ink-300" aria-hidden />
            </button>
          </li>

          {/* Utwórz ankietę sąsiedzką (1 / miesiąc) */}
          <li>
            <button
              onClick={() => setShowPollCreator((v) => !v)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-mist/50 active:bg-mist"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sand-100 text-ink">
                <Vote className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] font-semibold text-ink">Utwórz ankietę sąsiedzką</p>
                <p className="text-[11.5px] text-ink-400">Darmowy przywilej mieszkańca</p>
              </div>
              <span className="rounded-full bg-sand-100 px-2.5 py-0.5 text-[11px] font-bold text-ink">
                {pollSubmitted ? '0 / 1 w tym m-cu' : '1 / miesiąc'}
              </span>
              <ChevronRight className={cn('h-4 w-4 text-ink-300 transition-transform', showPollCreator && 'rotate-90')} aria-hidden />
            </button>
            {showPollCreator && (
              <div className="bg-mist/60 px-4 py-3.5">
                {pollSubmitted ? (
                  <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-3 text-[12.5px] font-semibold text-emerald-900">
                    <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                    Twoja propozycja ankiety sąsiedzkiej trafiła do moderacji!
                  </div>
                ) : (
                  <div className="space-y-2.5 rounded-3xl bg-white p-3.5 shadow-card">
                    <p className="text-[12px] font-bold text-ink">
                      Zadaj pytanie mieszkańcom ul. {user.street.name} lub całego Mińska:
                    </p>
                    <input
                      value={pollQuestion}
                      onChange={(e) => setPollQuestion(e.target.value)}
                      placeholder="Np. Gdzie brakuje oświetlenia na naszej ulicy?"
                      className="h-11 w-full rounded-2xl bg-mist px-3.5 text-[13px] outline-none placeholder:text-ink-400 focus:ring-2 focus:ring-ink"
                    />
                    <button
                      disabled={!pollQuestion.trim()}
                      onClick={() => {
                        setPollSubmitted(true);
                        setPollQuestion('');
                      }}
                      className="flex h-10 w-full items-center justify-center rounded-full bg-ink text-[12.5px] font-bold text-white disabled:opacity-40"
                    >
                      Wyślij ankietę do publikacji
                    </button>
                  </div>
                )}
              </div>
            )}
          </li>
        </ul>
      </div>

      {/* 5. Szybkie Przełączniki Powiadomień WebPush (Decision #9) */}
      <div className="mx-5 mt-6">
        <p className="mb-2 px-3 text-[11.5px] font-extrabold uppercase tracking-wider text-ink-400">
          Powiadomienia Push (Mińsk Mazowiecki)
        </p>
        <ul className="overflow-hidden rounded-4xl bg-white shadow-card">
          <li className="flex items-center justify-between gap-3 border-b border-mist px-4 py-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-coral-100 text-coral-800">
                <Bell className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-ink">Alerty kryzysowe Mińska</p>
                <p className="text-[11.5px] text-ink-400">Wypadki DK92/A2, awarie PWiK, utrudnienia</p>
              </div>
            </div>
            <IosToggle
              label="Alerty kryzysowe Mińska"
              checked={notifications.alerts}
              onChange={(v) => handleToggleNotification('alerts', v)}
            />
          </li>

          <li className="flex items-center justify-between gap-3 border-b border-mist px-4 py-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sky-900">
                <MessagesSquare className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-ink">Wiadomości z czatu i rezerwacje</p>
                <p className="text-[11.5px] text-ink-400">Zapytania od sąsiadów i terminy odbioru</p>
              </div>
            </div>
            <IosToggle
              label="Wiadomości z czatu i rezerwacje"
              checked={notifications.chats}
              onChange={(v) => handleToggleNotification('chats', v)}
            />
          </li>

          <li className="flex items-center justify-between gap-3 px-4 py-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sand-100 text-ink">
                <ShoppingBag className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-ink">Statusy dostaw (Motylek & Kuchnia)</p>
                <p className="text-[11.5px] text-ink-400">Kurier w drodze, spakowane zakupy</p>
              </div>
            </div>
            <IosToggle
              label="Statusy dostaw"
              checked={notifications.orders}
              onChange={(v) => handleToggleNotification('orders', v)}
            />
          </li>
        </ul>
      </div>

      {/* 6. Prywatność i Widoczność w Profilu Publicznym (Decision #8) */}
      <div className="mx-5 mt-6">
        <div className="mb-2 flex items-center justify-between px-3">
          <p className="text-[11.5px] font-extrabold uppercase tracking-wider text-ink-400">
            Prywatność Twojej wizytówki
          </p>
          {onPreviewPublic && (
            <button
              onClick={onPreviewPublic}
              className="text-[11.5px] font-bold text-ink underline decoration-ink/40"
            >
              Sprawdź podgląd
            </button>
          )}
        </div>
        <ul className="overflow-hidden rounded-4xl bg-white shadow-card">
          <li className="flex items-center justify-between gap-3 border-b border-mist px-4 py-3.5">
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-ink">Pokazuj liczniki aktywności i opinie</p>
              <p className="text-[11.5px] text-ink-400">Widoczne dla sąsiadów na Twojej karcie</p>
            </div>
            <IosToggle
              label="Pokazuj liczniki aktywności"
              checked={privacy.showStats}
              onChange={(v) => handleTogglePrivacy('showStats', v)}
            />
          </li>

          <li className="flex items-center justify-between gap-3 border-b border-mist px-4 py-3.5">
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-ink">Pokazuj archiwalne (sprzedane) ogłoszenia</p>
              <p className="text-[11.5px] text-ink-400">Buduje wiarygodność przy kolejnych ofertach</p>
            </div>
            <IosToggle
              label="Pokazuj archiwalne ogłoszenia"
              checked={privacy.showPastAds}
              onChange={(v) => handleTogglePrivacy('showPastAds', v)}
            />
          </li>

          <li className="flex items-center justify-between gap-3 px-4 py-3.5">
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-ink">Pokazuj odznakę kierowcy carpoolingu</p>
              <p className="text-[11.5px] text-ink-400">Oznaczenie Kierowca 5.0 na wizytówce</p>
            </div>
            <IosToggle
              label="Pokazuj odznakę kierowcy"
              checked={privacy.showRides}
              onChange={(v) => handleTogglePrivacy('showRides', v)}
            />
          </li>
        </ul>
      </div>

      {/* 7. Partnerzy i Wsparcie (Styl iOS Settings) */}
      <div className="mx-5 mt-6">
        <p className="mb-2 px-3 text-[11.5px] font-extrabold uppercase tracking-wider text-ink-400">
          Społeczność i partnerzy
        </p>
        <ul className="overflow-hidden rounded-4xl bg-white shadow-card">
          {onInstallApp && (
            <li className="border-b border-mist">
              <button
                onClick={onInstallApp}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-mist/50 active:bg-mist"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sky-900">
                  <Smartphone className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-semibold text-ink">Zainstaluj mójMińsk na telefonie</p>
                  <p className="text-[11.5px] text-ink-400">Ekran początkowy bez pasków · tryb offline</p>
                </div>
                <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-extrabold text-sky-900">
                  PWA
                </span>
                <ChevronRight className="h-4 w-4 text-ink-300" aria-hidden />
              </button>
            </li>
          )}

          <li className="border-b border-mist">
            <button
              onClick={onPartner}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-mist/50 active:bg-mist"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-coral-100 text-ink">
                <Gem className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] font-semibold text-ink">Strefa Partnera Miesiąca</p>
                <p className="text-[11.5px] text-ink-400">Jubiler Złota Nić · Mińsk Mazowiecki</p>
              </div>
              <span className="rounded-full bg-sand-100 px-2.5 py-0.5 text-[11.5px] font-bold text-ink">
                −15%
              </span>
              <ChevronRight className="h-4 w-4 text-ink-300" aria-hidden />
            </button>
          </li>

          <li>
            <button
              onClick={() => setShowBlikSupport((v) => !v)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-mist/50 active:bg-mist"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-100 text-ink">
                <Coffee className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] font-semibold text-ink">Wesprzyj rozwój mójMińsk</p>
                <p className="text-[11.5px] text-ink-400">Niezależne medium bez hejtu i trolli</p>
              </div>
              <span className="rounded-full bg-ink px-2.5 py-0.5 text-[11px] font-bold text-white">
                BLIK
              </span>
              <ChevronRight className={cn('h-4 w-4 text-ink-300 transition-transform', showBlikSupport && 'rotate-90')} aria-hidden />
            </button>
            {showBlikSupport && (
              <div className="bg-mist/60 px-4 py-3.5">
                {supportPaid ? (
                  <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-3 text-[12.5px] font-semibold text-emerald-900">
                    <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                    Dziękujemy za wsparcie ({supportAmount} zł)! Razem budujemy lepszy Mińsk.
                  </div>
                ) : (
                  <div className="space-y-3 rounded-3xl bg-white p-3.5 shadow-card">
                    <div className="grid grid-cols-3 gap-2">
                      {[5, 10, 20].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setSupportAmount(amt)}
                          className={cn(
                            'h-10 rounded-2xl text-[13px] font-bold transition-colors',
                            supportAmount === amt ? 'bg-ink text-white' : 'bg-mist text-ink-700',
                          )}
                        >
                          {amt} zł
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={supportBlikCode}
                        onChange={(e) => setSupportBlikCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        inputMode="numeric"
                        placeholder="Kod BLIK (6 cyfr)"
                        className="h-11 min-w-0 flex-1 rounded-full bg-mist px-4 text-center font-display text-[15px] font-bold tracking-[.25em] outline-none placeholder:font-sans placeholder:text-[12px] placeholder:tracking-normal"
                      />
                      <button
                        disabled={supportBlikCode.length !== 6}
                        onClick={() => setSupportPaid(true)}
                        className="h-11 rounded-full bg-coral px-4 text-[12.5px] font-bold text-ink disabled:opacity-40"
                      >
                        Wpłać {supportAmount} zł
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </li>
        </ul>
      </div>

        {/* 8. RODO & Security Footer */}
        <p className="mx-8 mt-6 flex items-start justify-center gap-2 text-center text-[11.5px] leading-snug text-ink-400">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden />
          <span>
            Pełny adres (nr domu i lokalu) jest zaszyfrowany (AES-256) i widoczny wyłącznie dla administratora. Sąsiedzi widzą tylko: <strong className="font-semibold text-ink-700">{user.name}</strong>.
          </span>
        </p>
      </div>
    </div>
  </div>
);
}
