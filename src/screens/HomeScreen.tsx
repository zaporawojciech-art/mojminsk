import { useState } from 'react';
import {
  ArrowRight,
  Bus,
  Car,
  Check,
  Cloud,
  CloudMoon,
  CloudRain,
  CloudSun,
  Coffee,
  Droplets,
  Eye,
  Gauge,
  Heart,
  MapPin,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  Moon,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  Sun,
  TriangleAlert,
  Umbrella,
  Users,
  Vote,
  Wind,
  X,
} from 'lucide-react';
import {
  ads as initialAds,
  avatarUrl,
  busLines,
  getPollTimeLeftLabel,
  getUpcomingDepartures,
  initialPolls,
  isPollActive,
  liveAlert,
  news,
  partner,
  posts as seedPosts,
  rides as initialRides,
  streets,
  weather,
  type Ad,
  type FavoriteBusStop,
  type LineId,
  type PollItem,
  type Ride,
  type User,
} from '../data/mockData';
import { Card, Img, SectionHeader, StandardTopBar, cn, zl } from '../components/ui';
import { AppLink } from '../components/AppLink';
import { buildAdUrl, buildZditmUrl, TAB_PATHS } from '../router/urlUtils';
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
  const t = Math.min(
    1,
    Math.max(
      0,
      (now.getHours() * 60 + now.getMinutes() - toMin(weather.sunrise)) /
        (toMin(weather.sunset) - toMin(weather.sunrise)),
    ),
  );
  const x = (1 - t) ** 2 * 12 + 2 * (1 - t) * t * 120 + t ** 2 * 228;
  const y = (1 - t) ** 2 * 66 + 2 * (1 - t) * t * -18 + t ** 2 * 66;
  return (
    <div className="rounded-3xl bg-white/45 p-3">
      <svg viewBox="0 0 240 74" className="h-16 w-full" aria-hidden>
        <path
          d="M12 66 Q120 -18 228 66"
          fill="none"
          stroke="rgba(31,29,43,.35)"
          strokeWidth="1.5"
          strokeDasharray="4 5"
        />
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
              <p className="mt-2 font-display text-[68px] font-semibold leading-none tracking-tighter">
                {weather.temp}°
              </p>
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
            <span className="inline-flex items-center rounded-full bg-white/45 px-3 py-1.5 text-[12px] font-bold">
              {open ? 'Zwiń' : 'Szczegóły'}
            </span>
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
                    <p
                      className={cn(
                        'mt-1 line-clamp-1 text-[9.5px] font-medium leading-tight',
                        i === 0 ? 'text-white/70' : 'text-ink-500',
                      )}
                    >
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
    <div className="relative mx-5 flex gap-3.5 rounded-3xl border-l-4 border-coral bg-white p-4 shadow-card" role="status">
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
            ALERT MIEJSKI LIVE
          </span>
          <span className="text-[11px] text-ink-400">{liveAlert.time}</span>
        </div>
        <p className="mt-0.5 text-[15px] font-bold text-ink">{liveAlert.title}</p>
        <p className="mt-0.5 text-[13px] leading-snug text-ink-500">{liveAlert.description}</p>
        <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-sky-700">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
          Zweryfikowane przez administratora
        </p>
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Zamknij alert"
        className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-mist text-ink-400 hover:text-ink transition-transform active:scale-95"
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
  if (favoriteBuses.length === 0) {
    return (
      <Card className="mx-5 p-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink text-white">
              <Bus className="h-4.5 w-4.5" aria-hidden />
            </span>
            <p className="font-display text-[15px] font-bold leading-tight text-ink">
              Autobusy miejskie
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onAddFavorite && (
              <button
                type="button"
                onClick={onAddFavorite}
                className="flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-[12px] font-bold text-white shadow-xs transition-transform active:scale-95"
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

  return (
    <Card className="mx-5 p-4">
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
              className="flex items-center gap-1 rounded-full bg-sand px-2.5 py-1 text-[11px] font-bold text-ink"
            >
              <Plus className="h-3.5 w-3.5" />
              Dodaj kolejny
            </button>
          )}
          {onOpenFull && (
            <button
              onClick={() => onOpenFull()}
              className="text-[11.5px] font-bold text-sky-700"
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
              className="flex items-center justify-between py-2.5 first:pt-1 last:pb-0 cursor-pointer transition-opacity active:opacity-75"
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
  compact = false,
}: {
  pollItem: PollItem | null;
  userVoteId?: string;
  onVote?: (pollId: string, optionId: string) => void;
  onOpenPolls?: () => void;
  totalActiveCount: number;
  compact?: boolean;
}) {
  const [localVote, setLocalVote] = useState<string | null>(null);
  const votedOptionId = userVoteId || localVote;

  if (!pollItem) {
    return (
      <div className={cn('rounded-4xl bg-sand-100 p-5 shadow-card border border-sand-200', !compact && 'mx-5')}>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-sand-700">
            <Vote className="h-3.5 w-3.5" aria-hidden />
            Głosowanie sąsiadów
          </span>
        </div>
        <h3 className="mt-2.5 font-display text-[17px] font-bold leading-snug">
          Brak aktywnych ankiet
        </h3>
        {onOpenPolls && (
          <button
            type="button"
            onClick={onOpenPolls}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-[12.5px] font-bold text-ink shadow-xs"
          >
            <span>Przejdź do ankiet</span>
            <ArrowRight className="h-3.5 w-3.5 text-coral-700" />
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
    <div
      className={cn(
        'bg-sand-100 border border-sand-200 flex flex-col justify-between',
        compact ? 'h-full rounded-2xl p-4 shadow-xs' : 'mx-5 rounded-4xl p-5 shadow-card',
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-0.5 text-[10.5px] font-bold text-sand-700 shadow-xs">
            <Sparkles className="h-3 w-3 text-amber-500" aria-hidden />
            {pollItem.isOfficial ? 'Ankieta tygodnia' : 'Głosowanie sąsiadów'}
          </span>
          <span className="text-[11px] font-semibold text-ink-500">
            {totalVotes} głosów · {timeLeft}
          </span>
        </div>

        <h3
          className={cn(
            'mt-2 font-display font-bold leading-snug text-ink',
            compact ? 'text-[15px]' : 'text-[20px]',
          )}
        >
          {pollItem.title}
        </h3>

        <div className={cn('mt-2.5', compact ? 'space-y-1.5' : 'space-y-2')}>
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
                  'relative w-full overflow-hidden rounded-xl bg-white text-left transition-all cursor-pointer',
                  compact ? 'px-3 py-1.5' : 'px-4 py-3',
                  !isVoted && 'active:scale-[.99] hover:bg-white/90',
                  isMyChoice && 'ring-1.5 ring-ink shadow-xs',
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
                <span
                  className={cn(
                    'relative z-10 flex items-center justify-between gap-2 font-semibold',
                    compact ? 'text-[12px]' : 'text-[14px]',
                  )}
                >
                  <span className="flex items-center gap-1.5 min-w-0 flex-1 break-words">
                    {isMyChoice && <Check className="h-3.5 w-3.5 shrink-0 text-ink" aria-hidden />}
                    <span className="truncate">{o.name}</span>
                  </span>
                  {isVoted && <span className="font-bold tabular-nums text-ink shrink-0">{pct}%</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {onOpenPolls && (
        <button
          type="button"
          onClick={onOpenPolls}
          className={cn(
            'mt-3 flex w-full items-center justify-between rounded-xl bg-white px-3 py-2 shadow-xs hover:bg-mist/60 transition-colors cursor-pointer',
          )}
        >
          <span className="text-[11.5px] font-bold text-ink">
            Wszystkie ankiety ({totalActiveCount})
          </span>
          <span className="flex items-center gap-1 text-[11px] font-bold text-coral-700">
            Archiwum i wyniki <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </button>
      )}
    </div>
  );
}

interface HomeScreenProps {
  user: User | null;
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
  adsList?: Ad[];
  ridesList?: Ride[];
  onAdClick?: (ad: Ad) => void;
  onAddAd?: () => void;
  onNeighborClick?: (name: string, street: string) => void;
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
  adsList = initialAds,
  ridesList = initialRides,
  onAdClick,
  onAddAd,
  onNeighborClick,
}: HomeScreenProps) {
  const [desktopAlertDismissed, setDesktopAlertDismissed] = useState(false);

  const activePolls = polls
    .filter((p) => isPollActive(p))
    .sort((a, b) => b.totalVotes - a.totalVotes);
  const featuredPoll = activePolls[0] ?? null;
  const userVoteForFeatured = featuredPoll ? userVotes[featuredPoll.id] : undefined;

  // Quick ZDiTM departures for the 1-line desktop status bar
  const m2Deps = getUpcomingDepartures('M2', busLines[0].stops[0], 0);
  const m3Deps = getUpcomingDepartures('M3', busLines[1].stops[0], 0);
  const m4Deps = getUpcomingDepartures('M4', busLines[2].stops[0], 0);

  const quick = [
    { label: 'Rozkład', href: '/zditm/m2', icon: Bus, cls: 'bg-sky-100 text-ink', onClick: () => (onZditm ? onZditm('M2') : onTab('home')) },
    { label: 'Ogłoszenia', href: TAB_PATHS.ads, icon: Megaphone, cls: 'bg-white text-ink', onClick: () => onTab('ads') },
    { label: 'Przejazd', href: TAB_PATHS.rides, icon: Car, cls: 'bg-coral-100 text-ink', onClick: () => onTab('rides') },
    { label: 'Rozmowy', href: TAB_PATHS.talks, icon: MessagesSquare, cls: 'bg-sand text-ink', onClick: () => onTab('talks') },
  ];

  const latestAds = adsList.filter((a) => (a.status ?? 'active') === 'active').slice(0, 6);
  const latestPosts = seedPosts.slice(0, 3);
  const upcomingRides = ridesList.slice(0, 3);

  return (
    <>
      {/* =====================================================================
       * 1. MOBILE VIEW (< 768px) — 100% Native PWA Mobile Layout
       * =================================================================== */}
      <div className="space-y-6 pb-36 md:hidden">
        <StandardTopBar
          user={user}
          onProfile={onProfile}
          title={
            <button onClick={onProfile} className="text-left leading-none active:opacity-75 transition-opacity">
              <span className="block text-[12px] font-semibold text-ink-500 leading-none mb-1">
                {greeting()},
              </span>
              <span className="font-display text-[22px] font-bold text-ink leading-none">
                {user ? `${user.name} 👋` : 'Sąsiedzie 👋'}
              </span>
            </button>
          }
        />

        <WeatherCard city={city} />

        <div className="grid grid-cols-4 gap-2.5 px-5">
          {quick.map(({ label, href, icon: Icon, cls, onClick }) => (
            <AppLink
              key={label}
              to={href}
              onClick={onClick}
              className="flex flex-col items-center gap-1.5 active:scale-95"
            >
              <span className={cn('grid h-16 w-full place-items-center rounded-3xl shadow-card', cls)}>
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <span className="text-[12px] font-semibold text-ink-700">{label}</span>
            </AppLink>
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
                  <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[10.5px] font-bold">
                    {n.tag}
                  </span>
                </div>
                <div className="p-3.5">
                  <p className="line-clamp-2 text-[14px] font-bold leading-snug">{n.title}</p>
                  <p className="mt-2 text-[11px] font-medium text-ink-400">
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

        <button
          onClick={onPartner}
          className="relative mx-5 block w-[calc(100%-2.5rem)] overflow-hidden rounded-4xl bg-ink p-5 text-left shadow-card"
        >
          <Img
            src={partner.hero}
            alt=""
            className="absolute inset-y-0 right-0 h-full w-1/2 opacity-90 [mask-image:linear-gradient(to_left,black_40%,transparent)]"
          />
          <span className="relative text-[10.5px] font-bold uppercase tracking-[.16em] text-sand">
            Strefa Partnera
          </span>
          <p className="relative mt-1 max-w-[62%] font-display text-[23px] font-semibold leading-tight text-white">
            {partner.name}
          </p>
          <p className="relative mt-1 max-w-[58%] text-[12px] text-white/70">
            −15% na biżuterię dla sąsiadów z mójMińsk
          </p>
          <span className="relative mt-4 inline-flex items-center gap-1 rounded-full bg-sand px-3.5 py-2 text-[12.5px] font-bold text-ink">
            Zobacz kolekcję <ArrowRight className="h-4 w-4" aria-hidden />
          </span>
        </button>

        <Card className="mx-5 flex items-center gap-3.5 p-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-coral-100">
            <Coffee className="h-5 w-5 text-coral-700" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold">Postaw kawę mójMińsk</p>
            <p className="text-[12px] text-ink-500">Niezależna aplikacja bez polityki i hejtu</p>
          </div>
          <button className="rounded-full bg-ink px-4 py-2 text-[12.5px] font-bold text-white">
            BLIK
          </button>
        </Card>
      </div>

      {/* =====================================================================
       * 2. DESKTOP VIEW (>= 768px) — 100% Full-Width City Portal & Magazine
       * =================================================================== */}
      <div className="hidden md:block w-full px-8 lg:px-12 py-5 space-y-6">
        {/* ROW 1: COMPACT 1-LINE CITY STATUS BAR (Weather + GIOŚ Air + ZDiTM Live + Alert) */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-2.5 shadow-card border border-mist-200 text-[12.5px]">
          {/* Weather & GIOŚ Air Quality */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-bold text-ink">
              <MapPin className="h-3.5 w-3.5 text-coral-700" />
              {city}
            </span>
            <span className="text-mist-300">|</span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-ink-700">
              <Sun className="h-4 w-4 text-amber-500" />
              <b className="text-ink">{weather.temp}°C</b> {weather.condition}
              <span className="hidden xl:inline text-ink-400">
                (odczuwalna {weather.feels}°C · wiatr {weather.wind} km/h)
              </span>
            </span>
            <span className="text-mist-300">|</span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-[11.5px] font-bold text-emerald-800 border border-emerald-200/70">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              GIOŚ PM2.5: {weather.aqi.pm25} µg/m³ ({weather.aqi.label})
            </span>
          </div>

          {/* Nearest ZDiTM Departures 1-Line Strip */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-ink-600">
              <Bus className="h-3.5 w-3.5 text-sky-700" />
              <span className="hidden lg:inline font-bold text-ink">Odjazdy ZDiTM:</span>
            </div>

            <AppLink
              to="/zditm/m2"
              onClick={() => onZditm?.('M2')}
              className="inline-flex items-center gap-1 rounded-md bg-mist/80 px-2 py-1 text-[11.5px] font-bold text-ink hover:bg-mist-300 transition-colors"
            >
              <span className="rounded bg-sky px-1.5 py-0.2 text-[10px] font-extrabold text-ink">M2</span>
              <span>za {m2Deps[0]} min</span>
            </AppLink>

            <AppLink
              to="/zditm/m3"
              onClick={() => onZditm?.('M3')}
              className="inline-flex items-center gap-1 rounded-md bg-mist/80 px-2 py-1 text-[11.5px] font-bold text-ink hover:bg-mist-300 transition-colors"
            >
              <span className="rounded bg-sand px-1.5 py-0.2 text-[10px] font-extrabold text-ink">M3</span>
              <span>za {m3Deps[0]} min</span>
            </AppLink>

            <AppLink
              to="/zditm/m4"
              onClick={() => onZditm?.('M4')}
              className="inline-flex items-center gap-1 rounded-md bg-mist/80 px-2 py-1 text-[11.5px] font-bold text-ink hover:bg-mist-300 transition-colors"
            >
              <span className="rounded bg-coral px-1.5 py-0.2 text-[10px] font-extrabold text-ink">M4</span>
              <span>za {m4Deps[0]} min</span>
            </AppLink>

            <AppLink
              to={buildZditmUrl('M2')}
              onClick={() => onZditm?.('M2')}
              className="text-[11.5px] font-bold text-sky-700 hover:underline ml-1"
            >
              Rozkład ➔
            </AppLink>
          </div>
        </div>

        {/* OPTIONAL COMPACT CRISIS ALERT BAR */}
        {!desktopAlertDismissed && (
          <div className="flex items-center justify-between gap-4 rounded-xl border-l-4 border-coral bg-white px-4 py-2.5 shadow-card text-[12.5px]">
            <div className="flex items-center gap-3 min-w-0">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-coral-100 px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider text-coral-800 shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-coral animate-ping" />
                Alert Miejski
              </span>
              <p className="font-bold text-ink truncate">{liveAlert.title}</p>
              <span className="hidden lg:inline text-ink-400">—</span>
              <p className="hidden lg:inline text-ink-600 truncate">{liveAlert.description}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Zweryfikowano ({liveAlert.time})
              </span>
              <button
                type="button"
                onClick={() => setDesktopAlertDismissed(true)}
                className="grid h-6 w-6 place-items-center rounded-md text-ink-400 hover:bg-mist hover:text-ink"
                aria-label="Ukryj alert"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ROW 2: 3 EQUAL-HEIGHT CARDS IN ONE ROW (1. News Feed List | 2. Poll of the Week | 3. Partner Card) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* 1. CO SŁYCHAĆ W MIŃSKU (5 cols): Compact Row List with 56x56 Thumbnails */}
          <section className="lg:col-span-5 flex flex-col justify-between rounded-2xl bg-white p-4 shadow-xs border border-mist-200">
            <div>
              <div className="flex items-center justify-between gap-2 border-b border-mist-100 pb-2.5">
                <div className="flex items-baseline gap-2">
                  <h2 className="font-display text-[15px] font-extrabold tracking-tight text-ink">
                    Co słychać w Mińsku
                  </h2>
                  <span className="text-[11px] font-medium text-ink-400">
                    Lokalny puls miasta
                  </span>
                </div>
                <span className="rounded-md bg-mist px-2 py-0.5 text-[10px] font-bold text-ink-500">
                  Dzisiaj
                </span>
              </div>

              <div className="divide-y divide-mist-100">
                {news.map((n) => (
                  <article
                    key={n.id}
                    className="group flex items-center gap-3 py-2.5 first:pt-3 last:pb-1 cursor-pointer"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-mist border border-mist-200/60">
                      <Img
                        src={n.image}
                        alt={n.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[10.5px]">
                        <span className="rounded bg-mist px-1.5 py-0.2 font-bold text-ink-600">
                          {n.tag}
                        </span>
                        <span className="text-ink-400 font-medium truncate">
                          {n.source} · {n.time}
                        </span>
                      </div>
                      <h3 className="mt-0.5 line-clamp-1 font-display text-[13px] font-bold text-ink group-hover:text-coral-700 transition-colors">
                        {n.title}
                      </h3>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onTab('talks')}
              className="mt-3 flex w-full items-center justify-between rounded-xl bg-mist/60 px-3 py-2 text-left hover:bg-mist transition-colors cursor-pointer"
            >
              <span className="text-[11.5px] font-bold text-ink-700">
                Widzisz zdarzenie na swojej ulicy?
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-coral-700">
                Napisz w Rozmowach <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          </section>

          {/* 2. ANKIETA TYGODNIA (4 cols): Equal Height Center Card */}
          <div className="lg:col-span-4 h-full">
            <FeaturedPollCard
              pollItem={featuredPoll}
              userVoteId={userVoteForFeatured}
              onVote={onVote}
              onOpenPolls={onOpenPolls}
              totalActiveCount={activePolls.length}
              compact
            />
          </div>

          {/* 3. PARTNER TYGODNIA (3 cols): Equal Height Right Card */}
          <div className="lg:col-span-3 flex flex-col justify-between rounded-2xl bg-ink p-4 text-white shadow-xs border border-ink">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center rounded-full bg-sand px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-ink">
                  Partner Tygodnia
                </span>
                <span className="text-[10.5px] font-semibold text-white/60">
                  Mińsk Maz.
                </span>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-white/10">
                  <Img src={partner.hero} alt={partner.name} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-[15px] font-bold text-white leading-tight truncate">
                    {partner.name}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-white/65 truncate">
                    {partner.address}
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-xl bg-white/[.07] border border-white/10 p-2.5 flex items-center justify-between gap-2">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-sand">
                    Zniżka dla sąsiadów
                  </span>
                  <span className="font-display text-[18px] font-extrabold text-white leading-none">
                    −15% <span className="text-[11px] font-medium text-white/70">z kodem {partner.code}</span>
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onPartner}
              className="mt-3 flex w-full items-center justify-between rounded-xl bg-sand px-3 py-2 text-ink hover:bg-sand-200 transition-colors cursor-pointer"
            >
              <span className="text-[11.5px] font-bold">Strefa Partnera</span>
              <span className="flex items-center gap-1 text-[11px] font-extrabold">
                Odbierz rabat <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          </div>
        </div>

        {/* ROW 3: FULL-WIDTH SECTION — NAJNOWSZE OGŁOSZENIA SĄSIADÓW (4-5-6 compact cards in a row) */}
        <section className="rounded-2xl bg-white p-5 shadow-card border border-mist-200">
          <div className="mb-4 flex items-center justify-between border-b border-mist pb-3">
            <div className="flex items-baseline gap-3">
              <h2 className="font-display text-[19px] font-extrabold tracking-tight text-ink">
                Najnowsze ogłoszenia sąsiadów
              </h2>
              <span className="text-[12px] font-medium text-ink-400">
                Sprzedawaj, kupuj i oddawaj za darmo bezpośrednio na swojej ulicy
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {onAddAd && (
                <button
                  type="button"
                  onClick={onAddAd}
                  className="flex items-center gap-1 rounded-lg bg-mist px-3 py-1.5 text-[12px] font-bold text-ink hover:bg-mist-300 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Dodaj ogłoszenie
                </button>
              )}
              <AppLink
                to="/ogloszenia"
                onClick={() => onTab('ads')}
                className="flex items-center gap-1 rounded-lg bg-ink px-3.5 py-1.5 text-[12px] font-bold text-white hover:bg-ink-700 transition-colors"
              >
                <span>Wszystkie ogłoszenia ({adsList.length})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </AppLink>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5 items-stretch">
            {latestAds.map((ad) => {
              const adHref = buildAdUrl(ad);
              return (
                <article
                  key={ad.id}
                  className="group flex flex-col justify-between rounded-xl bg-mist/35 p-2.5 border border-mist-200 hover:bg-white hover:border-ink/25 hover:shadow-card transition-all h-full"
                >
                  <AppLink
                    to={adHref}
                    onClick={() => (onAdClick ? onAdClick(ad) : onTab('ads'))}
                    className="block cursor-pointer"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-mist">
                      <Img
                        src={ad.image}
                        alt={ad.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {ad.kind === 'free' && (
                        <span className="absolute left-2 top-2 rounded bg-emerald-600 px-2 py-0.5 text-[9.5px] font-extrabold text-white shadow">
                          Za darmo
                        </span>
                      )}
                      {ad.kind === 'lost' && (
                        <span className="absolute left-2 top-2 rounded bg-coral px-2 py-0.5 text-[9.5px] font-extrabold text-ink shadow">
                          Zgubiono
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5 px-0.5">
                      <div className="flex items-baseline justify-between gap-1">
                        <p className="font-display text-[15px] font-extrabold text-ink leading-none">
                          {ad.price ? zl(ad.price) : ad.kind === 'free' ? 'Za darmo' : 'Pomóż'}
                        </p>
                        <span className="text-[10px] font-medium text-ink-400 shrink-0">{ad.time}</span>
                      </div>
                      <h3 className="mt-1 line-clamp-2 min-h-[2.6em] text-[12.5px] font-bold leading-snug text-ink group-hover:text-coral-700 transition-colors">
                        {ad.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 min-h-[2.5em] text-[11px] leading-relaxed text-ink-500">
                        {ad.description || `Odbiór osobisty w Mińsku Mazowieckim (ul. ${ad.street}).`}
                      </p>
                    </div>
                  </AppLink>

                  <AppLink
                    to={adHref}
                    onClick={() => (onAdClick ? onAdClick(ad) : onTab('ads'))}
                    className="mt-2.5 flex items-center justify-between gap-2 border-t border-mist-200/80 pt-2 px-0.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={avatarUrl(ad.author)}
                        alt={ad.author}
                        width={22}
                        height={22}
                        className="h-5.5 w-5.5 shrink-0 rounded-full bg-sand-100 object-cover ring-1 ring-mist-300"
                      />
                      <div className="min-w-0 leading-tight">
                        <p className="truncate text-[11px] font-bold text-ink">{ad.author}</p>
                        <p className="truncate text-[10px] font-medium text-ink-400">ul. {ad.street}</p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-ink-600 border border-mist-200 group-hover:border-ink group-hover:bg-ink group-hover:text-white transition-colors">
                      Oferta
                    </span>
                  </AppLink>
                </article>
              );
            })}
          </div>
        </section>

        {/* ROW 4: BOTTOM 2-COLUMN PORTAL ROW (Left 7 cols: Ostatnie wpisy z Rozmów | Right 5 cols: Wspólne przejazdy) */}
        <div className="grid grid-cols-12 gap-6 items-stretch">
          {/* LEFT 7 COLS: Ostatnie wpisy ze Strefy Rozmów */}
          <section className="col-span-12 lg:col-span-7 flex flex-col justify-between rounded-2xl bg-white p-5 shadow-card border border-mist-200">
            <div>
              <div className="mb-3.5 flex items-center justify-between border-b border-mist pb-3">
                <div className="flex items-baseline gap-2.5">
                  <h2 className="font-display text-[18px] font-extrabold tracking-tight text-ink">
                    Ostatnie wpisy ze Strefy Rozmów
                  </h2>
                  <span className="text-[11.5px] font-medium text-ink-400">
                    O czym rozmawiają sąsiedzi
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onTab('talks')}
                  className="flex items-center gap-1 text-[12px] font-bold text-coral-700 hover:underline"
                >
                  <span>Wszystkie dyskusje</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="divide-y divide-mist">
                {latestPosts.map((p) => {
                  const matchedStreet =
                    streets.find((s) => s.as === p.authorAs)?.name ??
                    p.authorAs.replace(/^ze?\s+/i, '');
                  return (
                    <article
                      key={p.id}
                      onClick={() => onTab('talks')}
                      className="flex gap-3.5 py-3 first:pt-0 last:pb-0 cursor-pointer hover:bg-mist/30 rounded-lg px-2 -mx-2 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNeighborClick?.(p.author, matchedStreet);
                        }}
                        className="shrink-0 self-start"
                      >
                        <img
                          src={avatarUrl(p.author)}
                          alt={p.author}
                          className="h-9 w-9 rounded-full bg-sand-100 object-cover ring-1 ring-mist-300"
                        />
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[13px] font-bold text-ink">
                            {p.author}{' '}
                            <span className="font-semibold text-ink-500">{p.authorAs}</span>
                          </p>
                          <span className="text-[11px] font-medium text-ink-400">{p.time}</span>
                        </div>
                        <p className="mt-0.5 text-[13px] leading-snug text-ink-700 line-clamp-2">
                          {p.content}
                        </p>
                        <div className="mt-1.5 flex items-center gap-4 text-[11.5px] font-semibold text-ink-400">
                          <span className="inline-flex items-center gap-1">
                            <MessageCircle className="h-3.5 w-3.5" /> {p.replies} odpowiedzi
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Heart className="h-3.5 w-3.5" /> {p.likes} polubień
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-mist flex items-center justify-between">
              <span className="text-[12px] text-ink-500">
                Każdy wpis podpisany jest imieniem i ulicą sąsiada
              </span>
              <button
                type="button"
                onClick={() => onTab('talks')}
                className="rounded-lg bg-mist px-3.5 py-1.5 text-[12px] font-bold text-ink hover:bg-mist-300 transition-colors"
              >
                Dołącz do rozmowy ➔
              </button>
            </div>
          </section>

          {/* RIGHT 5 COLS: Wspólne przejazdy (Carpooling) + Nova Taxi */}
          <section className="col-span-12 lg:col-span-5 flex flex-col justify-between rounded-2xl bg-white p-5 shadow-card border border-mist-200">
            <div>
              <div className="mb-3.5 flex items-center justify-between border-b border-mist pb-3">
                <div>
                  <h2 className="font-display text-[18px] font-extrabold tracking-tight text-ink">
                    Wspólne przejazdy (Carpooling)
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => onTab('rides')}
                  className="flex items-center gap-1 text-[12px] font-bold text-sky-700 hover:underline"
                >
                  <span>Wszystkie przejazdy</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {upcomingRides.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => onTab('rides')}
                    className="flex items-center justify-between gap-3 rounded-xl bg-mist/45 p-3 border border-mist-200 hover:bg-mist/80 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={avatarUrl(r.driver)}
                        alt={r.driver}
                        className="h-8 w-8 shrink-0 rounded-full bg-sand-100 object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-bold text-ink">
                          {r.from} ➔ {r.to}
                        </p>
                        <p className="truncate text-[11px] font-medium text-ink-500">
                          {r.driver} {r.driverAs} · wyjazd <b className="text-ink">{r.depart}</b>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-display text-[14.5px] font-extrabold text-ink leading-none">
                        {r.price} zł
                      </p>
                      <p className="mt-0.5 text-[10.5px] font-semibold text-ink-400 flex items-center justify-end gap-0.5">
                        <Users className="h-3 w-3" /> {r.seats} msc.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compact Nova Taxi Bar */}
            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-ink px-4 py-3 text-white">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-[14.5px] font-bold text-white">Nova Taxi Mińsk Maz.</span>
                  <span className="rounded bg-sand/20 px-1.5 py-0.2 text-[10px] font-bold text-sand">
                    −10% MOJMINSK
                  </span>
                </div>
                <p className="text-[11px] text-white/70">Wyłączny partner przejazdów · podjazd 5–10 min</p>
              </div>
              <a
                href="tel:+48257582222"
                className="flex items-center gap-1.5 rounded-lg bg-coral px-3 py-1.5 text-[12px] font-extrabold text-ink hover:bg-coral-400 transition-colors shrink-0"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>25 758 22 22</span>
              </a>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
