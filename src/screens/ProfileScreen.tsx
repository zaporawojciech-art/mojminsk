import { useState } from 'react';
import {
  Car,
  Check,
  ChevronRight,
  Clock,
  Coffee,
  Dices,
  Gem,
  Lock,
  LogOut,
  Megaphone,
  MessageCircle,
  Plus,
  ShieldCheck,
  Smartphone,
  Vote,
} from 'lucide-react';
import {
  avatarUrl,
  initialAdConversations,
  type Ad,
  type AdConversation,
  type User,
} from '../data/mockData';
import { Img, NativeHeader, StreetPill, cn, zl } from '../components/ui';

interface ProfileScreenProps {
  user: User;
  onBack: () => void;
  onUpdate: (u: User) => void;
  onPartner: () => void;
  onAddAd?: () => void;
  onMyAds?: () => void;
  myAdsCount?: number;
  myReservedAdsCount?: number;
  onOpenConversations?: () => void;
  onOpenChatWithNeighbor?: (conv: AdConversation) => void;
  conversations?: AdConversation[];
  unreadConversationsCount?: number;
  onPreviewPublic?: () => void;
  onAddRide?: () => void;
  myRidesCount?: number;
  onOpenPolls?: () => void;
  onAddPoll?: () => void;
  activePollsCount?: number;
  onInstallApp?: () => void;
  onLogout?: () => void;
  userAds?: Ad[];
  isClosing?: boolean;
}

