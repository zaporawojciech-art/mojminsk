import { useState } from 'react';
import {
  ArrowRight, Bus, Car, Check, Cloud, CloudMoon, CloudRain, CloudSun, Coffee, Droplets, Eye, Gauge, MapPin, Megaphone,
  MessagesSquare, Moon, Plus, ShieldCheck, Sparkles, Sun, TriangleAlert, Umbrella, Vote, Wind, X,
} from 'lucide-react';
import {
  getUpcomingDepartures, liveAlert, news, partner, weather,
  type FavoriteBusStop, type LineId, type User,
  type PollItem, initialPolls, isPollActive, getPollTimeLeftLabel,
} from '../data/mockData';
import { Card, Img, SectionHeader, StandardTopBar, cn } from '../components/ui';
import type { TabId } from '../components/BottomNav';

const lineTone: Record<LineId, string> = { M2: 'bg-sky', M3: 'bg-sand', M4: 'bg-coral' };

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Dzień dobry' : h < 18 ? 'Cześć' : 'Dobry wieczór';
};
const clock = (minsFromNow: number) => {
  const d = new Date(Date.now() + minsFromNow * 60000);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

function WeatherArt() {
  return (
    <div className="relative h-28 w-36 shrink-0" aria-hidden>
      <div className="absolute right-3 top-0 h-20 w-20 rounded-full bg-[radial-gradient(circle_at_30%_30%,#FFF4E0,#EBC999_55%,#D4A866)] shadow-[0_12px_30px_-6px_rgba(212,168,102,.9)]" />
      <div className="absolute bottom-3 left-0 h-12 w-28 rounded-full bg-[linear-gradient(180deg,#fff,#E3EAF5)] shadow-[0_14px_24px_-12px_rgba(31,29,43,.45)]" />
      <div className="absolute bottom-7 left-4 h-14 w-14 rounded-full bg-[linear-gradient(180deg,#fff,#EDF1F8)]" />
      <div className="absolute bottom-6 left-12 h-11 w-11 rounded-full bg-[linear-gradient(180deg,#fff,#E6ECF6)]" />
    </div>
  );
}

function SunArc() {
  const now = new Date();
  const toMin = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3));
  const t = Math.min(1, Math.max(0, (now.getHours() * 60 + now.getMinutes() - toMin(weather.sunrise)) / (toMin(weather.sunset) - toMin(weather.sunrise))));
  const x = (1 - t) ** 2 * 12 + 2 * (1 - t) * t * 120 + t ** 2 * 228;
  const y = (1 - t) ** 2 * 66 + 2 * (1 - t) * t * -18 + t ** 2 * 66;
  return (
    <div className="rounded-3xl bg-white/45 p-3">
      <svg viewBox="0 0 240 74" className="h-16 w-full" aria-hidden>
        <path d="M12 66 Q120 -18 228 66" fill="none" stroke="rgba(31,29,43,.35)" strokeWidth="1.5" strokeDasharray="4 5" />
        <line x1="0" y1="66" x2="240" y2="66" stroke="rgba(31,29,43,.15)" />
        <circle cx={x} cy={y} r="8" fill="#EBC999" stroke="#fff" strokeWidth="3" />
      </svg>
      <div className="flex justify-between text-[11.5px] font-semibold text-ink-700">
        <span>Wschód {weather.sunrise}</span>
        <span>Zachód {weather.sunset}</span>
      </div>
    </div>
  );
}

function HourlyWeatherIcon({ icon, isDay }: { icon: string; isDay: boolean }) {
  switch (icon) {
    case 'sun':
      return <Sun className="h-4 w-4 text-amber-500" aria-hidden />;
    case 'partly-cloudy':
      return isDay ? (
        <CloudSun className="h-4 w-4 text-amber-500" aria-hidden />
      ) : (
        <CloudMoon className="h-4 w-4 text-sky-300" aria-hidden />
      );
    case 'cloudy':
      return <Cloud className="h-4 w-4 text-ink-600" aria-hidden />;
    case 'rain':
      return <CloudRain className="h-4 w-4 text-sky-600" aria-hidden />;
    case 'moon':
      return <Moon className="h-4 w-4 text-sky-300" aria-hidden />;
    default:
      return <Sun className="h-4 w-4 text-amber-500" aria-hidden />;
  }
}

