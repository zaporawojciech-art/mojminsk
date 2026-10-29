import { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  Clock,
  Cloud,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSun,
  Droplets,
  Eye,
  Gauge,
  MapPin,
  Moon,
  RefreshCw,
  ShieldCheck,
  Snowflake,
  Sun,
  TriangleAlert,
  Wind,
  X,
} from 'lucide-react';
import { type WeatherData } from '../services/weatherService';
import { cn } from '../components/ui';

interface WeatherDetailsModalProps {
  weather: WeatherData;
  city?: string;
  onClose: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function WeatherIcon({
  icon,
  isDay = true,
  className = 'h-5 w-5',
}: {
  icon: string;
  isDay?: boolean;
  className?: string;
}) {
  switch (icon) {
    case 'sun':
      return <Sun className={cn('text-amber-500', className)} aria-hidden />;
    case 'moon':
      return <Moon className={cn('text-sky-300', className)} aria-hidden />;
    case 'partly-cloudy':
      return isDay ? (
        <CloudSun className={cn('text-amber-500', className)} aria-hidden />
      ) : (
        <CloudMoon className={cn('text-sky-300', className)} aria-hidden />
      );
    case 'cloudy':
      return <Cloud className={cn('text-ink-500', className)} aria-hidden />;
    case 'rain':
      return <CloudRain className={cn('text-sky-600', className)} aria-hidden />;
    case 'thunderstorm':
      return <CloudLightning className={cn('text-amber-600', className)} aria-hidden />;
    case 'snow':
      return <Snowflake className={cn('text-sky-400', className)} aria-hidden />;
    default:
      return isDay ? (
        <Sun className={cn('text-amber-500', className)} aria-hidden />
      ) : (
        <Moon className={cn('text-sky-300', className)} aria-hidden />
      );
  }
}

export function WeatherDetailsModal({
  weather,
  city = 'Mińsk Mazowiecki',
  onClose,
  onRefresh,
  refreshing = false,
}: WeatherDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'hourly' | 'daily' | 'biomet'>('hourly');

  // Skrajne temperatury tygodnia do rysowania paska min-max
  const allMax = Math.max(...weather.daily.map((d) => d.maxTemp), weather.max);
  const allMin = Math.min(...weather.daily.map((d) => d.minTemp), weather.min);
  const tempRange = Math.max(1, allMax - allMin);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-ink/70 backdrop-blur-sm animate-fade-in overflow-y-auto"
    >
      <div className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-mist-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* TOP HERO HEADER */}
        <div className="relative bg-gradient-to-br from-sky/40 via-sky/20 to-sand/20 p-5 sm:p-7 border-b border-sky-200/60 shrink-0">
          {/* Subtle ambient circle */}
          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/20 pointer-events-none" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-[12.5px] font-bold text-ink/75">
                <MapPin className="h-4 w-4 text-coral-700" />
                <span>{city}</span>
                <span className="text-ink-300">·</span>
                <span className="text-[11.5px] font-medium text-ink-600">Stacja GIOŚ & Open-Meteo</span>
              </div>