export function ProfileScreen({
  user,
  onBack,
  onUpdate,
  onPartner,
  onAddAd,
  onMyAds,
  myAdsCount = 1,
  myReservedAdsCount = 0,
  onOpenConversations,
  onOpenChatWithNeighbor,
  conversations = initialAdConversations,
  unreadConversationsCount = 0,
  onPreviewPublic: _onPreviewPublic,
  onAddRide,
  myRidesCount = 0,
  onOpenPolls,
  onAddPoll,
  activePollsCount = 0,
  onInstallApp,
  onLogout,
  userAds = [],
  isClosing = false,
}: ProfileScreenProps) {
  const [showBlikSupport, setShowBlikSupport] = useState(false);
  const [supportAmount, setSupportAmount] = useState<number>(10);
  const [supportBlikCode, setSupportBlikCode] = useState('');
  const [supportPaid, setSupportPaid] = useState(false);

  const badges = user.isGuest
    ? [
        {
          id: 'guest',
          label: 'Tryb gościa (tylko podgląd)',
          icon: Clock,
          unlocked: true,
          tone: 'bg-sand-200 text-ink border-sand-300',
        },
      ]
    : [];

  const adsMetaLabel = [
    `${myAdsCount} aktywne`,
    myReservedAdsCount > 0 ? `${myReservedAdsCount} zarez.` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div
      className={cn(
        'fixed inset-0 md:relative md:inset-auto md:h-full md:w-full z-50 flex flex-col bg-mist select-none',
        isClosing ? 'native-screen-exit' : 'native-screen-slide',
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-md md:max-w-none flex-col overflow-hidden bg-mist">
        <NativeHeader
          title="Mój profil sąsiedzki"
          backLabel="Wróć"
          onBack={onBack}
          right={
            <div className="flex items-center gap-1.5 pr-1">
              {onMyAds && (
                <button
                  type="button"
                  onClick={onMyAds}
                  className="flex h-9 items-center gap-1 rounded-full md:rounded-lg bg-mist px-3 text-[12px] font-bold text-ink transition-transform active:scale-95 hover:bg-mist-300"
                  title="Moje ogłoszenia"
                >
                  <Megaphone className="h-3.5 w-3.5 text-ink-700" aria-hidden />
                  <span>Moje ogłoszenia</span>
                </button>
              )}
              {onAddAd && (
                <button
                  type="button"
                  onClick={onAddAd}
                  className="flex h-9 items-center gap-1 rounded-full md:rounded-lg bg-coral px-3 text-[12px] font-bold text-ink shadow-xs transition-transform active:scale-95 hover:bg-coral-400"
                  title="Dodaj ogłoszenie"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  <span>Dodaj</span>
                </button>
              )}
            </div>
          }
        />

        {/* ===================================================================
         * 1. MOBILE VIEW (< 768px) — Native iOS Grouped List Layout
         * ================================================================= */}
        <div className="flex-1 overflow-y-auto overscroll-contain pb-24 md:hidden">
          <section className="px-5 pt-5 text-center">
            <div className="relative mx-auto h-32 w-32">
              <div className="absolute inset-0 rounded-[40px] bg-[conic-gradient(from_200deg,#F26659,#EBC999,#8CA9D3,#F26659)] p-1 shadow-float">
                <img
                  src={avatarUrl(user.seed)}
                  alt="Twój awatar AI"
                  className="h-full w-full rounded-[36px] bg-white object-cover"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onUpdate({
                  ...user,
                  seed: `${user.name}-${Date.now()}`,
                })
              }
              className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12.5px] font-bold text-ink shadow-card transition-transform active:scale-95 hover:bg-mist"
            >
              <Dices className="h-4 w-4 text-coral-700" aria-hidden />
              <span>Wylosuj inny awatar</span>
            </button>

            <h1 className="mt-3.5 font-display text-[26px] font-semibold leading-tight text-ink">
              {user.name}
            </h1>
            <div className="mt-1.5 flex justify-center">
              <StreetPill
                street={`ul. ${user.street.name} · ${user.street.neighbors} sąsiadów`}
                className="bg-white text-[12px] shadow-card"
              />
            </div>

            {badges.length > 0 && (
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
            )}
          </section>

          {user.isGuest && (
            <div className="mx-5 mt-5 rounded-4xl border border-sand-200 bg-sand-100 p-5 shadow-card text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-xs text-ink mb-3">
                <ShieldCheck className="h-6 w-6 text-coral" />
              </div>
              <p className="font-display text-[16px] font-bold text-ink">
                Przeglądasz aplikację w trybie gościa
              </p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-600">
                Zarejestruj się bezpłatnie, aby dodawać ogłoszenia, rozmawiać na czacie, zamawiać przejazdy i brać udział w ankietach mieszkańców.
              </p>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="mt-4 flex h-12 w-full items-center justify-center rounded-2xl bg-ink font-bold text-[13.5px] text-white shadow-xs transition-transform active:scale-95"
                >
                  Zarejestruj konto mieszkańca
                </button>
              )}
            </div>
          )}

          {/* Czat sąsiedzki */}
          <div className="mx-5 mt-6">
            <div className="mb-2 flex items-center justify-between px-3">
              <div className="flex items-center gap-2">
                <p className="text-[11.5px] font-extrabold uppercase tracking-wider text-ink-400">
                  Czat sąsiedzki
                </p>
                {unreadConversationsCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-coral px-2 py-0.5 text-[10px] font-extrabold text-ink">
                    <span className="h-1.5 w-1.5 rounded-full bg-ink animate-pulse" />
                    {unreadConversationsCount} {unreadConversationsCount === 1 ? 'nowa wiadomość' : 'nowe'}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onOpenConversations}
                className="flex items-center gap-0.5 text-[11.5px] font-bold text-ink-600 hover:text-ink"
              >
                Wszystkie ({conversations.length})
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="overflow-hidden rounded-4xl bg-white shadow-card">
              <div className="divide-y divide-mist">
                {conversations.slice(0, 2).map((conv) => {
                  const seed = conv.otherUser.avatarSeed || conv.otherUser.name;
                  const isUnread = conv.unreadCount > 0;
                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() =>
                        onOpenChatWithNeighbor ? onOpenChatWithNeighbor(conv) : onOpenConversations?.()
                      }
                      className={cn(
                        'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-mist/40',
                        isUnread && 'bg-coral-50/35',
                      )}
                    >
                      <img
                        src={avatarUrl(seed)}
                        alt={conv.otherUser.name}
                        className="h-11 w-11 rounded-2xl bg-sand-100 object-cover ring-1 ring-mist-300 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-[13.5px] font-bold text-ink">
                            {conv.otherUser.name}{' '}
                            <span className="font-normal text-[11.5px] text-ink-400">
                              · ul. {conv.otherUser.street}
                            </span>
                          </p>
                          <span className="shrink-0 text-[10.5px] text-ink-400">
                            {conv.lastMessageTime}
                          </span>
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-[12.5px] text-ink-500">
                          {conv.lastMessage}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={onOpenConversations}
                className="flex w-full items-center justify-center gap-1.5 border-t border-mist bg-mist/40 py-2.5 text-[12px] font-bold text-ink"
              >
                <MessageCircle className="h-3.5 w-3.5 text-coral-700" />
                Otwórz pełny czat sąsiedzki ({conversations.length})
              </button>
            </div>
          </div>

          {/* Moja aktywność */}
          <div className="mx-5 mt-6">
            <p className="mb-2 px-3 text-[11.5px] font-extrabold uppercase tracking-wider text-ink-400">
              Moja aktywność i ogłoszenia
            </p>
            <ul className="overflow-hidden rounded-4xl bg-white shadow-card divide-y divide-mist">
              {onAddAd && (
                <li>
                  <button
                    onClick={onAddAd}
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-coral text-ink shadow-xs">
                      <Plus className="h-[18px] w-[18px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14.5px] font-semibold text-ink">Dodaj ogłoszenie</p>
                      <p className="text-[11.5px] text-ink-400">Wystaw przedmiot lub oddaj za darmo</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-ink-300" />
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={onMyAds}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sand-100 text-ink">
                    <Megaphone className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14.5px] font-semibold text-ink">Moje ogłoszenia</p>
                    <p className="text-[11.5px] text-ink-400">Zarządzanie ofertami i rezerwacjami</p>
                  </div>
                  <span className="rounded-full bg-mist px-2.5 py-1 text-[11.5px] font-bold text-ink-700">
                    {adsMetaLabel}
                  </span>
                  <ChevronRight className="h-4 w-4 text-ink-300" />
                </button>
              </li>
              <li>
                <button
                  onClick={onAddRide}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-100 text-ink">
                    <Car className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14.5px] font-semibold text-ink">Dodaj przejazd sąsiedzki</p>
                    <p className="text-[11.5px] text-ink-400">Zaproponuj wspólny dojazd</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-ink-300" />
                </button>
              </li>
              {onOpenPolls && (
                <li>
                  <button
                    onClick={onOpenPolls}
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sand-100 text-ink">
                      <Vote className="h-[18px] w-[18px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14.5px] font-semibold text-ink">Ankiety mieszkańców</p>
                      <p className="text-[11.5px] text-ink-400">Głosuj i sprawdzaj wyniki</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-ink-300" />
                  </button>
                </li>
              )}
            </ul>
          </div>

          {onLogout && (
            <div className="mx-5 mt-5">
              <button
                type="button"
                onClick={onLogout}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-mist-300 bg-white text-[13.5px] font-bold text-coral-700"
              >
                <LogOut className="h-4.5 w-4.5" />
                {user.isGuest ? 'Opuść tryb gościa / Zarejestruj się' : 'Wyloguj się z konta'}
              </button>
            </div>
          )}
        </div>

        {/* ===================================================================
         * 2. DESKTOP VIEW (>= 768px) — Full-Width 12-Column Neighbor Dashboard
         * ================================================================= */}
        <div className="hidden md:block flex-1 overflow-y-auto w-full px-8 lg:px-12 py-6">
          <div className="grid grid-cols-12 gap-6 items-start pb-12">
            {/* LEFT 3 COLS: Neighbor Identity Card & Privacy Info */}
            <div className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-4 sticky top-2">
              <div className="rounded-2xl bg-white p-6 shadow-card border border-mist-200 text-center">
                <div className="relative mx-auto h-24 w-24">
                  <div className="absolute inset-0 rounded-3xl bg-[conic-gradient(from_200deg,#F26659,#EBC999,#8CA9D3,#F26659)] p-1 shadow-md">
                    <img
                      src={avatarUrl(user.seed)}
                      alt="Twój awatar AI"
                      className="h-full w-full rounded-[20px] bg-white object-cover"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onUpdate({
                      ...user,
                      seed: `${user.name}-${Date.now()}`,
                    })
                  }
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-mist px-3 py-1.5 text-[11.5px] font-bold text-ink hover:bg-mist-300 transition-colors"
                >
                  <Dices className="h-3.5 w-3.5 text-coral-700" />
                  <span>Wylosuj inny awatar</span>
                </button>

                <h2 className="mt-3 font-display text-[22px] font-extrabold text-ink leading-tight">
                  {user.name}
                </h2>
                <p className="text-[12.5px] font-semibold text-ink-500 mt-0.5">
                  {user.name} {user.street.as}
                </p>

                <div className="mt-2.5 flex justify-center">
                  <StreetPill
                    street={`ul. ${user.street.name} · ${user.street.neighbors} sąsiadów`}
                    className="bg-sand-100 text-ink-800 text-[11.5px] py-1 px-2.5"
                  />
                </div>

                {/* Quick Counters */}
                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-mist pt-4 text-center">
                  <div className="rounded-xl bg-mist/60 p-2">
                    <p className="font-display text-[17px] font-extrabold text-ink leading-none">
                      {myAdsCount}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold text-ink-500">Ogłoszenia</p>
                  </div>
                  <div className="rounded-xl bg-mist/60 p-2">
                    <p className="font-display text-[17px] font-extrabold text-ink leading-none">
                      {conversations.length}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold text-ink-500">Rozmowy</p>
                  </div>
                  <div className="rounded-xl bg-mist/60 p-2">
                    <p className="font-display text-[17px] font-extrabold text-ink leading-none">
                      {myRidesCount}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold text-ink-500">Przejazdy</p>
                  </div>
                </div>

                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="mt-5 flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-mist-300 bg-white text-[12.5px] font-bold text-coral-700 hover:bg-coral-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{user.isGuest ? 'Zarejestruj konto mieszkańca' : 'Wyloguj się z konta'}</span>
                  </button>
                )}
              </div>

              {/* Privacy & RODO Card */}
              <div className="rounded-2xl bg-white p-4 shadow-card border border-mist-200 flex items-start gap-2.5 text-[11.5px] text-ink-500 leading-relaxed">
                <Lock className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  Ochrona prywatności: sąsiedzi widzą wyłącznie podpis{' '}
                  <b className="text-ink">
                    {user.name} {user.street.as}
                  </b>
                  . Twój numer telefonu nie jest upubliczniany.
                </span>
              </div>
            </div>

            {/* CENTER 5 COLS: Moja aktywność, Szybkie akcje i Twoje ogłoszenia */}
            <div className="col-span-12 lg:col-span-8 xl:col-span-5 space-y-5">
              {/* Quick Actions 2x2 Grid */}
              <div className="rounded-2xl bg-white p-5 shadow-card border border-mist-200">
                <h3 className="font-display text-[16px] font-extrabold text-ink mb-3.5">
                  Szybkie akcje sąsiedzkie
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {onAddAd && (
                    <button
                      type="button"
                      onClick={onAddAd}
                      className="flex items-start gap-3 rounded-xl bg-coral/15 border border-coral/30 p-3.5 text-left hover:bg-coral/25 transition-colors"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-coral text-ink font-bold">
                        <Plus className="h-4.5 w-4.5" />
                      </span>
                      <div>
                        <p className="text-[13px] font-bold text-ink">Dodaj ogłoszenie</p>
                        <p className="text-[11px] text-ink-500 mt-0.5">Sprzedaj lub oddaj za darmo</p>
                      </div>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={onMyAds}
                    className="flex items-start gap-3 rounded-xl bg-mist/60 border border-mist-200 p-3.5 text-left hover:bg-mist transition-colors"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sand text-ink">
                      <Megaphone className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[13px] font-bold text-ink">Moje ogłoszenia</p>
                      <p className="text-[11px] text-ink-500 mt-0.5">{adsMetaLabel}</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={onAddRide}
                    className="flex items-start gap-3 rounded-xl bg-mist/60 border border-mist-200 p-3.5 text-left hover:bg-mist transition-colors"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sky text-ink">
                      <Car className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[13px] font-bold text-ink">Dodaj przejazd</p>
                      <p className="text-[11px] text-ink-500 mt-0.5">Carpooling do Warszawy</p>
                    </div>
                  </button>

                  {onAddPoll && (
                    <button
                      type="button"
                      onClick={onAddPoll}
                      className="flex items-start gap-3 rounded-xl bg-mist/60 border border-mist-200 p-3.5 text-left hover:bg-mist transition-colors"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sand-200 text-ink">
                        <Vote className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-[13px] font-bold text-ink">Utwórz ankietę</p>
                        <p className="text-[11px] text-ink-500 mt-0.5">
                          {activePollsCount} aktywnych głosowań
                        </p>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* User's Active Ads Preview */}
              <div className="rounded-2xl bg-white p-5 shadow-card border border-mist-200">
                <div className="flex items-center justify-between border-b border-mist pb-3 mb-3.5">
                  <div>
                    <h3 className="font-display text-[16px] font-extrabold text-ink">
                      Twoje wystawione ogłoszenia ({userAds.length})
                    </h3>
                    <p className="text-[11.5px] text-ink-400">
                      Zarządzaj widocznością i rezerwacjami swoich przedmiotów
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onMyAds}
                    className="text-[12px] font-bold text-coral-700 hover:underline"
                  >
                    Zarządzaj wszystkimi ➔
                  </button>
                </div>

                {userAds.length === 0 ? (
                  <div className="rounded-xl bg-mist/40 p-6 text-center">
                    <p className="text-[13px] font-bold text-ink">Nie masz jeszcze aktywnych ogłoszeń</p>
                    <p className="text-[11.5px] text-ink-500 mt-0.5">
                      Wystaw niepotrzebne rzeczy sąsiadom z ulicy {user.street.name}.
                    </p>
                    {onAddAd && (
                      <button
                        type="button"
                        onClick={onAddAd}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-[12px] font-bold text-white"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Dodaj pierwsze ogłoszenie
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {userAds.slice(0, 4).map((ad) => (
                      <div
                        key={ad.id}
                        onClick={onMyAds}
                        className="flex items-center justify-between gap-3 rounded-xl bg-mist/40 p-2.5 border border-mist-200 hover:bg-mist/80 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Img
                            src={ad.image}
                            alt={ad.title}
                            className="h-12 w-14 shrink-0 rounded-lg object-cover"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-bold text-ink">{ad.title}</p>
                            <p className="text-[11.5px] font-extrabold text-coral-700">
                              {ad.price ? zl(ad.price) : 'Za darmo'}{' '}
                              <span className="font-normal text-ink-400">· {ad.time}</span>
                            </p>
                          </div>
                        </div>
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10.5px] font-bold text-emerald-900 shrink-0">
                          {ad.status === 'reserved'
                            ? 'Rezerwacja'
                            : ad.status === 'sold'
                              ? 'Sprzedane'
                              : 'Aktywne'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT 4 COLS: Czat sąsiedzki + Partner & Wsparcie BLIK */}
            <div className="col-span-12 xl:col-span-4 space-y-5">
              {/* Czat sąsiedzki */}
              <div className="rounded-2xl bg-white p-5 shadow-card border border-mist-200">
                <div className="flex items-center justify-between border-b border-mist pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-[16px] font-extrabold text-ink">
                      Wiadomości sąsiedzkie
                    </h3>
                    {unreadConversationsCount > 0 && (
                      <span className="rounded-full bg-coral px-2 py-0.5 text-[10px] font-extrabold text-ink">
                        {unreadConversationsCount} nowe
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={onOpenConversations}
                    className="text-[12px] font-bold text-sky-700 hover:underline"
                  >
                    Pełna skrzynka ({conversations.length}) ➔
                  </button>
                </div>

                <div className="divide-y divide-mist">
                  {conversations.map((conv) => {
                    const seed = conv.otherUser.avatarSeed || conv.otherUser.name;
                    const isUnread = conv.unreadCount > 0;
                    return (
                      <button
                        key={conv.id}
                        type="button"
                        onClick={() =>
                          onOpenChatWithNeighbor
                            ? onOpenChatWithNeighbor(conv)
                            : onOpenConversations?.()
                        }
                        className="flex w-full items-start gap-3 py-3 first:pt-0 last:pb-0 text-left hover:bg-mist/30 rounded-lg px-2 -mx-2 transition-colors"
                      >
                        <img
                          src={avatarUrl(seed)}
                          alt={conv.otherUser.name}
                          className="h-10 w-10 rounded-xl bg-sand-100 object-cover ring-1 ring-mist-300 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-[13px] font-bold text-ink">
                              {conv.otherUser.name}{' '}
                              <span className="font-normal text-[11px] text-ink-400">
                                · ul. {conv.otherUser.street}
                              </span>
                            </p>
                            <span className="text-[10.5px] text-ink-400 shrink-0">
                              {conv.lastMessageTime}
                            </span>
                          </div>
                          <p
                            className={cn(
                              'mt-0.5 line-clamp-1 text-[12px]',
                              isUnread ? 'font-bold text-ink' : 'text-ink-500',
                            )}
                          >
                            {conv.lastMessage}
                          </p>
                          <span className="mt-1 inline-block rounded bg-mist px-1.5 py-0.5 text-[10px] font-semibold text-ink-500">
                            dot. {conv.adTitle}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Partner & Wsparcie BLIK */}
              <div className="rounded-2xl bg-white p-5 shadow-card border border-mist-200 space-y-3">
                <h3 className="font-display text-[15px] font-extrabold text-ink">
                  Społeczność i partnerzy Mińska
                </h3>

                <button
                  type="button"
                  onClick={onPartner}
                  className="flex w-full items-center justify-between rounded-xl bg-mist/50 p-3 text-left hover:bg-mist transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-coral-100 text-ink">
                      <Gem className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[13px] font-bold text-ink">Strefa Partnera Miesiąca</p>
                      <p className="text-[11px] text-ink-500">Jubiler Złota Nić · rabat −15%</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-ink-400" />
                </button>

                {onInstallApp && (
                  <button
                    type="button"
                    onClick={onInstallApp}
                    className="flex w-full items-center justify-between rounded-xl bg-mist/50 p-3 text-left hover:bg-mist transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-lg bg-sky-100 text-sky-900">
                        <Smartphone className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-[13px] font-bold text-ink">Aplikacja PWA na telefon</p>
                        <p className="text-[11px] text-ink-500">Instrukcja instalacji na iOS i Android</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-ink-400" />
                  </button>
                )}

                <div className="rounded-xl bg-sand-100/70 p-3.5 border border-sand-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Coffee className="h-4 w-4 text-coral-700" />
                      <span className="text-[12.5px] font-bold text-ink">
                        Wesprzyj niezależny mójMińsk
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowBlikSupport((v) => !v)}
                      className="rounded-md bg-ink px-2.5 py-1 text-[11px] font-bold text-white"
                    >
                      {showBlikSupport ? 'Zwiń' : 'Szybki BLIK'}
                    </button>
                  </div>

                  {showBlikSupport && (
                    <div className="mt-3 pt-3 border-t border-sand-200 space-y-2.5">
                      {supportPaid ? (
                        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-2.5 text-[12px] font-semibold text-emerald-900">
                          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                          Dziękujemy za wsparcie ({supportAmount} zł)!
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[5, 10, 20].map((amt) => (
                              <button
                                key={amt}
                                type="button"
                                onClick={() => setSupportAmount(amt)}
                                className={cn(
                                  'h-8 rounded-lg text-[12px] font-bold transition-colors',
                                  supportAmount === amt ? 'bg-ink text-white' : 'bg-white text-ink-700',
                                )}
                              >
                                {amt} zł
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              value={supportBlikCode}
                              onChange={(e) =>
                                setSupportBlikCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                              }
                              inputMode="numeric"
                              placeholder="Kod BLIK (6 cyfr)"
                              className="h-9 min-w-0 flex-1 rounded-lg bg-white px-3 text-center font-display text-[13px] font-bold tracking-widest outline-none"
                            />
                            <button
                              disabled={supportBlikCode.length !== 6}
                              onClick={() => setSupportPaid(true)}
                              className="h-9 rounded-lg bg-coral px-3.5 text-[12px] font-bold text-ink disabled:opacity-40"
                            >
                              Wpłać {supportAmount} zł
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