function WeatherCard({ city = 'Mińsk Mazowiecki' }: { city?: string }) {
  const [open, setOpen] = useState(false);
  const h = new Date().getHours();
  const metrics = [
    { icon: Wind, label: 'Wiatr', value: `${weather.wind} km/h` },
    { icon: Droplets, label: 'Wilgotność', value: `${weather.humidity}%` },
    { icon: Sun, label: 'Indeks UV', value: `${weather.uv} niski` },
    { icon: Gauge, label: 'Ciśnienie', value: `${weather.pressure} hPa` },
    { icon: Umbrella, label: 'Opady', value: `${weather.rain} mm` },
    { icon: Eye, label: 'Widoczność', value: `${weather.visibility} km` },
  ];
  return (
    <section className="px-5">
      <div className="relative overflow-hidden rounded-4xl bg-sky p-5 shadow-card">
        <div className="absolute -right-12 -top-12 h-52 w-52 rounded-full bg-white/15" aria-hidden />
        <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="relative block w-full text-left">
          <div className="flex items-start justify-between">
            <div>
              <p className="flex items-center gap-1 text-[12.5px] font-semibold text-ink/70">
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                {city}
              </p>
              <p className="mt-2 font-display text-[68px] font-semibold leading-none tracking-tighter">{weather.temp}°</p>
              <p className="mt-1 text-[15px] font-bold">{weather.condition}</p>
              <p className="text-[12px] font-medium text-ink/70">
                Odczuwalna {weather.feels}° · ↑{weather.max}° ↓{weather.min}°
              </p>
            </div>
            <WeatherArt />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12px] font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
              Powietrze: {weather.aqi.label} · PM2.5 {weather.aqi.pm25}
            </span>
            <span className="inline-flex items-center rounded-full bg-white/45 px-3 py-1.5 text-[12px] font-bold">{open ? 'Zwiń' : 'Szczegóły'}</span>
          </div>
        </button>

        {open && (
          <div className="relative mt-4 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {metrics.map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-2xl bg-white/45 p-2.5">
                  <Icon className="h-4 w-4 text-ink-700" aria-hidden />
                  <p className="mt-1.5 text-[13px] font-bold leading-none">{value}</p>
                  <p className="mt-1 text-[10.5px] font-medium text-ink/65">{label}</p>
                </div>
              ))}
            </div>
            <div className="-mx-5 flex gap-2.5 overflow-x-auto px-5 pb-1 no-scrollbar">
              {weather.hourly.map((item, i) => {
                const hourNum = (h + i) % 24;
                const isDay = hourNum >= 6 && hourNum < 20;
                return (
                  <div
                    key={i}
                    className={cn(
                      'flex w-[72px] shrink-0 flex-col items-center justify-between rounded-2xl p-2.5 text-center transition-all shadow-sm',
                      i === 0 ? 'bg-ink text-white shadow-card' : 'bg-white/60 text-ink',
                    )}
                  >
                    <p className={cn('text-[10px] font-semibold', i === 0 ? 'text-white/75' : 'text-ink-500')}>
                      {i === 0 ? 'Teraz' : `${String(hourNum).padStart(2, '0')}:00`}
                    </p>

                    <div className="my-1.5 flex flex-col items-center gap-0.5">
                      <HourlyWeatherIcon icon={item.icon} isDay={isDay} />
                      {item.rainChance && item.rainChance >= 20 ? (
                        <span className={cn('text-[9px] font-extrabold', i === 0 ? 'text-sky-300' : 'text-sky-700')}>
                          {item.rainChance}%
                        </span>
                      ) : null}
                    </div>

                    <p className="font-display text-[15px] font-bold leading-none">{item.temp}°</p>
                    <p className={cn('mt-1 line-clamp-1 text-[9.5px] font-medium leading-tight', i === 0 ? 'text-white/70' : 'text-ink-500')}>
                      {item.condition}
                    </p>
                  </div>
                );
              })}
            </div>
            <SunArc />
            <p className="text-[10.5px] font-medium text-ink/60">Dane: Open-Meteo · stacja GIOŚ Mińsk Mazowiecki</p>
          </div>
        )}
      </div>
    </section>
  );
}

function LiveAlert() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative mx-5 flex gap-3 rounded-3xl border-l-4 border-coral bg-white p-4 shadow-card" role="status">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-coral-100">
        <TriangleAlert className="h-5 w-5 text-coral-700" aria-hidden />
      </span>
      <div className="min-w-0 flex-1 pr-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[10.5px] font-extrabold tracking-wider text-coral-700">
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-coral" />
            </span>
            LIVE
          </span>
          <span className="text-[11px] text-ink-400">{liveAlert.time}</span>
        </div>
        <p className="mt-0.5 text-[14.5px] font-bold">{liveAlert.title}</p>
        <p className="mt-0.5 text-[12.5px] leading-snug text-ink-500">{liveAlert.description}</p>
        <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-sky-700">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
          Zweryfikowane przez administratora
        </p>
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Zamknij alert"
        className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-mist text-ink-400 hover:text-ink transition-transform active:scale-95"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

