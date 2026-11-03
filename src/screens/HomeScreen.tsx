import { useEffect, useState } from 'react';
import {
  ArrowRight,
  ArrowRightLeft,
  Bus,
  Car,
  Check,
  ChevronDown,
  ChevronUp,
  Droplets,
  Gauge,
  Heart,
  MapPin,
  Megaphone,
  MessageCircle,
  Newspaper,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  TriangleAlert,
  Users,
  Vote,
  Wrench,
  X,
} from 'lucide-react';
import {
  INITIAL_SERVICE_PROVIDERS,
  computeProviderRatingStats,
  getServiceCategoryById,
  type ServiceProvider,
} from '../data/servicesData';
import {
  ads as initialAds,
  avatarUrl,
  busLines,
  getAdAuthorSeed,
  getPostAuthorSeed,
  getRideDriverSeed,
  getCurrentTimetableDay,
  getNextScheduledBus,
  getOfficialStopTimetable,
  getPollTimeLeftLabel,
  initialPolls,
  isPollActive,
  liveAlert,
  news,
  partner,
  resolveStreetName,
  formatResidentLabel,
  rides as initialRides,
  type Ad,
  type LineId,
  type PollItem,
  type Post,
  type Ride,
  type User,
} from '../data/mockData';
import { fetchPostsFromSupabase } from '../lib/supabase';
import { Card, Img, SectionHeader, StandardTopBar, cn, zl } from '../components/ui';
import { BuyCoffeeButton } from '../components/BuyCoffeeButton';
import { AppLink } from '../components/AppLink';
import { buildAdUrl, buildServiceProviderUrl, buildZditmMapUrl, TAB_PATHS } from '../router/urlUtils';
import type { TabId } from '../components/BottomNav';
import { useWeather } from '../hooks/useWeather';
import {
  WeatherIllustration,
  WeatherInfographicsRow,
  type WeatherIconKind,
} from '../components/WeatherInfographics';
import type { WeatherData } from '../services/weatherService';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Dzień dobry' : h < 18 ? 'Cześć' : 'Dobry wieczór';
};

function HourlyWeatherIcon({ icon, isDay }: { icon: string; isDay: boolean }) {
  return (
    <WeatherIllustration
      icon={(icon as WeatherIconKind) || 'sun'}
      isDay={isDay}
      animated={false}
      className="h-6 w-6"
    />
  );
}

function formatAirQualityBadge(label: string): string {
  const norm = label.trim().toLowerCase();
  if (norm === 'bardzo dobra') return 'Powietrze: bardzo dobre';
  if (norm === 'dobra') return 'Powietrze: dobre';
  if (norm === 'umiarkowana') return 'Powietrze: umiarkowane';
  if (norm === 'dostateczna') return 'Powietrze: dostateczne';
  if (norm === 'zła') return 'Powietrze: złe';
  if (norm === 'bardzo zła') return 'Powietrze: bardzo złe';
  return `Jakość: ${label}`;
}

