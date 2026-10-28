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
import { Img, NativeHeader, StreetPill, cn } from '../components/ui';

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
  userAds: _userAds = [],
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
        'fixed inset-0 z-50 flex flex-col bg-mist select-none',
        isClosing ? 'native-screen-exit' : 'native-screen-slide',
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-hidden bg-mist">
        <NativeHeader
          title="Mój profil"
          backLabel="Wróć"
          onBack={onBack}
          right={
            <div className="flex items-center gap-1.5 pr-1">
              {onMyAds && (
                <button
                  type="button"
                  onClick={onMyAds}
                  className="flex h-9 items-center gap-1 rounded-full bg-mist px-3 text-[12px] font-bold text-ink transition-transform active:scale-95"
                  title="Moje ogłoszenia"
                >
                  <Megaphone className="h-3.5 w-3.5 text-ink-700" aria-hidden />
                  Moje
                </button>
              )}
              {onAddAd && (
                <button
                  type="button"
                  onClick={onAddAd}
                  className="flex h-9 items-center gap-1 rounded-full bg-coral px-3 text-[12px] font-bold text-ink shadow-xs transition-transform active:scale-95"
                  title="Dodaj ogłoszenie"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  Dodaj
                </button>
              )}
            </div>
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
        </div>

        {/* 3D Avatar Reroll - Bez limitów */}
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

        {/* Neighbor Badges */}
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

      {/* Guest Registration Promo */}
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

      {/* Czat sąsiedzki — Dedykowany widżet komunikatora sąsiedzkiego */}
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
          {/* Pasek aktywnych rozmówców (Messenger-style) */}
          <div className="flex items-center gap-3.5 border-b border-mist bg-mist/35 px-4 py-3 overflow-x-auto no-scrollbar">
            {conversations.map((conv) => {
              const seed = conv.otherUser.avatarSeed || conv.otherUser.name;
              const isUnread = conv.unreadCount > 0;
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() =>
                    onOpenChatWithNeighbor ? onOpenChatWithNeighbor(conv) : onOpenConversations?.()
                  }
                  className="group flex shrink-0 flex-col items-center gap-1 text-center transition-transform active:scale-95"
                >
                  <div className="relative">
                    <img
                      src={avatarUrl(seed)}
                      alt={conv.otherUser.name}
                      className={cn(
                        'h-12 w-12 rounded-2xl bg-sand-100 object-cover transition-all',
                        isUnread
                          ? 'ring-2 ring-coral ring-offset-2 ring-offset-white'
                          : 'ring-1 ring-mist-300',
                      )}
                    />
                    <span
                      className={cn(
                        'absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-white',
                        isUnread ? 'bg-coral' : 'bg-emerald-500',
                      )}
                    />
                  </div>
                  <span className="max-w-[68px] truncate text-[11px] font-bold text-ink">
                    {conv.otherUser.name}
                  </span>
                  <span className="max-w-[68px] truncate text-[9.5px] font-medium text-ink-400 -mt-1">
                    ul. {conv.otherUser.street}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Ostatnie wątki czatu */}
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
                    'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-mist/40 active:bg-mist/70',
                    isUnread && 'bg-coral-50/35',
                  )}
                >
                  <div className="relative mt-0.5 shrink-0">
                    <img
                      src={avatarUrl(seed)}
                      alt={conv.otherUser.name}
                      className="h-11 w-11 rounded-2xl bg-sand-100 object-cover ring-1 ring-mist-300"
                    />
                    {isUnread && (
                      <span className="absolute -right-1 -top-1 grid h-4.5 min-w-[18px] place-items-center rounded-full bg-coral px-1 text-[10px] font-extrabold text-ink ring-2 ring-white">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[13.5px] font-bold text-ink">
                        {conv.otherUser.name}{' '}
                        <span className="font-normal text-[11.5px] text-ink-400">
                          · ul. {conv.otherUser.street}
                        </span>
                      </p>
                      <span
                        className={cn(
                          'shrink-0 text-[10.5px]',
                          isUnread ? 'font-extrabold text-coral-700' : 'font-medium text-ink-400',
                        )}
                      >
                        {conv.lastMessageTime}
                      </span>
                    </div>

                    {/* Dymek ostatniej wiadomości */}
                    <p
                      className={cn(
                        'mt-0.5 line-clamp-1 text-[12.5px] leading-snug',
                        isUnread ? 'font-bold text-ink' : 'text-ink-500',
                      )}
                    >
                      {conv.role === 'buyer' ? 'Sąsiad: ' : ''}
                      {conv.lastMessage}
                    </p>

                    {/* Kontekst ogłoszenia */}
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="inline-block truncate rounded-md bg-mist px-1.5 py-0.5 text-[10px] font-semibold text-ink-500 max-w-[200px]">
                        dot. {conv.adTitle}
                      </span>
                    </div>
                  </div>

                  <Img
                    src={conv.adImage}
                    alt={conv.adTitle}
                    className="mt-0.5 h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-mist"
                  />
                </button>
              );
            })}
          </div>

          {/* Dolny przycisk otwierający pełną skrzynkę czatu */}
          <button
            type="button"
            onClick={onOpenConversations}
            className="flex w-full items-center justify-center gap-1.5 border-t border-mist bg-mist/40 py-2.5 text-[12px] font-bold text-ink hover:bg-mist transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5 text-coral-700" />
            Otwórz pełny czat sąsiedzki ({conversations.length})
            <ChevronRight className="h-3.5 w-3.5 text-ink-400" />
          </button>
        </div>
      </div>

      {/* Moje Sprawy Sąsiedzkie — iOS Grouped List (Decision #2 + Subagent Views) */}
      <div className="mx-5 mt-6">
        <p className="mb-2 px-3 text-[11.5px] font-extrabold uppercase tracking-wider text-ink-400">
          Moja aktywność i ogłoszenia
        </p>
        <ul className="overflow-hidden rounded-4xl bg-white shadow-card">
          {/* Dodaj nowe ogłoszenie -> AddAdModal */}
          {onAddAd && (
            <li className="border-b border-mist">
              <button
                onClick={onAddAd}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-mist/50 active:bg-mist"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-coral text-ink shadow-xs">
                  <Plus className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-semibold text-ink">Dodaj ogłoszenie</p>
                  <p className="text-[11.5px] text-ink-400">Wystaw przedmiot, oddaj za darmo lub zgłoś zgubę</p>
                </div>
                <span className="rounded-full bg-coral-100 px-2.5 py-0.5 text-[11px] font-extrabold text-coral-800">
                  Darmowe
                </span>
                <ChevronRight className="h-4 w-4 text-ink-300" aria-hidden />
              </button>
            </li>
          )}

          {/* Moje ogłoszenia -> MyAdsModal */}
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
                <p className="text-[11.5px] text-ink-400">Zarządzanie ofertami, edycja i statusy rezerwacji</p>
              </div>
              <span className="rounded-full bg-mist px-2.5 py-1 text-[11.5px] font-bold text-ink-700">
                {adsMetaLabel}
              </span>
              <ChevronRight className="h-4 w-4 text-ink-300" aria-hidden />
            </button>
          </li>

          {/* Dodaj przejazd sąsiedzki (Carpooling) -> AddRideModal */}
          <li className="border-b border-mist">
            <button
              onClick={onAddRide}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-mist/50 active:bg-mist"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-100 text-ink">
                <Car className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] font-semibold text-ink">Dodaj przejazd sąsiedzki</p>
                <p className="text-[11.5px] text-ink-400">Zaproponuj wspólny dojazd (Mińsk ↔ Warszawa / powiat)</p>
              </div>
              <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-extrabold text-sky-900">
                {myRidesCount > 0 ? `${myRidesCount} aktywne · + Dodaj` : '+ Dodaj kurs'}
              </span>
              <ChevronRight className="h-4 w-4 text-ink-300" aria-hidden />
            </button>
          </li>

          {/* Utwórz ankietę sąsiedzką -> AddPollModal */}
          {onAddPoll && (
            <li className="border-b border-mist">
              <button
                onClick={onAddPoll}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-mist/50 active:bg-mist"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-coral-100 text-ink">
                  <Plus className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-semibold text-ink">Utwórz ankietę sąsiedzką</p>
                  <p className="text-[11.5px] text-ink-400">Zadaj pytanie mińszczanom i ustaw czas trwania</p>
                </div>
                <span className="rounded-full bg-sand-100 px-2.5 py-0.5 text-[11px] font-bold text-ink">
                  Darmowa
                </span>
                <ChevronRight className="h-4 w-4 text-ink-300" aria-hidden />
              </button>
            </li>
          )}

          {/* Przeglądaj ankiety mieszkańców -> PollsModal */}
          {onOpenPolls && (
            <li>
              <button
                onClick={onOpenPolls}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-mist/50 active:bg-mist"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sand-100 text-ink">
                  <Vote className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-semibold text-ink">Ankiety mieszkańców</p>
                  <p className="text-[11.5px] text-ink-400">Głosuj i sprawdzaj wyniki według popularności</p>
                </div>
                <span className="rounded-full bg-mist px-2.5 py-1 text-[11.5px] font-bold text-ink-700">
                  {activePollsCount > 0 ? `${activePollsCount} aktywne` : 'Przeglądaj'}
                </span>
                <ChevronRight className="h-4 w-4 text-ink-300" aria-hidden />
              </button>
            </li>
          )}
        </ul>
      </div>

      {/* Partnerzy i Wsparcie (Styl iOS Settings) */}
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

        {/* Przycisk Wyloguj się / Wyjdź z trybu gościa */}
        {onLogout && (
          <div className="mx-5 mt-4">
            <button
              type="button"
              onClick={onLogout}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-mist-300 bg-white text-[13.5px] font-bold text-coral-700 hover:bg-mist active:scale-[0.98] transition-all shadow-xs"
            >
              <LogOut className="h-4.5 w-4.5" />
              {user.isGuest ? 'Opuść tryb gościa / Zarejestruj się' : 'Wyloguj się z konta'}
            </button>
          </div>
        )}

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