interface BusWidgetProps {
  favoriteBuses: FavoriteBusStop[];
  onOpenFull?: (lineId?: LineId, stopName?: string) => void;
  onAddFavorite?: () => void;
  onRemoveFavorite?: (id: string) => void;
}

function BusWidget({
  favoriteBuses,
  onOpenFull,
  onAddFavorite,
  onRemoveFavorite,
}: BusWidgetProps) {
  // Empty State - compact & sleek single row card
  if (favoriteBuses.length === 0) {
    return (
      <Card className="mx-5 p-4 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-ink text-white">
              <Bus className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="font-display text-[15.5px] font-bold leading-tight text-ink">
                Autobusy miejskie
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onAddFavorite && (
              <button
                type="button"
                onClick={onAddFavorite}
                className="flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-[12px] font-bold text-white shadow-xs transition-transform active:scale-95 hover:bg-ink-800"
              >
                <Plus className="h-3.5 w-3.5" />
                Dodaj przystanek
              </button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Active Favorites - sleek, compact list of user's observed routes
  return (
    <Card className="mx-5 p-4 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-ink text-white">
            <Bus className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="font-display text-[15px] font-bold leading-tight text-ink">
              Twoje przystanki
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onAddFavorite && (
            <button
              type="button"
              onClick={onAddFavorite}
              className="flex items-center gap-1 rounded-full bg-sand px-2.5 py-1 text-[11px] font-bold text-ink hover:bg-sand-200 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Dodaj kolejny
            </button>
          )}
          {onOpenFull && (
            <button
              onClick={() => onOpenFull()}
              className="text-[11.5px] font-bold text-sky-700 hover:underline"
            >
              Rozkład ➔
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 divide-y divide-mist-200">
        {favoriteBuses.map((fav) => {
          const upcoming = getUpcomingDepartures(fav.lineId, fav.stopName, fav.directionIdx);
          return (
            <div
              key={fav.id}
              onClick={() => onOpenFull?.(fav.lineId, fav.stopName)}
              className="flex items-center justify-between py-2.5 first:pt-1 last:pb-0 cursor-pointer transition-colors hover:bg-mist/40 rounded-xl px-1.5 -mx-1.5"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                <span className={cn('shrink-0 rounded-md px-2 py-0.5 text-[11px] font-extrabold', lineTone[fav.lineId])}>
                  {fav.lineId}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-bold text-ink">
                    {fav.stopName}
                  </p>
                  <p className="truncate text-[11px] font-medium text-ink-500">
                    ➔ {fav.destination}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <div className="text-right">
                  <p className="font-display text-[15px] font-extrabold text-coral-700 leading-none">
                    za {upcoming[0]} min
                  </p>
                  <p className="mt-0.5 text-[10px] text-ink-400">
                    potem {clock(upcoming[1])}
                  </p>
                </div>

                {onRemoveFavorite && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFavorite(fav.id);
                    }}
                    aria-label="Usuń z obserwowanych"
                    className="grid h-7 w-7 place-items-center rounded-full text-ink-300 hover:text-coral transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function FeaturedPollCard({
  pollItem,
  userVoteId,
  onVote,
  onOpenPolls,
  totalActiveCount,
}: {
  pollItem: PollItem | null;
  userVoteId?: string;
  onVote?: (pollId: string, optionId: string) => void;
  onOpenPolls?: () => void;
  totalActiveCount: number;
}) {
  const [localVote, setLocalVote] = useState<string | null>(null);
  const votedOptionId = userVoteId || localVote;

  if (!pollItem) {
    return (
      <div className="mx-5 rounded-4xl bg-sand-100 p-5 shadow-card border border-sand-200">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-sand-700">
            <Vote className="h-3.5 w-3.5" aria-hidden />
            Głosowanie sąsiadów
          </span>
        </div>
        <h3 className="mt-3 font-display text-[18px] font-bold leading-snug">
          Brak aktywnych ankiet
        </h3>
        <p className="mt-1 text-[12.5px] text-ink-500">
          Zadaj pierwsze pytanie sąsiadom lub sprawdź wyniki zakończonych głosowań.
        </p>
        {onOpenPolls && (
          <button
            type="button"
            onClick={onOpenPolls}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-[13px] font-bold text-ink shadow-xs active:scale-[.99]"
          >
            <span>Przejdź do ankiet</span>
            <ArrowRight className="h-4 w-4 text-coral-700" />
          </button>
        )}
      </div>
    );
  }

  const isVoted = Boolean(votedOptionId);
  const totalVotes = pollItem.totalVotes + (!userVoteId && localVote ? 1 : 0);
  const timeLeft = getPollTimeLeftLabel(pollItem);

  const handleVote = (optionId: string) => {
    if (isVoted) return;
    setLocalVote(optionId);
    onVote?.(pollItem.id, optionId);
  };

  return (
    <div className="mx-5 rounded-4xl bg-sand-100 p-5 shadow-card border border-sand-200">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-sand-700 shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" aria-hidden />
          {pollItem.isOfficial ? 'Ankieta tygodnia' : 'Głosowanie sąsiadów'}
        </span>
        <span className="text-[12px] font-medium text-ink-500">
          {totalVotes} {totalVotes === 1 ? 'głos' : totalVotes < 5 ? 'głosy' : 'głosów'} · {timeLeft}
        </span>
      </div>

      <h3 className="mt-3 font-display text-[20px] font-semibold leading-snug text-ink">
        {pollItem.title}
      </h3>
      <p className="mt-1 text-[12px] text-ink-500">
        Autor: <b className="text-ink">{pollItem.author}</b> {pollItem.authorStreet}
      </p>

      <div className="mt-4 space-y-2">
        {pollItem.options.map((o) => {
          const isMyChoice = votedOptionId === o.id;
          const optVotes = o.votes + (!userVoteId && localVote === o.id ? 1 : 0);
          const pct = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;

          return (
            <button
              key={o.id}
              disabled={isVoted}
              onClick={() => handleVote(o.id)}
              className={cn(
                'relative w-full overflow-hidden rounded-2xl bg-white px-4 py-3 text-left transition-all',
                !isVoted && 'active:scale-[.99] hover:bg-white/90',
                isMyChoice && 'ring-2 ring-ink shadow-xs',
              )}
            >
              {isVoted && (
                <span
                  className={cn(
                    'absolute inset-y-0 left-0 transition-[width] duration-700 ease-out pointer-events-none',
                    isMyChoice ? 'bg-coral-200/90' : 'bg-sand-200/70',
                  )}
                  style={{ width: `${pct}%` }}
                  aria-hidden
                />
              )}
              <span className="relative z-10 flex items-center justify-between gap-3 text-[14px] font-semibold">
                <span className="flex items-center gap-2 min-w-0 flex-1 break-words">
                  {isMyChoice && <Check className="h-4 w-4 shrink-0 text-ink" aria-hidden />}
                  <span>{o.name}</span>
                </span>
                {isVoted && <span className="font-bold tabular-nums text-ink shrink-0">{pct}%</span>}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-[11.5px] text-ink-500">
        <span>{isVoted ? 'Dziękujemy! Twój głos został zapisany.' : 'Głos oddają mieszkańcy Mińska.'}</span>
      </div>

      {/* Wyraźne CTA do przejścia do wszystkich ankiet */}
      {onOpenPolls && (
        <button
          type="button"
          onClick={onOpenPolls}
          className="mt-4 flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-xs transition-transform active:scale-[0.98] hover:bg-mist/60"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-coral-100 text-coral-700">
              <Vote className="h-4 w-4" aria-hidden />
            </span>
            <div className="text-left">
              <p className="text-[13.5px] font-bold text-ink leading-tight">
                Wszystkie ankiety
              </p>
              <p className="text-[11.5px] text-ink-500 leading-tight mt-0.5">
                {totalActiveCount} aktywne głosowania
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[13px] font-bold text-ink shrink-0 pl-2">
            <span>Zobacz</span>
            <ArrowRight className="h-4 w-4 text-ink-400" aria-hidden />
          </div>
        </button>
      )}
    </div>
  );
}

interface HomeScreenProps {
  user: User;
  onTab: (t: TabId) => void;
  onProfile: () => void;
  onPartner: () => void;
  onZditm?: (line?: LineId, stopName?: string) => void;
  favoriteBuses?: FavoriteBusStop[];
  onAddFavoriteBus?: () => void;
  onRemoveFavoriteBus?: (id: string) => void;
  polls?: PollItem[];
  userVotes?: Record<string, string>;
  onVote?: (pollId: string, optionId: string) => void;
  onOpenPolls?: () => void;
  city?: string;
}

export function HomeScreen({
  user,
  onTab,
  onProfile,
  onPartner,
  onZditm,
  favoriteBuses = [],
  onAddFavoriteBus,
  onRemoveFavoriteBus,
  polls = initialPolls,
  userVotes = {},
  onVote,
  onOpenPolls,
  city = 'Mińsk Mazowiecki',
}: HomeScreenProps) {
  const activePolls = polls
    .filter((p) => isPollActive(p))
    .sort((a, b) => b.totalVotes - a.totalVotes);
  const featuredPoll = activePolls[0] ?? null;
  const userVoteForFeatured = featuredPoll ? userVotes[featuredPoll.id] : undefined;
  const quick = [
    { label: 'Rozkład', icon: Bus, cls: 'bg-sky-100 text-ink', onClick: () => (onZditm ? onZditm('M2') : onTab('home')) },
    { label: 'Ogłoszenia', icon: Megaphone, cls: 'bg-white text-ink', onClick: () => onTab('ads') },
    { label: 'Przejazd', icon: Car, cls: 'bg-coral-100 text-ink', onClick: () => onTab('rides') },
    { label: 'Rozmowy', icon: MessagesSquare, cls: 'bg-sand text-ink', onClick: () => onTab('talks') },
  ];

  return (
    <div className="space-y-6 pb-36">
      <StandardTopBar
        user={user}
        onProfile={onProfile}
        title={
          <button onClick={onProfile} className="text-left leading-none active:opacity-75 transition-opacity">
            <span className="block text-[12px] font-semibold text-ink-500 leading-none mb-1">
              {greeting()},
            </span>
            <span className="font-display text-[22px] font-bold text-ink leading-none">
              {user.name} 👋
            </span>
          </button>
        }
      />

      <WeatherCard city={city} />

      <div className="grid grid-cols-4 gap-2.5 px-5">
        {quick.map(({ label, icon: Icon, cls, onClick }) => (
          <button key={label} onClick={onClick} className="flex flex-col items-center gap-1.5 active:scale-95">
            <span className={cn('grid h-16 w-full place-items-center rounded-3xl shadow-card', cls)}>
              <Icon className="h-6 w-6" aria-hidden />
            </span>
            <span className="text-[12px] font-semibold text-ink-700">{label}</span>
          </button>
        ))}
      </div>

      <LiveAlert />
      <BusWidget
        favoriteBuses={favoriteBuses}
        onOpenFull={onZditm}
        onAddFavorite={onAddFavoriteBus}
        onRemoveFavorite={onRemoveFavoriteBus}
      />

      <section>
        <SectionHeader title="Co słychać w Mińsku" action="Wszystkie" />
        <div className="flex gap-3 overflow-x-auto px-5 pb-1 no-scrollbar">
          {news.map((n) => (
            <article key={n.id} className="w-[250px] shrink-0 overflow-hidden rounded-3xl bg-white shadow-card">
              <div className="relative">
                <Img src={n.image} alt="" className="h-32 w-full" />
                <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[10.5px] font-bold">{n.tag}</span>
              </div>
              <div className="p-3.5">
                <p className="line-clamp-2 text-[14px] font-bold leading-snug">{n.title}</p>
                <p className="mt-1.5 text-[11.5px] text-ink-400">
                  {n.source} · {n.time}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <FeaturedPollCard
        pollItem={featuredPoll}
        userVoteId={userVoteForFeatured}
        onVote={onVote}
        onOpenPolls={onOpenPolls}
        totalActiveCount={activePolls.length}
      />

      <button onClick={onPartner} className="relative mx-5 block w-[calc(100%-2.5rem)] overflow-hidden rounded-4xl bg-ink p-5 text-left">
        <Img src={partner.hero} alt="" className="absolute inset-y-0 right-0 h-full w-1/2 opacity-90 [mask-image:linear-gradient(to_left,black_40%,transparent)]" />
        <span className="relative text-[10.5px] font-bold uppercase tracking-[.16em] text-sand">Strefa Partnera</span>
        <p className="relative mt-1.5 max-w-[60%] font-display text-[23px] font-semibold leading-tight text-white">{partner.name}</p>
        <p className="relative mt-1 max-w-[55%] text-[12.5px] text-white/70">−15% na biżuterię dla sąsiadów z mójMińsk</p>
        <span className="relative mt-4 inline-flex items-center gap-1 rounded-full bg-sand px-3.5 py-2 text-[12.5px] font-bold text-ink">
          Zobacz kolekcję <ArrowRight className="h-4 w-4" aria-hidden />
        </span>
      </button>

      <Card className="mx-5 flex items-center gap-3 p-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-coral-100">
          <Coffee className="h-5 w-5 text-coral-700" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-bold">Postaw kawę mójMińsk</p>
          <p className="text-[12px] text-ink-500">Niezależna aplikacja bez polityki i hejtu</p>
        </div>
        <button className="rounded-full bg-ink px-4 py-2.5 text-[12.5px] font-bold text-white">BLIK</button>
      </Card>
    </div>
  );
}