function WeatherCard({
  city = 'Mińsk Mazowiecki',
  weather,
  onRefresh,
  refreshing,
}: {
  city?: string;
  weather: WeatherData;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [expandedTab, setExpandedTab] = useState<'indicators' | 'daily' | 'biomet'>('indicators');

  return (
    <section className="px-5">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky via-sky/85 to-sky-100 p-4 shadow-card">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/15 pointer-events-none" aria-hidden />

        {/* 1. COMPACT HERO: CURRENT CONDITIONS & QUICK STATUS */}
        <div className="relative flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-ink/75">
              <MapPin className="h-3 w-3 text-coral-600 shrink-0" aria-hidden />
              <span className="truncate">{city}</span>
              {onRefresh && (
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={refreshing}
                  className="grid h-5 w-5 place-items-center rounded-full bg-white/60 hover:bg-white text-ink-600 transition-all cursor-pointer disabled:opacity-50"
                  title="Odśwież pogodę"
                >
                  <RefreshCw className={cn('h-2.5 w-2.5', refreshing && 'animate-spin text-sky-700')} />
                </button>
              )}
            </div>

            <div className="mt-1 flex items-baseline gap-2.5">
              <span className="font-display text-[42px] font-bold leading-none tracking-tight text-ink">
                {weather.temp}°
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-ink leading-tight truncate">
                  {weather.condition}
                </p>
                <p className="text-[11px] font-medium text-ink/70 leading-tight mt-0.5">
                  odcz. {weather.feels}° · ↑{weather.max}° ↓{weather.min}°
                </p>
              </div>
            </div>
          </div>

          {/* Right: Weather icon + interactive AQI badge */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <WeatherIllustration icon={weather.icon} isDay={weather.isDay} className="h-16 w-16 -mr-1" />
            <button
              type="button"
              onClick={() => {
                setIsExpanded(true);
                setExpandedTab('biomet');
              }}
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold border bg-white/80 backdrop-blur-xs transition-transform active:scale-95 shadow-2xs cursor-pointer',
                weather.aqi.color
              )}
              title="Szczegóły jakości powietrza GIOŚ"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span>{formatAirQualityBadge(weather.aqi.label)}</span>
            </button>
          </div>
        </div>

        {/* 2. COMPACT HOURLY FORECAST STRIP */}
        <div className="relative mt-3 -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-0.5 no-scrollbar">
          {weather.hourly.slice(0, 10).map((item, i) => (
            <div
              key={i}
              className={cn(
                'flex w-[52px] shrink-0 flex-col items-center justify-between rounded-xl py-1.5 px-1 text-center transition-all',
                i === 0 ? 'bg-ink text-white shadow-xs' : 'bg-white/70 text-ink'
              )}
            >
              <p className={cn('text-[9.5px] font-semibold leading-none', i === 0 ? 'text-white/80' : 'text-ink-500')}>
                {i === 0 ? 'Teraz' : item.timeStr}
              </p>
              <div className="my-1 flex flex-col items-center gap-0.5">
                <HourlyWeatherIcon icon={item.icon} isDay={item.isDay} />
                {item.rainChance >= 20 ? (
                  <span className={cn('text-[8.5px] font-extrabold leading-none', i === 0 ? 'text-sky-300' : 'text-sky-700')}>
                    {item.rainChance}%
                  </span>
                ) : null}
              </div>
              <p className="font-display text-[13px] font-extrabold leading-none">{item.temp}°</p>
            </div>
          ))}
        </div>

        {/* 3. ALERTS (ALWAYS VISIBLE IF ACTIVE) */}
        {weather.alerts.length > 0 && (
          <div className="relative mt-2.5 flex items-start gap-2 rounded-xl bg-coral-50/90 border border-coral-200/80 p-2 text-[11px] text-coral-950 shadow-2xs">
            <TriangleAlert className="h-3.5 w-3.5 shrink-0 text-coral-600 mt-0.5" />
            <span className="font-semibold leading-tight">{weather.alerts[0].title}</span>
          </div>
        )}

        {/* 4. PROGRESSIVE INLINE DISCLOSURE (NO MODALS) */}
        {!isExpanded ? (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="w-full mt-2.5 py-1.5 px-3 rounded-xl bg-white/70 hover:bg-white/90 active:bg-white text-ink-700 font-bold text-[11px] flex items-center justify-center gap-1.5 border border-white/60 shadow-2xs transition-all cursor-pointer"
          >
            <span>Szczegóły: wiatr, 7 dni, biomet</span>
            <ChevronDown className="w-3.5 h-3.5 text-ink-500" />
          </button>
        ) : (
          <div className="relative mt-3 pt-3 border-t border-white/40 space-y-3">
            {/* Segmented control inside expanded view */}
            <div className="flex items-center gap-1 rounded-xl bg-white/60 p-1 border border-white/60 shadow-2xs">
              <button
                type="button"
                onClick={() => setExpandedTab('indicators')}
                className={cn(
                  'flex-1 rounded-lg py-1.5 text-[11px] font-bold transition-all cursor-pointer text-center',
                  expandedTab === 'indicators' ? 'bg-ink text-white shadow-xs' : 'text-ink-600 hover:text-ink'
                )}
              >
                Wskaźniki & Wiatr
              </button>
              <button
                type="button"
                onClick={() => setExpandedTab('daily')}
                className={cn(
                  'flex-1 rounded-lg py-1.5 text-[11px] font-bold transition-all cursor-pointer text-center',
                  expandedTab === 'daily' ? 'bg-ink text-white shadow-xs' : 'text-ink-600 hover:text-ink'
                )}
              >
                Prognoza 7 dni
              </button>
              <button
                type="button"
                onClick={() => setExpandedTab('biomet')}
                className={cn(
                  'flex-1 rounded-lg py-1.5 text-[11px] font-bold transition-all cursor-pointer text-center',
                  expandedTab === 'biomet' ? 'bg-ink text-white shadow-xs' : 'text-ink-600 hover:text-ink'
                )}
              >
                Smog & Biomet
              </button>
            </div>

            {/* TAB CONTENT: WSKAŹNIKI & WIATR */}
            {expandedTab === 'indicators' && (
              <div className="space-y-2">
                <WeatherInfographicsRow weather={weather} className="grid-cols-2" />
              </div>
            )}

            {/* TAB CONTENT: 7 DNI */}
            {expandedTab === 'daily' && (
              <div className="divide-y divide-white/40 rounded-2xl bg-white/70 backdrop-blur-xs p-2 shadow-xs">
                {weather.daily.map((d, idx) => (
                  <div key={d.date} className="flex items-center justify-between py-2 px-1 text-[11.5px]">
                    <div className="flex items-center gap-2 w-28 shrink-0">
                      <WeatherIllustration icon={d.icon} isDay animated={false} className="h-6 w-6" />
                      <span className="font-bold text-ink">{d.dayName}</span>
                      {idx === 0 && <span className="text-[9px] text-sky-700 font-extrabold">dziś</span>}
                    </div>
                    <div className="text-[11px] text-ink-500 truncate flex-1 px-1">
                      {d.rainChance > 0 ? (
                        <span className="text-sky-700 font-bold">{d.rainChance}% ({d.rainSum} mm)</span>
                      ) : (
                        <span>Bez opadów</span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-slate-600 font-bold text-[12.5px]">{d.minTemp}°</span>{' '}
                      <span className="text-slate-400 font-normal text-[10.5px]">/</span>{' '}
                      <span className="text-ink font-black font-display text-[14px]">{d.maxTemp}°</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT: SMOG & BIOMET */}
            {expandedTab === 'biomet' && (
              <div className="space-y-2">
                <div className="rounded-2xl bg-white/80 p-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-mist-100 pb-1.5">
                    <span className="text-[11px] font-bold text-ink">Stacja pomiarowa GIOŚ Mińsk Maz.</span>
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-extrabold border', weather.aqi.color)}>
                      {weather.aqi.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11.5px] pt-2">
                    <span>PM2.5: <b>{weather.aqi.pm25} µg/m³</b></span>
                    <span>PM10: <b>{weather.aqi.pm10} µg/m³</b></span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-ink-600 leading-snug">
                    {weather.aqi.recommendation}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-xl bg-white/80 p-2.5 shadow-xs">
                    <span className="text-[9.5px] text-ink-400 font-bold uppercase">Ciśnienie atmosferyczne</span>
                    <p className="font-bold text-ink mt-0.5 text-[13px]">{weather.pressure} hPa</p>
                    <p className="text-[10px] text-ink-500">
                      {weather.pressureTrend === 'rising' ? '↑ Rośnie (dobry biomet)' : weather.pressureTrend === 'falling' ? '↓ Spada (meteopatia)' : 'Stabilne'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/80 p-2.5 shadow-xs">
                    <span className="text-[9.5px] text-ink-400 font-bold uppercase">Indeks UV</span>
                    <p className="font-bold text-amber-700 mt-0.5 text-[13px]">{weather.uv} ({weather.uvLabel})</p>
                    <p className="text-[10px] text-ink-500">
                      {weather.uv >= 3 ? 'Zalecany krem z filtrem' : 'Ochrona zbędna'}
                    </p>
                  </div>
                </div>

                <div className="text-[10px] text-ink-400 text-center pt-0.5">
                  Wschód: {weather.sunrise} · Zachód: {weather.sunset} · Długość dnia: {weather.dayLength}
                </div>
              </div>
            )}

            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="w-full mt-2 py-1.5 px-3 rounded-xl bg-white/70 hover:bg-white/90 active:bg-white text-ink-700 font-bold text-[11px] flex items-center justify-center gap-1.5 border border-white/60 shadow-2xs transition-all cursor-pointer"
            >
              <span>Zwiń szczegóły</span>
              <ChevronUp className="w-3.5 h-3.5 text-ink-500" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function DesktopWeatherWidget({
  city = 'Mińsk Mazowiecki',
  weather,
  onRefresh,
  refreshing,
}: {
  city?: string;
  weather: WeatherData;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const [tab, setTab] = useState<'today' | 'daily' | 'biomet'>('today');
  const alert = weather.alerts[0];

  const allMax = Math.max(...weather.daily.map((d) => d.maxTemp), weather.max);
  const allMin = Math.min(...weather.daily.map((d) => d.minTemp), weather.min);
  const tempRange = Math.max(1, allMax - allMin);

  return (
    <section className="h-full rounded-2xl bg-gradient-to-br from-sky/45 via-sky/20 to-white/90 p-4 shadow-xs border border-sky-200/80 text-ink flex flex-col justify-between gap-3">
      {/* HEADER WITH TITLE & INLINE TABS */}
      <div className="flex items-center justify-between gap-3 border-b border-ink/10 pb-2.5">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-coral-700" aria-hidden />
          <span className="font-display text-[14px] font-extrabold text-ink">{city}</span>
          <span className="text-ink-300">·</span>
          <span className="text-[11.5px] font-medium text-ink-500">Stacja GIOŚ & Open-Meteo</span>
        </div>

        {/* INLINE SEGMENTED TABS & REFRESH */}
        <div className="flex items-center gap-1.5">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className="grid h-7 w-7 place-items-center rounded-xl bg-white/80 text-ink-600 hover:text-ink hover:bg-white shadow-2xs border border-mist-200/90 transition-all cursor-pointer disabled:opacity-50"
              title="Odśwież dane z Open-Meteo"
            >
              <RefreshCw className={cn('h-3 w-3', refreshing && 'animate-spin text-sky-700')} />
            </button>
          )}
          <div className="flex items-center gap-1 rounded-xl bg-white/80 p-0.5 border border-mist-200/90 shadow-2xs">
          <button
            type="button"
            onClick={() => setTab('today')}
            className={cn(
              'rounded-lg px-3 py-1 text-[11px] font-bold transition-all cursor-pointer',
              tab === 'today'
                ? 'bg-ink text-white shadow-xs'
                : 'text-ink-600 hover:text-ink hover:bg-white/60'
            )}
          >
            Dziś i 24h
          </button>
          <button
            type="button"
            onClick={() => setTab('daily')}
            className={cn(
              'rounded-lg px-3 py-1 text-[11px] font-bold transition-all cursor-pointer',
              tab === 'daily'
                ? 'bg-ink text-white shadow-xs'
                : 'text-ink-600 hover:text-ink hover:bg-white/60'
            )}
          >
            Kolejne 7 dni
          </button>
          <button
            type="button"
            onClick={() => setTab('biomet')}
            className={cn(
              'rounded-lg px-3 py-1 text-[11px] font-bold transition-all cursor-pointer',
              tab === 'biomet'
                ? 'bg-ink text-white shadow-xs'
                : 'text-ink-600 hover:text-ink hover:bg-white/60'
            )}
          >
            Biomet & GIOŚ
          </button>
        </div>
        </div>
      </div>

      {/* TAB 1: TODAY & 24H */}
      {tab === 'today' && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col xl:flex-row xl:items-center gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <WeatherIllustration icon={weather.icon} isDay={weather.isDay} className="h-20 w-20 2xl:h-22 2xl:w-22" />
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-[40px] font-bold leading-none tracking-tight">{weather.temp}°</span>
                  <div className="leading-tight">
                    <p className="text-[14px] font-extrabold text-ink">{weather.condition}</p>
                    <p className="text-[11px] font-medium text-ink-600">
                      odcz. {weather.feels}° · ↑{weather.max}° ↓{weather.min}°
                    </p>
                  </div>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-[10.5px] font-semibold text-ink-500">
                  <Gauge className="h-3 w-3 text-ink-400" aria-hidden />
                  {weather.pressure} hPa
                  {weather.pressureTrend === 'rising' ? ' ↑' : weather.pressureTrend === 'falling' ? ' ↓' : ''}
                  <span className="text-ink-300">·</span>
                  <Droplets className="h-3 w-3 text-ink-400" aria-hidden />
                  {weather.humidity}%
                  <span className="text-ink-300">·</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.2 text-[9.5px] font-bold text-ink border border-mist-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    PM2.5: {weather.aqi.pm25} ({weather.aqi.label})
                  </span>
                </p>
              </div>
            </div>

            <div className="hidden xl:block h-14 w-px bg-ink/10 shrink-0" aria-hidden />

            <div className="grid grid-cols-8 gap-1.5 flex-1 min-w-0">
              {weather.hourly.slice(0, 8).map((item, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex flex-col items-center justify-between rounded-xl py-1.5 px-0.5 text-center transition-all',
                    i === 0
                      ? 'bg-ink text-white shadow-sm'
                      : 'bg-white/85 hover:bg-white text-ink shadow-2xs border border-white/60',
                  )}
                  title={`${item.timeStr}: ${item.temp}° · ${item.condition}`}
                >
                  <span className={cn('text-[9.5px] font-bold', i === 0 ? 'text-white/80' : 'text-ink-500')}>
                    {i === 0 ? 'Teraz' : item.timeStr}
                  </span>
                  <span className="my-0.5 h-6 w-6 flex items-center justify-center">
                    <HourlyWeatherIcon icon={item.icon} isDay={item.isDay} />
                  </span>
                  <span className="font-display text-[14px] font-extrabold leading-none">{item.temp}°</span>
                  <span
                    className={cn(
                      'mt-0.5 text-[8.5px] font-extrabold h-2.5',
                      i === 0 ? 'text-sky-300' : 'text-sky-700',
                    )}
                  >
                    {item.rainChance >= 20 ? `${item.rainChance}%` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 6 key infographics */}
          <WeatherInfographicsRow weather={weather} className="grid-cols-2 sm:grid-cols-3" />
        </div>
      )}

      {/* TAB 2: NEXT 7 DAYS INLINE */}
      {tab === 'daily' && (
        <div className="grid grid-cols-7 gap-2 items-stretch py-1">
          {weather.daily.map((d, idx) => {
            const leftPercent = Math.max(0, Math.min(100, ((d.minTemp - allMin) / tempRange) * 100));
            const widthPercent = Math.max(16, Math.min(100 - leftPercent, ((d.maxTemp - d.minTemp) / tempRange) * 100));

            return (
              <div
                key={d.date}
                className={cn(
                  'flex flex-col items-center justify-between rounded-xl p-2.5 text-center border shadow-2xs transition-colors',
                  idx === 0
                    ? 'bg-white/95 border-sky-300 ring-1 ring-sky-300'
                    : 'bg-white/80 border-white/80 hover:bg-white'
                )}
              >
                <div>
                  <p className="text-[11px] font-extrabold text-ink leading-tight">
                    {d.dayName}
                  </p>
                  <p className="text-[9.5px] text-ink-400 font-medium">{d.fullDate}</p>
                </div>

                <div className="my-1.5 flex flex-col items-center">
                  <WeatherIllustration icon={d.icon} isDay animated={false} className="h-11 w-11" />
                  <p className="text-[10px] font-bold text-ink line-clamp-1 mt-1 max-w-[85px]" title={d.condition}>
                    {d.condition}
                  </p>
                  {d.rainChance > 0 ? (
                    <span className="text-[9.5px] font-extrabold text-sky-700 mt-0.5">
                      {d.rainChance}% ({d.rainSum} mm)
                    </span>
                  ) : (
                    <span className="text-[9px] font-semibold text-ink-400 mt-0.5">Bez opadów</span>
                  )}
                </div>

                <div className="w-full pt-2 border-t border-slate-200/80">
                  <div className="flex items-baseline justify-between px-1">
                    <span className="text-[13px] font-bold text-slate-600">
                      {d.minTemp}°
                    </span>
                    <span className="font-display text-[16px] font-black text-ink">
                      {d.maxTemp}°
                    </span>
                  </div>
                  <div className="relative h-2 w-full rounded-full bg-slate-200 mt-1.5 overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-500 via-amber-500 to-rose-500"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: BIOMET & AIR QUALITY INLINE */}
      {tab === 'biomet' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 py-1">
          {/* Air Quality Summary (5 cols) */}
          <div className="xl:col-span-5 rounded-xl bg-white/90 border border-white/80 p-3 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-mist-100 pb-2">
              <span className="text-[11px] font-extrabold text-ink uppercase tracking-wide">
                Stacja GIOŚ Mińsk Maz.
              </span>
              <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-extrabold border', weather.aqi.color)}>
                {weather.aqi.label}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 my-2">
              <div className="rounded-lg bg-mist/60 p-2">
                <span className="text-[9.5px] font-bold text-ink-400 uppercase">Pył PM2.5</span>
                <p className="font-display text-[18px] font-extrabold text-ink leading-tight">
                  {weather.aqi.pm25} <span className="text-[10px] font-medium text-ink-400">µg/m³</span>
                </p>
                <span className="text-[9px] text-ink-400">Norma: 15 µg/m³</span>
              </div>
              <div className="rounded-lg bg-mist/60 p-2">
                <span className="text-[9.5px] font-bold text-ink-400 uppercase">Pył PM10</span>
                <p className="font-display text-[18px] font-extrabold text-ink leading-tight">
                  {weather.aqi.pm10} <span className="text-[10px] font-medium text-ink-400">µg/m³</span>
                </p>
                <span className="text-[9px] text-ink-400">Norma: 45 µg/m³</span>
              </div>
            </div>
            <p className="text-[10.5px] text-ink-600 leading-snug">
              <b>Zalecenie:</b> {weather.aqi.recommendation}
            </p>
          </div>

          {/* Biomet Details (7 cols) */}
          <div className="xl:col-span-7 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-white/90 border border-white/80 p-2.5 shadow-2xs">
              <span className="text-[10px] font-bold text-ink-400 uppercase">Ciśnienie i meteopatia</span>
              <p className="font-display text-[18px] font-bold text-ink mt-0.5 leading-none">
                {weather.pressure} hPa
              </p>
              <p className="text-[10.5px] font-semibold mt-1">
                {weather.pressureTrend === 'rising' && <span className="text-emerald-700">↑ Rośnie (korzystny biomet)</span>}
                {weather.pressureTrend === 'falling' && <span className="text-coral-700">↓ Spada (objawy meteopatii)</span>}
                {weather.pressureTrend === 'steady' && <span className="text-ink-600">Stabilne warunki</span>}
              </p>
            </div>

            <div className="rounded-xl bg-white/90 border border-white/80 p-2.5 shadow-2xs">
              <span className="text-[10px] font-bold text-ink-400 uppercase">Indeks UV</span>
              <p className="font-display text-[18px] font-bold text-ink mt-0.5 leading-none">
                {weather.uv} / 11
              </p>
              <p className="text-[10.5px] font-medium text-amber-700 mt-1">
                {weather.uvLabel} {weather.uv >= 3 ? '· krem z filtrem' : '· ochrona zbędna'}
              </p>
            </div>

            <div className="rounded-xl bg-white/90 border border-white/80 p-2.5 shadow-2xs">
              <span className="text-[10px] font-bold text-ink-400 uppercase">Punkt rosy i wilgotność</span>
              <p className="font-display text-[18px] font-bold text-ink mt-0.5 leading-none">
                {weather.dewPoint}°C <span className="text-[11px] font-medium text-ink-400">({weather.humidity}%)</span>
              </p>
              <p className="text-[10.5px] font-medium text-ink-500 mt-1">
                Komfort odczuwalny
              </p>
            </div>

            <div className="rounded-xl bg-white/90 border border-white/80 p-2.5 shadow-2xs">
              <span className="text-[10px] font-bold text-ink-400 uppercase">Widoczność drogowa</span>
              <p className="font-display text-[18px] font-bold text-ink mt-0.5 leading-none">
                {weather.visibility} km
              </p>
              <p className="text-[10.5px] font-medium text-ink-500 mt-1">
                {weather.visibility >= 10 ? 'Bardzo dobra na DK92 / A2' : 'Ograniczona widoczność'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="flex items-center justify-between gap-3 text-[10.5px] border-t border-ink/10 pt-2">
        {alert ? (
          <span className="flex items-center gap-1.5 font-bold text-coral-800 truncate">
            <TriangleAlert className="h-3.5 w-3.5 shrink-0 text-coral-700" />
            {alert.title}
          </span>
        ) : (
          <span className="font-medium text-ink-500 truncate">
            Aktualizacja: {weather.lastUpdated} · Open-Meteo & GIOŚ Mińsk Maz.
          </span>
        )}
        <span className="text-ink-400 font-medium">
          Długość dnia: <b>{weather.dayLength}</b> (wschód {weather.sunrise} · zachód {weather.sunset})
        </span>
      </div>
    </section>
  );
}

function LiveAlert() {
  const [dismissed, setDismissed] = useState(false);

  if (!liveAlert || dismissed) return null;

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
  onOpenFull?: (lineId?: LineId, stopName?: string) => void;
  onOpenMap?: (lineId?: LineId) => void;
}

const LINE_THEME: Record<
  LineId,
  { name: string; routeLabel: string; activeBtn: string; badge: string }
> = {
  M1: {
    name: 'Linia M1',
    routeLabel: 'Plac Dworcowy ⇄ Stojadła',
    activeBtn: 'bg-emerald-600 text-white shadow-xs',
    badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  },
  M2: {
    name: 'Linia M2',
    routeLabel: 'Plac Dworcowy ⇄ Serbinów',
    activeBtn: 'bg-sky-600 text-white shadow-xs',
    badge: 'bg-sky-100 text-sky-900 border-sky-300',
  },
  M3: {
    name: 'Linia M3',
    routeLabel: 'Rondo Żołnierzy Wyklętych ⇄ Osiedlowa',
    activeBtn: 'bg-amber-600 text-white shadow-xs',
    badge: 'bg-amber-100 text-amber-950 border-amber-300',
  },
  M4: {
    name: 'Linia M4',
    routeLabel: 'Plac Dworcowy — pętla przez Anielinę',
    activeBtn: 'bg-rose-600 text-white shadow-xs',
    badge: 'bg-rose-100 text-rose-950 border-rose-300',
  },
};

function BusWidget({ onOpenFull, onOpenMap }: BusWidgetProps) {
  const [selectedLineId, setSelectedLineId] = useState<LineId>('M2');
  const [directionIdx, setDirectionIdx] = useState<0 | 1>(0);

  const currentLine = busLines.find((l) => l.id === selectedLineId) || busLines[0];
  const currentDirection = currentLine.directions[directionIdx] || currentLine.directions[0];
  const activeStops: string[] = currentDirection.stops && currentDirection.stops.length > 0 ? currentDirection.stops : currentLine.stops;

  const [selectedStopName, setSelectedStopName] = useState<string>(() => activeStops[0]);

  const handleSelectLine = (id: LineId) => {
    setSelectedLineId(id);
    setDirectionIdx(0);
    const line = busLines.find((l) => l.id === id) || busLines[0];
    const stops: string[] = line.directions[0].stops && line.directions[0].stops.length > 0 ? line.directions[0].stops : line.stops;
    setSelectedStopName(stops[0]);
  };

  const handleToggleDirection = () => {
    setDirectionIdx((prev) => (prev === 0 ? 1 : 0));
  };

  const currentDay = getCurrentTimetableDay();
  const dayName = currentDay === 'weekday' ? 'Dni robocze' : currentDay === 'saturday' ? 'Soboty' : 'Niedziele';
  const timetable = getOfficialStopTimetable(selectedLineId, selectedStopName, directionIdx);
  const nextBus = getNextScheduledBus(timetable[currentDay]);
  const allDepartures = timetable[currentDay] || [];

  return (
    <Card className="mx-5 p-4">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-2 border-b border-mist-200 pb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-ink text-white">
            <Bus className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="font-display text-[14.5px] font-bold leading-tight text-ink">
              Rozkład jazdy ZDiTM
            </p>
            <p className="text-[10.5px] text-ink-500 font-medium">
              Wszystkie linie miejskie · {dayName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onOpenMap?.(selectedLineId)}
            className="text-[11px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-300 hover:bg-emerald-100 flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-2xs"
            title="Zobacz mapę linii i pozycję autobusu na żywo"
          >
            <span>🗺️ Mapa na żywo</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenFull?.(selectedLineId, selectedStopName)}
            className="text-[11.5px] font-bold text-sky-700 hover:text-sky-900 flex items-center gap-0.5"
          >
            <span>Pełny rozkład</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* LINE SELECTOR (M1, M2, M3, M4) */}
      <div className="mt-3 grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-mist/60 border border-mist-200">
        {(['M1', 'M2', 'M3', 'M4'] as LineId[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => handleSelectLine(id)}
            className={cn(
              'py-1.5 rounded-lg text-center font-display text-[13px] font-extrabold transition-all cursor-pointer',
              selectedLineId === id
                ? LINE_THEME[id].activeBtn
                : 'text-ink-600 hover:text-ink hover:bg-white/60'
            )}
          >
            {id}
          </button>
        ))}
      </div>

      {/* DIRECTION BAR */}
      <div className="mt-2.5 flex items-center justify-between gap-2 px-1">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400 block">
            Kierunek:
          </span>
          <p className="text-[12.5px] font-extrabold text-ink truncate leading-tight">
            ➔ {currentDirection.destination}
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggleDirection}
          className="inline-flex items-center gap-1 rounded-lg bg-mist hover:bg-mist-300 px-2 py-1 text-[10.5px] font-bold text-ink-700 transition-colors cursor-pointer shrink-0"
          title="Zmień kierunek trasy"
        >
          <ArrowRightLeft className="h-3 w-3" />
          <span>Odwróć</span>
        </button>
      </div>

      {/* STOPS STRIP */}
      <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {activeStops.map((stopName) => {
          const isActive = selectedStopName.toLowerCase() === stopName.toLowerCase();
          return (
            <button
              key={stopName}
              type="button"
              onClick={() => setSelectedStopName(stopName)}
              className={cn(
                'shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer border',
                isActive
                  ? 'bg-ink text-white border-ink shadow-xs'
                  : 'bg-mist/70 hover:bg-mist text-ink-600 border-mist-200'
              )}
            >
              {stopName}
            </button>
          );
        })}
      </div>

      {/* DEPARTURES HERO CARD */}
      <div className="mt-3 rounded-xl border border-mist-200 bg-mist/35 p-3">
        <div className="flex items-center justify-between gap-2 border-b border-mist-200/80 pb-2">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400 block">
              {nextBus?.isTomorrow ? 'Pierwszy kurs jutro:' : 'Najbliższy odjazd:'}
            </span>
            <p className="text-[12px] font-bold text-ink truncate">
              {selectedStopName}
            </p>
          </div>
          {nextBus && (
            <div className="rounded-xl bg-ink text-white px-3 py-1 font-mono text-[14px] font-black shadow-xs">
              {nextBus.isTomorrow ? `Jutro ${nextBus.time}` : nextBus.time}
            </div>
          )}
        </div>

        {/* ALL UPCOMING TIMES IN STRIP */}
        <div className="mt-2">
          <span className="text-[10px] font-semibold text-ink-400 block mb-1">
            Wszystkie odjazdy dzisiaj ({dayName}):
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto no-scrollbar">
            {allDepartures.map((time, idx) => (
              <span
                key={idx}
                className={cn(
                  'rounded-md px-1.5 py-0.5 font-mono text-[11px] font-bold border shadow-2xs',
                  !nextBus?.isTomorrow && nextBus?.time === time
                    ? 'bg-ink text-white border-ink'
                    : 'bg-white border-mist-200 text-ink-700'
                )}
              >
                {time}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

interface DesktopZditmWidgetProps {
  onOpenFull?: (lineId?: LineId, stopName?: string) => void;
  onOpenMap?: (lineId?: LineId) => void;
}

function DesktopZditmWidget({ onOpenFull, onOpenMap }: DesktopZditmWidgetProps) {
  const [selectedLineId, setSelectedLineId] = useState<LineId>('M2');
  const [directionIdx, setDirectionIdx] = useState<0 | 1>(0);

  const currentLine = busLines.find((l) => l.id === selectedLineId) || busLines[0];
  const currentDirection = currentLine.directions[directionIdx] || currentLine.directions[0];
  const activeStops: string[] = currentDirection.stops && currentDirection.stops.length > 0 ? currentDirection.stops : currentLine.stops;
  const [selectedStopName, setSelectedStopName] = useState<string>(() => activeStops[0]);

  const handleSelectLine = (id: LineId) => {
    setSelectedLineId(id);
    setDirectionIdx(0);
    const line = busLines.find((l) => l.id === id) || busLines[0];
    const stops: string[] = line.directions[0].stops && line.directions[0].stops.length > 0 ? line.directions[0].stops : line.stops;
    setSelectedStopName(stops[0]);
  };

  const handleToggleDirection = () => {
    setDirectionIdx((prev) => (prev === 0 ? 1 : 0));
  };

  const currentDay = getCurrentTimetableDay();
  const dayName = currentDay === 'weekday' ? 'Dni robocze' : currentDay === 'saturday' ? 'Soboty' : 'Niedziele i święta';
  const timetable = getOfficialStopTimetable(selectedLineId, selectedStopName, directionIdx);
  const nextBus = getNextScheduledBus(timetable[currentDay]);
  const allDepartures = timetable[currentDay] || [];

  return (
    <div className="rounded-2xl bg-white p-4 shadow-xs border border-mist-200 flex flex-col justify-between h-full">
      <div>
        {/* HEADER: Modern & strictly official */}
        <div className="flex items-center justify-between gap-2 border-b border-mist-100 pb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-sky-100 text-sky-800">
              <Bus className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h3 className="text-[13px] font-extrabold text-ink leading-tight truncate">
                Rozkład jazdy ZDiTM
              </h3>
              <p className="text-[10px] text-ink-500 font-medium">
                Wszystkie linie miejskie · {dayName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onOpenMap?.(selectedLineId)}
              className="text-[11px] font-extrabold text-emerald-850 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-300 hover:bg-emerald-100 flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-2xs"
              title="Zobacz mapę linii i pozycję autobusu na żywo"
            >
              <span>🗺️ Mapa na żywo</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenFull?.(selectedLineId, selectedStopName)}
              className="inline-flex items-center gap-0.5 text-[11px] font-extrabold text-sky-700 hover:text-sky-900 transition-colors cursor-pointer"
            >
              <span>Pełny rozkład</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* STEP 1: LINE SELECTOR BUTTONS */}
        <div className="mt-3 grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-mist/60 border border-mist-200">
          {(['M1', 'M2', 'M3', 'M4'] as LineId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => handleSelectLine(id)}
              className={cn(
                'py-1.5 rounded-lg text-center font-display text-[13px] font-extrabold transition-all cursor-pointer',
                selectedLineId === id
                  ? LINE_THEME[id].activeBtn
                  : 'text-ink-600 hover:text-ink hover:bg-white/60'
              )}
            >
              {id}
            </button>
          ))}
        </div>

        {/* STEP 2: DIRECTION TOGGLE */}
        <div className="mt-2.5 flex items-center justify-between gap-2 px-1">
          <div className="min-w-0 flex-1">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-ink-400 block">
              Kierunek trasy:
            </span>
            <p className="text-[12px] font-extrabold text-ink truncate leading-tight">
              ➔ {currentDirection.destination}
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleDirection}
            className="inline-flex items-center gap-1 rounded-lg bg-mist hover:bg-mist-300 px-2.5 py-1 text-[11px] font-bold text-ink-700 transition-colors cursor-pointer shrink-0"
            title="Odwróć kierunek trasy"
          >
            <ArrowRightLeft className="h-3 w-3" />
            <span>Zmień kierunek</span>
          </button>
        </div>

        {/* STEP 3: STOPS STRIP (All stops on route) */}
        <div className="mt-2.5">
          <span className="text-[9.5px] font-bold uppercase tracking-wider text-ink-400 block px-1 mb-1">
            Wybierz przystanek:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {activeStops.map((stopName) => {
              const isActive = selectedStopName.toLowerCase() === stopName.toLowerCase();
              return (
                <button
                  key={stopName}
                  type="button"
                  onClick={() => setSelectedStopName(stopName)}
                  className={cn(
                    'shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer border',
                    isActive
                      ? 'bg-ink text-white border-ink shadow-xs'
                      : 'bg-mist/70 hover:bg-mist text-ink-600 border-mist-200 hover:border-mist-300'
                  )}
                >
                  {stopName}
                </button>
              );
            })}
          </div>
        </div>

        {/* RESULT: NEXT DEPARTURE & UPCOMING TIMETABLE */}
        <div className="mt-3 rounded-xl border border-mist-200/90 bg-mist/35 p-3">
          <div className="flex items-center justify-between gap-3 border-b border-mist-200/80 pb-2.5">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400 block">
                Najbliższy odjazd ({selectedStopName}):
              </span>
              <p className="text-[12.5px] font-extrabold text-ink truncate mt-0.5">
                {currentDirection.name}
              </p>
            </div>
            {nextBus && (
              <div className="rounded-xl bg-ink text-white px-3 py-1.5 font-mono text-[14px] font-black shadow-xs shrink-0">
                {nextBus.isTomorrow ? `Jutro ${nextBus.time}` : nextBus.time}
              </div>
            )}
          </div>

          {/* ALL HOURS IN CLEAN PILLS */}
          <div className="mt-2.5">
            <span className="text-[10px] font-bold text-ink-500 block mb-1">
              Wszystkie godziny odjazdów w tym dniu ({dayName}):
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar py-0.5">
              {allDepartures.map((time, idx) => (
                <span
                  key={idx}
                  className={cn(
                    'rounded-md px-1.5 py-0.5 font-mono text-[11px] font-bold border shadow-2xs',
                    !nextBus?.isTomorrow && nextBus?.time === time
                      ? 'bg-ink text-white border-ink'
                      : 'bg-white border-mist-200 text-ink-700'
                  )}
                >
                  {time}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between text-[11px] pt-2.5 mt-2.5 border-t border-mist-100">
        <span className="text-ink-500 font-medium truncate max-w-[220px] flex items-center gap-1" title={selectedStopName}>
          <MapPin className="h-3 w-3 text-sky-700 shrink-0" />
          <span><b>{selectedStopName}</b></span>
        </span>
        <button
          type="button"
          onClick={() => onOpenFull?.(selectedLineId, selectedStopName)}
          className="font-bold text-sky-700 hover:text-sky-900 flex items-center gap-0.5 shrink-0 cursor-pointer"
        >
          <span>Pełny rozkład ZDiTM</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
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
  onZditmMap?: (line?: LineId) => void;
  polls?: PollItem[];
  userVotes?: Record<string, string>;
  onVote?: (pollId: string, optionId: string) => void;
  onOpenPolls?: () => void;
  city?: string;
  adsList?: Ad[];
  ridesList?: Ride[];
  serviceProviders?: ServiceProvider[];
  onAdClick?: (ad: Ad) => void;
  onAddAd?: () => void;
  onProviderClick?: (provider: ServiceProvider) => void;
  onNeighborClick?: (name: string, street: string) => void;
}

export function HomeScreen({
  user,
  onTab,
  onProfile,
  onPartner,
  onZditm,
  onZditmMap,
  polls = initialPolls,
  userVotes = {},
  onVote,
  onOpenPolls,
  city = 'Mińsk Mazowiecki',
  adsList = initialAds,
  ridesList = initialRides,
  serviceProviders = INITIAL_SERVICE_PROVIDERS,
  onAdClick,
  onAddAd,
  onProviderClick,
  onNeighborClick,
}: HomeScreenProps) {
  const [desktopAlertDismissed, setDesktopAlertDismissed] = useState(false);
  const [postsList, setPostsList] = useState<Post[]>([]);
  const { weather, refreshing, refresh } = useWeather();

  useEffect(() => {
    void fetchPostsFromSupabase().then((res) => {
      if (res) setPostsList(res);
    });
  }, []);

  const activePolls = polls
    .filter((p) => isPollActive(p))
    .sort((a, b) => b.totalVotes - a.totalVotes);
  const featuredPoll = activePolls[0] ?? null;
  const userVoteForFeatured = featuredPoll ? userVotes[featuredPoll.id] : undefined;

  const quick = [
    {
      label: 'Rozkład',
      href: buildZditmMapUrl('M2'),
      icon: Bus,
      cls: 'bg-sky-100 text-ink',
      onClick: () => (onZditmMap ? onZditmMap('M2') : onTab('home')),
    },
    { label: 'Ogłoszenia', href: TAB_PATHS.ads, icon: Megaphone, cls: 'bg-white text-ink', onClick: () => onTab('ads') },
    { label: 'Fachowcy', href: TAB_PATHS.services, icon: Wrench, cls: 'bg-emerald-100 text-ink', onClick: () => onTab('services') },
    { label: 'Przejazd', href: TAB_PATHS.rides, icon: Car, cls: 'bg-coral-100 text-ink', onClick: () => onTab('rides') },
  ];

  const latestAds = adsList.filter((a) => (a.status ?? 'active') === 'active').slice(0, 6);
  const featuredProviders = serviceProviders
    .filter((p) => p.status === 'verified')
    .slice(0, 4);
  const latestPosts = postsList.slice(0, 3);
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
          action={<BuyCoffeeButton variant="pill" />}
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

        <WeatherCard city={city} weather={weather} onRefresh={refresh} refreshing={refreshing} />

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

        <BusWidget onOpenFull={onZditm} onOpenMap={onZditmMap} />

        {news.length > 0 && (
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
        )}

        <FeaturedPollCard
          pollItem={featuredPoll}
          userVoteId={userVoteForFeatured}
          onVote={onVote}
          onOpenPolls={onOpenPolls}
          totalActiveCount={activePolls.length}
        />

        {/* STREFA ZAUFANEJ USŁUGI — MOBILE LIST */}
        {featuredProviders.length > 0 && (
          <section>
            <SectionHeader
              title="Sprawdzeni fachowcy"
              action="Katalog"
              onAction={() => onTab('services')}
            />
            <div className="mx-5 rounded-2xl bg-white border border-mist-200 divide-y divide-mist-100 overflow-hidden shadow-xs">
              {featuredProviders.map((provider) => {
                const stats = computeProviderRatingStats(provider.reviews);
                const cat = getServiceCategoryById(provider.categoryId);
                return (
                  <AppLink
                    key={provider.id}
                    to={buildServiceProviderUrl(provider)}
                    onClick={() =>
                      onProviderClick ? onProviderClick(provider) : onTab('services')
                    }
                    className="flex items-center justify-between gap-3 p-3.5 hover:bg-mist/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={provider.logoUrl || avatarUrl(provider.avatarSeed)}
                        alt={provider.businessName}
                        className="h-10 w-10 shrink-0 rounded-xl bg-sand-100 object-cover ring-1 ring-mist-200"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate font-display text-[14px] font-bold text-ink leading-tight">
                            {provider.businessName}
                          </p>
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        </div>
                        <p className="mt-0.5 truncate text-[11.5px] text-ink-500">
                          {provider.name} · ul. {provider.street} ·{' '}
                          <span className={cn('font-semibold', cat.tone.text)}>{cat.shortLabel}</span>
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1 text-[12px] font-bold text-ink">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                      <span>{stats.count > 0 ? stats.average.toFixed(1) : 'Nowy'}</span>
                    </div>
                  </AppLink>
                );
              })}
            </div>
          </section>
        )}

        <button
          onClick={onPartner}
          className="relative mx-5 block w-[calc(100%-2.5rem)] overflow-hidden rounded-4xl bg-gradient-to-br from-[#162438] via-[#0e243f] to-[#0a1b30] p-5 text-left shadow-card border border-[#4abbc3]/30"
        >
          <Img
            src={partner.hero}
            alt={partner.name}
            className="absolute inset-y-0 right-0 h-full w-3/5 opacity-40 object-cover [mask-image:linear-gradient(to_left,black_60%,transparent)]"
          />
          <div className="relative z-10 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-[#4abbc3] px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-[#0e243f]">
              Partner Tygodnia
            </span>
            <span className="text-[10.5px] font-bold text-[#4abbc3]">grupaadk.pl</span>
          </div>
          <div className="relative z-10 mt-2 flex items-center gap-2.5">
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-white/10 p-1 border border-white/15">
              <Img src={partner.logo} alt="" className="h-full w-full object-contain" />
            </div>
            <p className="font-display text-[21px] font-bold leading-tight text-white">
              {partner.shortName}
            </p>
          </div>
          <p className="relative z-10 mt-1 max-w-[65%] text-[12px] text-white/80">
            <strong className="text-[#4abbc3]">{partner.discount}</strong> na okna, drzwi i pergole + darmowy pomiar z kodem <strong className="text-[#4abbc3]">{partner.code}</strong>
          </p>
          <span className="relative z-10 mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-[#4abbc3] hover:bg-[#3daab2] px-4 py-2 text-[12px] font-extrabold text-[#0e243f] shadow-sm">
            Otwórz Strefę Partnera <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </span>
        </button>

        <BuyCoffeeButton variant="card" className="mx-5" />
      </div>

      {/* =====================================================================
       * 2. DESKTOP VIEW (>= 768px) — 100% Full-Width City Portal & Magazine
       * =================================================================== */}
      <div className="hidden md:block w-full px-8 lg:px-12 py-5 space-y-6">
        {/* DESKTOP WELCOME & COMMUNITY SUPPORT HEADER */}
        <div className="flex items-center justify-between gap-4 border-b border-mist-300/70 pb-4">
          <div>
            <h1 className="font-display text-[22px] font-extrabold tracking-tight text-ink leading-tight">
              {greeting()}, {user ? user.name : 'Sąsiedzie'} 👋
            </h1>
            <p className="mt-0.5 text-[12.5px] font-medium text-ink-500">
              Aktualne wiadomości, komunikacja miejska i sprawy mieszkańców Mińska Mazowieckiego
            </p>
          </div>

          <BuyCoffeeButton variant="desktop-nav" />
        </div>

        {/* OPTIONAL COMPACT CRISIS ALERT BAR */}
        {!desktopAlertDismissed && liveAlert && (
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
                className="grid h-6 w-6 place-items-center rounded-md text-ink-400 hover:bg-mist hover:text-ink cursor-pointer"
                aria-label="Ukryj alert"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ROW 1: CITY STATUS & MOBILITY (Weather & Forecast 8 cols + ZDiTM Departures 4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* WEATHER & HOURLY FORECAST (8 cols) */}
          <div className="lg:col-span-8">
            <DesktopWeatherWidget city={city} weather={weather} onRefresh={refresh} refreshing={refreshing} />
          </div>

          {/* NEAREST ZDiTM DEPARTURES (4 cols) */}
          <div className="lg:col-span-4">
            <DesktopZditmWidget onOpenFull={onZditm} onOpenMap={onZditmMap} />
          </div>
        </div>

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

              {news.length === 0 ? (
                <div className="py-8 text-center text-ink-400">
                  <Newspaper className="mx-auto h-7 w-7 text-ink-300" />
                  <p className="mt-2 text-[13px] font-bold text-ink-700">Brak nowych wiadomości</p>
                  <p className="mt-0.5 text-[11px] text-ink-400">Najświeższe artykuły z lokalnych portali pojawią się wkrótce.</p>
                </div>
              ) : (
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
              )}
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
          <div className="lg:col-span-3 flex flex-col justify-between rounded-2xl bg-gradient-to-b from-[#162438] to-[#0e243f] p-4 text-white shadow-xs border border-[#4abbc3]/30">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center rounded-full bg-[#4abbc3] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0e243f]">
                  Partner Tygodnia
                </span>
                <span className="text-[10.5px] font-bold text-[#4abbc3]">
                  grupaadk.pl
                </span>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[#4abbc3]/30 bg-white/10 p-1">
                  <Img src={partner.logo} alt={partner.name} className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-[15px] font-bold text-white leading-tight truncate">
                    {partner.shortName}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-white/70 truncate">
                    {partner.address}
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-xl bg-white/[.06] border border-[#4abbc3]/20 p-2.5 flex items-center justify-between gap-2">
                <div>
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#4abbc3]">
                    Rabat dla mieszkańców
                  </span>
                  <span className="font-display text-[18px] font-extrabold text-white leading-none">
                    {partner.discount} <span className="text-[11px] font-medium text-white/70">z kodem <strong className="text-[#4abbc3]">{partner.code}</strong></span>
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onPartner}
              className="mt-3 flex w-full items-center justify-between rounded-xl bg-[#4abbc3] px-3.5 py-2 text-[#0e243f] hover:bg-[#3daab2] transition-colors cursor-pointer font-extrabold shadow-sm"
            >
              <span className="text-[11.5px] font-extrabold">Strefa Partnera</span>
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

          {latestAds.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-mist-300 bg-white/70 p-8 text-center shadow-xs">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-coral-100 text-coral-700">
                <Tag className="h-6 w-6" />
              </div>
              <h3 className="mt-3 font-display text-[16px] font-extrabold text-ink">
                Tablica ogłoszeń czeka na pierwsze oferty sąsiadów
              </h3>
              <p className="mt-1 text-[12.5px] text-ink-500 max-w-md mx-auto">
                Wystawiaj meble, elektronikę, ubrania lub usługi bez prowizji i zbędnych pośredników.
              </p>
              <button
                type="button"
                onClick={() => onTab('ads')}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-coral px-4 py-2 text-[12.5px] font-extrabold text-ink hover:bg-coral-600 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Dodaj ogłoszenie jako pierwszy</span>
              </button>
            </div>
          ) : (
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
                          src={avatarUrl(getAdAuthorSeed(ad, user))}
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
          )}
        </section>

        {/* ROW 3.5: STREFA ZAUFANEJ USŁUGI — POLECANI FACHOWCY Z MIŃSKA */}
        {featuredProviders.length > 0 && (
          <section className="rounded-2xl bg-white p-5 shadow-card border border-mist-200">
            <div className="mb-4 flex items-center justify-between border-b border-mist pb-3">
              <div className="flex items-baseline gap-3">
                <h2 className="font-display text-[19px] font-extrabold tracking-tight text-ink">
                  Sprawdzeni fachowcy i firmy z Mińska
                </h2>
                <span className="hidden xl:inline text-[12px] font-medium text-ink-400">
                  Hydraulicy, elektrycy, budowa, stolarka, ogród i reklama
                </span>
              </div>

              <AppLink
                to="/uslugi"
                onClick={() => onTab('services')}
                className="flex items-center gap-1 rounded-lg bg-ink px-3.5 py-1.5 text-[12px] font-bold text-white hover:bg-ink-700 transition-colors"
              >
                <span>Katalog wykonawców ({serviceProviders.filter((p) => p.status === 'verified').length})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </AppLink>
            </div>

            <div className="divide-y divide-mist-100">
              {featuredProviders.map((provider) => {
                const stats = computeProviderRatingStats(provider.reviews);
                const cat = getServiceCategoryById(provider.categoryId);
                return (
                  <AppLink
                    key={provider.id}
                    to={buildServiceProviderUrl(provider)}
                    onClick={() =>
                      onProviderClick ? onProviderClick(provider) : onTab('services')
                    }
                    className="group flex items-center justify-between gap-4 py-3 first:pt-1 last:pb-1 hover:bg-mist/30 rounded-xl px-2 -mx-2 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img
                        src={provider.logoUrl || avatarUrl(provider.avatarSeed)}
                        alt={provider.businessName}
                        className="h-10 w-10 shrink-0 rounded-xl bg-sand-100 object-cover ring-1 ring-mist-200"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-display text-[14.5px] font-bold text-ink group-hover:text-coral-700 transition-colors">
                            {provider.businessName}
                          </h3>
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span
                            className={cn(
                              'rounded px-2 py-0.5 text-[10.5px] font-bold shrink-0 border',
                              cat.tone.bg,
                              cat.tone.text,
                              cat.tone.border,
                            )}
                          >
                            {cat.shortLabel}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-[12px] text-ink-500">
                          <span className="font-semibold text-ink-700">{provider.name}</span> · ul. {provider.street} · {provider.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="flex items-center gap-1 text-[12.5px] font-bold text-ink">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                        {stats.count > 0 ? stats.average.toFixed(1) : 'Nowy'}
                        <span className="text-[11px] font-medium text-ink-400">
                          ({stats.count})
                        </span>
                      </span>
                      <span className="text-[12px] font-bold text-ink-600 group-hover:text-ink flex items-center gap-1">
                        Zobacz profil <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </AppLink>
                );
              })}
            </div>
          </section>
        )}

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

              {latestPosts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-mist-300 bg-mist/20 p-6 text-center">
                  <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-white text-ink-400 shadow-2xs">
                    <MessageCircle className="h-5 w-5 text-coral-600" />
                  </div>
                  <p className="mt-2.5 text-[13px] font-bold text-ink">Strefa dyskusji jest otwarta</p>
                  <p className="mt-1 text-[11.5px] text-ink-500 max-w-sm mx-auto">
                    Bądź pierwszym mieszkańcem, który zada pytanie lub podzieli się wieścią ze swojej ulicy.
                  </p>
                  <button
                    type="button"
                    onClick={() => onTab('talks')}
                    className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg bg-ink px-3.5 py-1.5 text-[12px] font-bold text-white hover:bg-ink-700 transition-colors cursor-pointer"
                  >
                    <span>Napisz na forum</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-mist">
                  {latestPosts.map((p) => {
                    const matchedStreet = resolveStreetName(p.authorAs);
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
                            src={avatarUrl(getPostAuthorSeed(p, user))}
                            alt={p.author}
                            className="h-9 w-9 rounded-full bg-sand-100 object-cover ring-1 ring-mist-300"
                          />
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[13px] font-bold text-ink">
                              {p.author}{' '}
                              <span className="font-semibold text-ink-500">
                                · {formatResidentLabel(p.authorAs)}
                              </span>
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
              )}
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

          {/* RIGHT 5 COLS: Wspólne przejazdy (Carpooling) */}
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

              {upcomingRides.length === 0 ? (
                <div className="rounded-xl border border-dashed border-mist-300 bg-mist/20 p-6 text-center">
                  <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-white text-ink-400 shadow-2xs">
                    <Car className="h-5 w-5 text-sky-600" />
                  </div>
                  <p className="mt-2.5 text-[13px] font-bold text-ink">Brak zaplanowanych przejazdów</p>
                  <p className="mt-1 text-[11.5px] text-ink-500 max-w-sm mx-auto">
                    Dojeżdżasz do Warszawy, szkoły lub pracy? Zaoferuj wolne miejsca sąsiadom!
                  </p>
                  <button
                    type="button"
                    onClick={() => onTab('rides')}
                    className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg bg-ink px-3.5 py-1.5 text-[12px] font-bold text-white hover:bg-ink-700 transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Dodaj przejazd</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {upcomingRides.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => onTab('rides')}
                      className="flex items-center justify-between gap-3 rounded-xl bg-mist/45 p-3 border border-mist-200 hover:bg-mist/80 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={avatarUrl(getRideDriverSeed(r, user))}
                          alt={r.driver}
                          className="h-8 w-8 shrink-0 rounded-full bg-sand-100 object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-bold text-ink">
                            {r.from} ➔ {r.to}
                          </p>
                          <p className="truncate text-[11px] font-medium text-ink-500">
                            {r.driver} · {formatResidentLabel(r.driverAs)} · wyjazd <b className="text-ink">{r.depart}</b>
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
              )}
            </div>
          </section>
        </div>
      </div>

    </>
  );
}