              <div className="mt-2 flex items-baseline gap-4">
                <span className="font-display text-[52px] sm:text-[62px] font-extrabold leading-none tracking-tighter text-ink">
                  {weather.temp}°
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <WeatherIcon icon={weather.icon} isDay={weather.isDay} className="h-6 w-6" />
                    <span className="font-display text-[18px] sm:text-[20px] font-bold text-ink">
                      {weather.condition}
                    </span>
                  </div>
                  <p className="text-[12.5px] font-medium text-ink/70 mt-0.5">
                    Odczuwalna {weather.feels}° · Dzisiaj: ↑{weather.max}° / ↓{weather.min}°
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[11.5px] font-bold text-ink shadow-2xs border border-mist-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Powietrze: {weather.aqi.label} (PM2.5: {weather.aqi.pm25} µg/m³)
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-ink-700">
                  Wschód: {weather.sunrise} · Zachód: {weather.sunset}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onRefresh && (
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={refreshing}
                  className="grid h-9 w-9 place-items-center rounded-xl bg-white/80 text-ink hover:bg-white transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  title="Odśwież dane z Open-Meteo"
                >
                  <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin text-sky-700')} />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-xl bg-white/80 text-ink hover:bg-white transition-all shadow-xs cursor-pointer"
                aria-label="Zamknij"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* ACTIVE WEATHER ALERTS */}
          {weather.alerts && weather.alerts.length > 0 && (
            <div className="mt-4 space-y-2">
              {weather.alerts.map((al) => (
                <div
                  key={al.id}
                  className={cn(
                    'flex items-start gap-2.5 rounded-2xl p-3 text-[12px] shadow-xs border',
                    al.level === 'warning'
                      ? 'bg-coral-50 border-coral-200 text-coral-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  )}
                >
                  <TriangleAlert className="h-4 w-4 shrink-0 mt-0.5 text-coral-700" />
                  <div>
                    <p className="font-extrabold leading-snug">{al.title}</p>
                    <p className="mt-0.5 text-[11px] opacity-90 leading-relaxed">{al.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center border-b border-mist-200 px-5 pt-2 bg-mist/30 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('hourly')}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-bold border-b-2 transition-all cursor-pointer',
              activeTab === 'hourly'
                ? 'border-ink text-ink font-extrabold'
                : 'border-transparent text-ink-500 hover:text-ink'
            )}
          >
            <Clock className="h-4 w-4" />
            <span>Prognoza 24h</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('daily')}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-bold border-b-2 transition-all cursor-pointer',
              activeTab === 'daily'
                ? 'border-ink text-ink font-extrabold'
                : 'border-transparent text-ink-500 hover:text-ink'
            )}
          >
            <Calendar className="h-4 w-4" />
            <span>Kolejne 7 dni</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('biomet')}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-bold border-b-2 transition-all cursor-pointer',
              activeTab === 'biomet'
                ? 'border-ink text-ink font-extrabold'
                : 'border-transparent text-ink-500 hover:text-ink'
            )}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Jakość powietrza i biomet</span>
          </button>
        </div>

        {/* TAB CONTENTS (SCROLLABLE) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: 24H HOURLY FORECAST */}
          {activeTab === 'hourly' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[12px] text-ink-500 font-medium">
                <span>Temperatura i prawdopodobieństwo opadów co godzinę</span>
                <span>Aktualizacja: {weather.lastUpdated}</span>
              </div>

              {/* Horizontal scroll timeline */}
              <div className="flex gap-2.5 overflow-x-auto pb-3 pt-1 no-scrollbar">
                {weather.hourly.map((h, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex w-[76px] shrink-0 flex-col items-center justify-between rounded-2xl p-3 text-center transition-all shadow-xs',
                      i === 0
                        ? 'bg-ink text-white ring-2 ring-ink'
                        : 'bg-mist/50 hover:bg-mist text-ink border border-mist-200'
                    )}
                  >
                    <p className={cn('text-[10.5px] font-bold', i === 0 ? 'text-white/80' : 'text-ink-500')}>
                      {h.timeStr}
                    </p>

                    <div className="my-2 flex flex-col items-center gap-0.5 min-h-[38px] justify-center">
                      <WeatherIcon icon={h.icon} isDay={h.isDay} className="h-5 w-5" />
                      {h.rainChance >= 20 ? (
                        <span className={cn('text-[9.5px] font-extrabold', i === 0 ? 'text-sky-300' : 'text-sky-700')}>
                          {h.rainChance}%
                        </span>
                      ) : (
                        <span className="h-3.5" />
                      )}
                    </div>

                    <p className="font-display text-[16px] font-bold leading-none">{h.temp}°</p>
                    <p className={cn('text-[9.5px] mt-0.5 font-medium', i === 0 ? 'text-white/60' : 'text-ink-400')}>
                      odcz. {h.feels}°
                    </p>

                    <div className="mt-2 pt-1.5 border-t border-ink/10 w-full flex items-center justify-center gap-1 text-[9px] font-semibold text-ink-500">
                      <Wind className="h-2.5 w-2.5" />
                      <span>{h.windSpeed} km/h</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sun & Daylight Banner */}
              <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-sky-50 border border-amber-200/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-800">
                    <Sun className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[13px] font-bold text-ink">Cykl słoneczny w Mińsku Mazowieckim</p>
                    <p className="text-[11.5px] text-ink-600">
                      Wschód: <b>{weather.sunrise}</b> · Zachód: <b>{weather.sunset}</b>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[12px] font-semibold text-ink-700">
                  <div className="text-right">
                    <span className="block text-[10px] text-ink-400 font-bold uppercase">Długość dnia</span>
                    <span className="font-bold text-ink">{weather.dayLength}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] text-ink-400 font-bold uppercase">Indeks UV</span>
                    <span className="font-bold text-amber-700">{weather.uv} ({weather.uvLabel})</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 7-DAY DAILY FORECAST */}
          {activeTab === 'daily' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[12px] text-ink-500 font-medium">
                <span>Długoterminowa prognoza pogody dla powiatu mińskiego</span>
                <span>Model DWD ICON / ECMWF</span>
              </div>

              <div className="divide-y divide-mist-200 rounded-2xl border border-mist-200 bg-white overflow-hidden shadow-xs">
                {weather.daily.map((d, idx) => {
                  // Pozycja słupka min-max
                  const leftPercent = Math.max(0, Math.min(100, ((d.minTemp - allMin) / tempRange) * 100));
                  const widthPercent = Math.max(12, Math.min(100 - leftPercent, ((d.maxTemp - d.minTemp) / tempRange) * 100));

                  return (
                    <div
                      key={d.date}
                      className={cn(
                        'flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-3 hover:bg-mist/30 transition-colors',
                        idx === 0 && 'bg-sky-50/40'
                      )}
                    >
                      {/* Dzień tygodnia i data */}
                      <div className="flex items-center gap-3 w-40 shrink-0">
                        <WeatherIcon icon={d.icon} isDay className="h-6 w-6 shrink-0" />
                        <div>
                          <p className="text-[13.5px] font-bold text-ink leading-tight">
                            {d.dayName} {idx === 0 && <span className="text-[10px] text-sky-700 font-extrabold">(dzisiaj)</span>}
                          </p>
                          <p className="text-[11px] text-ink-400 font-medium">{d.fullDate}</p>
                        </div>
                      </div>

                      {/* Opis i opady */}
                      <div className="flex items-center gap-3 w-48 shrink-0">
                        <div className="min-w-0">
                          <p className="text-[12.5px] font-semibold text-ink truncate">{d.condition}</p>
                          {d.rainChance > 0 ? (
                            <p className="text-[11px] font-bold text-sky-700 flex items-center gap-1">
                              <Droplets className="h-3 w-3" />
                              <span>{d.rainChance}% ({d.rainSum} mm)</span>
                            </p>
                          ) : (
                            <p className="text-[11px] text-ink-400">Bez opadów</p>
                          )}
                        </div>
                      </div>

                      {/* Słupek zakresu temperatur min-max */}
                      <div className="flex items-center gap-3 flex-1 min-w-[140px] max-w-xs">
                        <span className="text-[12.5px] font-semibold text-ink-500 w-8 text-right shrink-0">
                          {d.minTemp}°
                        </span>

                        <div className="relative h-2 w-full rounded-full bg-mist-300 overflow-hidden">
                          <div
                            className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-coral"
                            style={{
                              left: `${leftPercent}%`,
                              width: `${widthPercent}%`,
                            }}
                          />
                        </div>

                        <span className="text-[13.5px] font-bold text-ink w-8 shrink-0">
                          {d.maxTemp}°
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: AIR QUALITY & BIOMET */}
          {activeTab === 'biomet' && (
            <div className="space-y-5">
              {/* AIR QUALITY CARD */}
              <div className="rounded-2xl border border-mist-200 bg-white p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-mist-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                    <div>
                      <h4 className="text-[14px] font-bold text-ink">Jakość Powietrza w Mińsku Mazowieckim</h4>
                      <p className="text-[11px] text-ink-500">Stacja monitoringu jakości powietrza GIOŚ & Open-Meteo</p>
                    </div>
                  </div>

                  <span className={cn('rounded-full px-3 py-1 text-[11.5px] font-extrabold border', weather.aqi.color)}>
                    {weather.aqi.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  <div className="rounded-xl bg-mist/50 p-3">
                    <span className="text-[11px] font-bold text-ink-500 uppercase">Pył PM2.5</span>
                    <p className="font-display text-[22px] font-extrabold text-ink leading-tight mt-0.5">
                      {weather.aqi.pm25} <span className="text-[12px] font-medium text-ink-500">µg/m³</span>
                    </p>
                    <span className="text-[10px] text-ink-400">Norma WHO: 15 µg/m³</span>
                  </div>

                  <div className="rounded-xl bg-mist/50 p-3">
                    <span className="text-[11px] font-bold text-ink-500 uppercase">Pył PM10</span>
                    <p className="font-display text-[22px] font-extrabold text-ink leading-tight mt-0.5">
                      {weather.aqi.pm10} <span className="text-[12px] font-medium text-ink-500">µg/m³</span>
                    </p>
                    <span className="text-[10px] text-ink-400">Norma WHO: 45 µg/m³</span>
                  </div>

                  <div className="col-span-2 sm:col-span-1 rounded-xl bg-mist/50 p-3">
                    <span className="text-[11px] font-bold text-ink-500 uppercase">Indeks Europejski</span>
                    <p className="font-display text-[22px] font-extrabold text-ink leading-tight mt-0.5">
                      {weather.aqi.europeanAqi} <span className="text-[12px] font-medium text-ink-500">AQI</span>
                    </p>
                    <span className="text-[10px] text-emerald-700 font-bold">Poziom bezpieczny</span>
                  </div>
                </div>

                <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/70 p-3 text-[12px] text-emerald-900 leading-relaxed">
                  <b>Zalecenie zdrowotne:</b> {weather.aqi.recommendation}
                </div>
              </div>

              {/* BIOMET 6-PACK GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* 1. Ciśnienie atmosferyczne */}
                <div className="rounded-2xl border border-mist-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center justify-between text-ink-500">
                    <span className="text-[11.5px] font-bold uppercase">Ciśnienie</span>
                    <Gauge className="h-4 w-4 text-sky-700" />
                  </div>
                  <p className="font-display text-[24px] font-bold text-ink mt-2 leading-none">
                    {weather.pressure} <span className="text-[13px] font-medium text-ink-500">hPa</span>
                  </p>
                  <p className="text-[11px] font-semibold text-ink-600 mt-2 flex items-center gap-1">
                    {weather.pressureTrend === 'rising' && (
                      <span className="text-emerald-700 flex items-center gap-0.5 font-bold">
                        <ArrowUp className="h-3 w-3" /> Rośnie (korzystne)
                      </span>
                    )}
                    {weather.pressureTrend === 'falling' && (
                      <span className="text-coral-700 flex items-center gap-0.5 font-bold">
                        <ArrowDown className="h-3 w-3" /> Spada (meteopatia)
                      </span>
                    )}
                    {weather.pressureTrend === 'steady' && (
                      <span className="text-ink-600 font-bold">Tendencja: stabilna</span>
                    )}
                  </p>
                </div>

                {/* 2. Indeks UV */}
                <div className="rounded-2xl border border-mist-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center justify-between text-ink-500">
                    <span className="text-[11.5px] font-bold uppercase">Indeks UV</span>
                    <Sun className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="font-display text-[24px] font-bold text-ink mt-2 leading-none">
                    {weather.uv} <span className="text-[13px] font-medium text-ink-500">/ 11</span>
                  </p>
                  <p className="text-[11px] font-semibold text-amber-700 mt-2">
                    {weather.uvLabel} {weather.uv >= 3 ? '· zalecany krem z filtrem' : '· ochrona zbędna'}
                  </p>
                </div>

                {/* 3. Wiatr i porywy */}
                <div className="rounded-2xl border border-mist-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center justify-between text-ink-500">
                    <span className="text-[11.5px] font-bold uppercase">Wiatr</span>
                    <Wind className="h-4 w-4 text-sky-700" />
                  </div>
                  <p className="font-display text-[24px] font-bold text-ink mt-2 leading-none">
                    {weather.wind} <span className="text-[13px] font-medium text-ink-500">km/h</span>
                  </p>
                  <p className="text-[11px] font-medium text-ink-500 mt-2 truncate">
                    Porywy: <b>{weather.windGusts} km/h</b> · {weather.windDirectionLabel}
                  </p>
                </div>

                {/* 4. Wilgotność i punkt rosy */}
                <div className="rounded-2xl border border-mist-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center justify-between text-ink-500">
                    <span className="text-[11.5px] font-bold uppercase">Wilgotność</span>
                    <Droplets className="h-4 w-4 text-sky-600" />
                  </div>
                  <p className="font-display text-[24px] font-bold text-ink mt-2 leading-none">
                    {weather.humidity}%
                  </p>
                  <p className="text-[11px] font-medium text-ink-500 mt-2">
                    Punkt rosy: <b>{weather.dewPoint}°C</b>
                  </p>
                </div>

                {/* 5. Widoczność */}
                <div className="rounded-2xl border border-mist-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center justify-between text-ink-500">
                    <span className="text-[11.5px] font-bold uppercase">Widoczność</span>
                    <Eye className="h-4 w-4 text-ink-600" />
                  </div>
                  <p className="font-display text-[24px] font-bold text-ink mt-2 leading-none">
                    {weather.visibility} <span className="text-[13px] font-medium text-ink-500">km</span>
                  </p>
                  <p className="text-[11px] font-medium text-ink-500 mt-2">
                    {weather.visibility >= 10 ? 'Doskonała widoczność na DK92' : 'Ograniczona widoczność'}
                  </p>
                </div>

                {/* 6. Opady */}
                <div className="rounded-2xl border border-mist-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center justify-between text-ink-500">
                    <span className="text-[11.5px] font-bold uppercase">Opady bieżące</span>
                    <CloudRain className="h-4 w-4 text-sky-700" />
                  </div>
                  <p className="font-display text-[24px] font-bold text-ink mt-2 leading-none">
                    {weather.rain} <span className="text-[13px] font-medium text-ink-500">mm</span>
                  </p>
                  <p className="text-[11px] font-medium text-ink-500 mt-2">
                    Suma za ostatnie 24h
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="border-t border-mist-200 p-3.5 px-6 bg-mist/20 flex flex-wrap items-center justify-between gap-3 text-[11.5px] text-ink-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Dane Open-Meteo & stacja GIOŚ Mińsk Mazowiecki</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-ink px-4 py-1.5 text-[12px] font-bold text-white hover:bg-ink-700 transition-colors cursor-pointer"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}
